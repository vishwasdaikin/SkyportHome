# Thermostat location data (static)

- `locations-per-state.csv` — state/province totals for the choropleth.
- `locations-per-city.csv` — city names + counts (no state column).
- `locations-per-country.csv` — ISO country codes + counts for the whole export.
- `canada-provinces.geojson` — province/territory boundaries for the Canada choropleth (from [click_that_hood](https://github.com/codeforamerica/click_that_hood)).
- `city-counts-by-us-state.json` — **generated**; run `npm run build:city-state-data` after updating the city CSV.
- `city-hotspots.json` — **generated** geocoded city markers for maps; run `npm run build:city-hotspots` (included in `npm run build`).

Replace the CSVs when you get a new SDI export, then run a full `npm run build` (or at least `build:city-state-data`) so the city JSON stays in sync.
