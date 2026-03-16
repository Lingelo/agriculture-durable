# Agriculture Durable

Carte croisee des exploitations bio et des ventes de pesticides par departement.

## Fonctionnalites

- Carte Leaflet avec double couche toggleable : markers bio + choropleth pesticides
- 89 000+ fermes bio geolocalises
- Choropleth des ventes de pesticides par departement
- Legende dynamique
- Filtre par type de production agricole
- Sidebar avec statistiques departementales et ventilation des pesticides par fonction
- Donnees DOM-TOM incluses

## Sources de donnees

| Source | API / URL | Frequence |
|--------|-----------|-----------|
| Exploitations bio | Agence Bio API (opendata.agencebio.org) — 133K operateurs | Quotidienne |
| Ventes de pesticides | Hub'Eau API (hubeau.eaufrance.fr) — ventes par departement | Annuelle |
| Contours departementaux | GeoJSON des departements francais | Statique |

## Commandes

```bash
npm run dev          # Serveur de developpement Vite
npm run build        # Build de production (tsc + vite build)
npm run lint         # ESLint
npm run preview      # Preview du build

npm run fetch:all        # Rafraichir toutes les donnees
npm run fetch:bio        # Rafraichir les donnees bio uniquement
npm run fetch:pesticides # Rafraichir les donnees pesticides uniquement
npm run fetch:geo        # Rafraichir les contours departementaux
```

## Stack technique

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Leaflet / react-leaflet
- MarkerCluster

## Mise a jour automatique des donnees

GitHub Actions workflow executant le rafraichissement des donnees chaque lundi a 6h UTC. Les fichiers JSON mis a jour sont commites automatiquement.

## Deploiement

GitHub Pages via GitHub Actions.
