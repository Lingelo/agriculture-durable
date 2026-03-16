import { useEffect, useRef, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import type { BioFarm, DepartmentPesticides } from '../types';
import type { FeatureCollection, Feature } from 'geojson';
import { getPesticideColor, getPesticideOpacity } from '../utils/colors';
import { renderBioPopupHTML } from '../utils/bio-popup';
import { formatKg } from '../utils/format';

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
  showBio: boolean;
  showPesticides: boolean;
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
      map.removeLayer(clusterRef.current);
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
        map.removeLayer(clusterRef.current);
        clusterRef.current = null;
      }
    };
  }, [map, farms, visible]);

  return null;
}

function ChoroplethLayer({
  geo,
  pesticides,
  visible,
  onDepartmentClick,
  selectedDept,
}: {
  geo: FeatureCollection;
  pesticides: Record<string, DepartmentPesticides>;
  visible: boolean;
  onDepartmentClick: (deptCode: string | null) => void;
  selectedDept: string | null;
}) {
  const maxTotal = useMemo(() => {
    return Math.max(...Object.values(pesticides).map((d) => d.total), 1);
  }, [pesticides]);

  const style = useCallback(
    (feature: Feature | undefined) => {
      if (!feature || !visible) {
        return { fillOpacity: 0, weight: 0, opacity: 0 };
      }
      const code = feature.properties?.code as string | undefined;
      const data = code ? pesticides[code] : undefined;
      const total = data?.total ?? 0;
      const isSelected = code === selectedDept;

      return {
        fillColor: getPesticideColor(total, maxTotal),
        fillOpacity: visible ? getPesticideOpacity(total, maxTotal) : 0,
        color: isSelected ? '#1e40af' : '#6b7280',
        weight: isSelected ? 3 : 1,
        opacity: visible ? 0.6 : 0,
      };
    },
    [pesticides, maxTotal, visible, selectedDept],
  );

  const onEachFeature = useCallback(
    (feature: Feature, layer: L.Layer) => {
      const code = feature.properties?.code as string | undefined;
      const data = code ? pesticides[code] : undefined;
      const name = (feature.properties?.nom as string) ?? code ?? '';

      // Tooltip
      const tooltipContent = data
        ? `<strong>${name}</strong><br/>Pesticides: ${formatKg(data.total)}`
        : `<strong>${name}</strong>`;

      (layer as L.Path).bindTooltip(tooltipContent, {
        sticky: true,
        className: 'leaflet-tooltip',
      });

      // Click
      (layer as L.Path).on('click', () => {
        if (code) onDepartmentClick(code);
      });

      // Hover
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
    [pesticides, onDepartmentClick, selectedDept],
  );

  if (!visible) return null;

  return (
    <GeoJSON
      key={`choropleth-${selectedDept ?? 'none'}`}
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
  showBio,
  showPesticides,
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
          visible={showPesticides}
          onDepartmentClick={onDepartmentClick}
          selectedDept={selectedDept}
        />
      )}

      <BioMarkerLayer farms={bioFarms} visible={showBio} />
    </MapContainer>
  );
}
