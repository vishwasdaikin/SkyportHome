# Skyport Web

A simple site built from your content. One page, one tab (Digital Strategy), with sections you can paste into.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Blank screen or nothing loads

1. **Use the dev URL** — Open `http://localhost:5173` in Chrome/Safari/Edge. Don’t open `index.html` from the file system.
2. **Run the dev server** — In the project folder: `npm run dev`. If the tab stays on “Loading…”, check the terminal for errors.
3. **`.env.local`** — If you copied `.env.example` and set `VITE_USE_BACKEND_AUTH=1`, the app needs **Skyport-Core** on port 3001. Without it, you’ll see an error after ~12s (or fix Core / unset that variable). For a quick local run with no backend, leave `VITE_USE_BACKEND_AUTH` unset and leave Microsoft Entra IDs empty.
4. **Microsoft sign-in** — If Entra is configured, the app redirects to Microsoft; finish sign-in or fix redirect URIs in Azure (see `docs/SSO_SETUP.md`).
5. **Deployed site** — Open DevTools → **Network**: if `index-D….js` or `index-….css` is **404**, the build used the wrong **asset base**. Sites at `https://<user>.github.io/<RepoName>/` must be built with `VITE_BASE_PATH=/<RepoName>/` or deploy via this repo’s **GitHub Actions → Deploy GitHub Pages** workflow (`VITE_GITHUB_PAGES=1`). Root hosts (Vercel default, custom domain at `/`) keep the default base `/`.

## Adding your content

**Option 1 — Paste in chat**  
Paste your content here (in Cursor) and we’ll turn it into sections and update the site.

**Option 2 — Edit the file**  
Edit **`src/content/content.js`**. Each section has a `title` and `content` (plain text; blank lines become paragraphs). Add or remove sections in the array.

## Build for production

```bash
npm run build
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, GitHub Pages, etc.).
