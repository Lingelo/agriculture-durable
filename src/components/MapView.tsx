import { useEffect, useRef, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import type { BioFarm, DepartmentPesticides, MapMode, SAUData } from '../types';
import type { FeatureCollection, Feature } from 'geojson';
import { getPesticideColor, getPesticideOpacity, getParadoxColor } from '../utils/colors';
import { renderBioPopupHTML } from '../utils/bio-popup';
import { formatKg, formatPerHa, formatNumber } from '../utils/format';

// Fix default marker icons in bundled environments
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Props {
  bioFarms: BioFarm[];
  pesticides: Record<string, DepartmentPesticides> | null;
  departmentsGeo: FeatureCollection | null;
  sau: SAUData | null;
  bioByDept: Map<string, number>;
  showBio: boolean;
  showPesticides: boolean;
  mapMode: MapMode;
  onDepartmentClick: (deptCode: string | null) => void;
  selectedDept: string | null;
}

const FRANCE_CENTER: [number, number] = [46.6, 2.5];
const FRANCE_ZOOM = 6;

/** Small green circle icon for bio farms */
function createBioIcon(): L.DivIcon {
  return L.divIcon({
    html: '<div style="width:8px;height:8px;border-radius:50%;background:#059669;border:1.5px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>',
    className: '',
    iconSize: [8, 8],
    iconAnchor: [4, 4],
    popupAnchor: [0, -6],
  });
}

function BioMarkerLayer({
  farms,
  visible,
}: {
  farms: BioFarm[];
  visible: boolean;
}) {
  const map = useMap();
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (clusterRef.current) {
      try { map.removeLayer(clusterRef.current); } catch { /* already removed */ }
      clusterRef.current = null;
    }

    if (!visible || farms.length === 0) return;

    const cluster = L.markerClusterGroup({
      chunkedLoading: true,
      chunkInterval: 100,
      chunkDelay: 10,
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      disableClusteringAtZoom: 14,
      removeOutsideVisibleBounds: true,
    });

    const icon = createBioIcon();

    for (const farm of farms) {
      const marker = L.marker([farm.lat, farm.lng], { icon });
      marker.bindPopup(renderBioPopupHTML(farm), { maxWidth: 280 });
      cluster.addLayer(marker);
    }

    map.addLayer(cluster);
    clusterRef.current = cluster;

    return () => {
      if (clusterRef.current) {
        try { map.removeLayer(clusterRef.current); } catch { /* already removed */ }
        clusterRef.current = null;
      }
    };
  }, [map, farms, visible]);

  return null;
}

/** Fly to department when selected */
function FlyToDept({ deptCode, geo }: { deptCode: string | null; geo: FeatureCollection | null }) {
  const map = useMap();
  const prevDept = useRef<string | null>(null);

  useEffect(() => {
    if (!deptCode || !geo || deptCode === prevDept.current) return;
    prevDept.current = deptCode;

    const feature = geo.features.find(
      (f) => f.properties?.code === deptCode,
    );
    if (!feature) return;

    const layer = L.geoJSON(feature);
    const bounds = layer.getBounds();
    map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 9 });
  }, [deptCode, geo, map]);

  return null;
}

function ChoroplethLayer({
  geo,
  pesticides,
  sau,
  bioByDept,
  visible,
  mapMode,
  onDepartmentClick,
  selectedDept,
}: {
  geo: FeatureCollection;
  pesticides: Record<string, DepartmentPesticides>;
  sau: SAUData | null;
  bioByDept: Map<string, number>;
  visible: boolean;
  mapMode: MapMode;
  onDepartmentClick: (deptCode: string | null) => void;
  selectedDept: string | null;
}) {
  // Compute values for current mode
  const { valueMap, maxVal } = useMemo(() => {
    const vm = new Map<string, number>();
    for (const [code, d] of Object.entries(pesticides)) {
      const sauHa = sau?.departments[code] ?? 0;
      const bio = bioByDept.get(code) ?? 0;
      let val = 0;
      if (mapMode === 'pesticides') {
        val = d.total;
      } else if (mapMode === 'pesticides_ha') {
        val = sauHa > 0 ? d.total / sauHa : 0;
      } else {
        // paradoxe: pesticides/ha × log(bio+1)
        const perHa = sauHa > 0 ? d.total / sauHa : 0;
        val = perHa * Math.log10(bio + 1);
      }
      vm.set(code, val);
    }
    return { valueMap: vm, maxVal: Math.max(...vm.values(), 1) };
  }, [pesticides, sau, bioByDept, mapMode]);

  const style = useCallback(
    (feature: Feature | undefined) => {
      if (!feature || !visible) {
        return { fillOpacity: 0, weight: 0, opacity: 0 };
      }
      const code = feature.properties?.code as string | undefined;
      const val = code ? (valueMap.get(code) ?? 0) : 0;
      const isSelected = code === selectedDept;

      const colorFn = mapMode === 'paradoxe' ? getParadoxColor : getPesticideColor;

      return {
        fillColor: colorFn(val, maxVal),
        fillOpacity: visible ? getPesticideOpacity(val, maxVal) : 0,
        color: isSelected ? '#1e40af' : '#6b7280',
        weight: isSelected ? 3 : 1,
        opacity: visible ? 0.6 : 0,
      };
    },
    [valueMap, maxVal, visible, selectedDept, mapMode],
  );

  const onEachFeature = useCallback(
    (feature: Feature, layer: L.Layer) => {
      const code = feature.properties?.code as string | undefined;
      const data = code ? pesticides[code] : undefined;
      const name = (feature.properties?.nom as string) ?? code ?? '';
      const val = code ? (valueMap.get(code) ?? 0) : 0;
      const bio = code ? (bioByDept.get(code) ?? 0) : 0;
      const sauHa = code ? (sau?.departments[code] ?? 0) : 0;

      let tooltipContent = `<strong>${name}</strong>`;
      if (data) {
        if (mapMode === 'pesticides') {
          tooltipContent += `<br/>Pesticides: ${formatKg(data.total)}`;
        } else if (mapMode === 'pesticides_ha') {
          tooltipContent += `<br/>${formatPerHa(data.total, sauHa)}`;
        } else {
          tooltipContent += `<br/>${formatNumber(bio)} bio | ${formatPerHa(data.total, sauHa)}`;
        }
      }

      (layer as L.Path).bindTooltip(tooltipContent, {
        sticky: true,
        className: 'leaflet-tooltip',
      });

      (layer as L.Path).on('click', () => {
        if (code) onDepartmentClick(code);
      });
      (layer as L.Path).on('mouseover', () => {
        (layer as L.Path).setStyle({ weight: 2, opacity: 0.9 });
      });
      (layer as L.Path).on('mouseout', () => {
        const isSelected = code === selectedDept;
        (layer as L.Path).setStyle({
          weight: isSelected ? 3 : 1,
          opacity: 0.6,
        });
      });
    },
    [pesticides, sau, bioByDept, valueMap, onDepartmentClick, selectedDept, mapMode],
  );

  if (!visible) return null;

  return (
    <GeoJSON
      key={`choropleth-${selectedDept ?? 'none'}-${mapMode}`}
      data={geo}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
}

export function MapView({
  bioFarms,
  pesticides,
  departmentsGeo,
  sau,
  bioByDept,
  showBio,
  showPesticides,
  mapMode,
  onDepartmentClick,
  selectedDept,
}: Props) {
  return (
    <MapContainer
      center={FRANCE_CENTER}
      zoom={FRANCE_ZOOM}
      className="h-full w-full"
      zoomControl={false}
      minZoom={3}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {departmentsGeo && pesticides && (
        <ChoroplethLayer
          geo={departmentsGeo}
          pesticides={pesticides}
          sau={sau}
          bioByDept={bioByDept}
          visible={showPesticides}
          mapMode={mapMode}
          onDepartmentClick={onDepartmentClick}
          selectedDept={selectedDept}
        />
      )}

      <BioMarkerLayer farms={bioFarms} visible={showBio} />
      <FlyToDept deptCode={selectedDept} geo={departmentsGeo} />
    </MapContainer>
  );
}
