# Live link to `Test.xlsx` (development)

## How it works

1. Keep **`Test.xlsx`** in the **project root** (same folder as `package.json`).
2. Run **`npm run dev`**.
3. A small Vite plugin reads that file **on every request** to  
   **`/local-data/test-sheet.json`** (no cache), so when you **save** the workbook, the next poll gets new data.
4. The hook **`useTestSheetData()`** in `src/hooks/useTestSheetData.js` fetches that URL every **4 seconds** (configurable).

## Demo page

Open **`/dev/test-xlsx`** after signing in (same auth as the rest of the app).

The demo loads **every worksheet tab** from the workbook. It **defaults to the FY23** tab when that sheet exists. FY## sheets with a “wide” layout (month names across columns, metrics in rows) get a second dropdown to pick the **metric**; the default is **Monthly Daikin Smart Thermostat Sales** when that row exists. Other tabs use the **first column** as labels and the **first numeric column** as values.

## JSON shape (`GET /local-data/test-sheet.json`)

- **`sheetNames`** — array of tab names (same order as Excel).
- **`sheets`** — object `{ [tabName]: row[] }` where each row is `{ columnHeader: value, ... }` from `sheet_to_json`.

Legacy fields **`sheetName`** and **`rows`** (first tab only) are still included for older code.

## Use in your own page

```jsx
import { useTestSheetData } from '../hooks/useTestSheetData'

const { sheetNames, sheets, getRows, defaultSheetName, loading, error, refetch } =
  useTestSheetData({ pollMs: 5000 })

const rows = getRows('My Tab Name') // or sheets['My Tab Name']
```

## Production

The plugin only runs in **`vite` dev server**. It does **not** run in `vite build` / `vite preview`.

For production you typically:

- Expose the same JSON from **Skyport Core** or another API, or  
- Export CSV/JSON to **`public/`** and fetch that (replace `SHEET_JSON_URL` in the hook), or  
- Run a tiny Node service that reads the xlsx and serves JSON.

## Note on `/api`

`/api/*` is **proxied to Skyport Core**, so this feature uses **`/local-data/...`** instead to avoid clashes.
