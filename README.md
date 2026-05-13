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
3. **Skyport-Core** — Sign-in requires **Skyport-Core** on port 3001 (see `docs/BACKEND_AUTH.md`). Terminal 1: `cd Skyport-Core && npm run dev`. Terminal 2: `npm run dev` here. Without Core, you’ll see an error after ~12s. For a **local UI-only demo**, set `VITE_SKIP_AUTH=1` in `.env.local` (never in production).
4. **Microsoft sign-in** — Entra is configured on Core; the Web app uses `/api/auth/login` and a **Web** redirect URI on your Skyport-Web origin (see `docs/SSO_SETUP.md`).
5. **Deployed site** — Open DevTools → **Network**: if `index-D….js` or `index-….css` is **404**, the build used the wrong **asset base**. Sites at `https://<user>.github.io/<RepoName>/` must be built with `VITE_BASE_PATH=/<RepoName>/` or deploy via this repo’s **GitHub Actions → Deploy GitHub Pages** workflow (`VITE_GITHUB_PAGES=1`). Root hosts (Vercel default, custom domain at `/`) keep the default base `/`.

6. **“Not seeing the latest UI change”** — Hard-refresh the tab (**Cmd+Shift+R** / **Ctrl+Shift+R**) or try a private window. On **Vercel**, open the project → **Deployments** and confirm the latest commit is **Ready** (trigger **Redeploy** if needed). FY26 roadmap table updates live under **FY26 Playbook → Digital Apps & Services** → scroll to **Execution plan** (card C) → click **+ See detailed SkyportHome features and capabilities** to expand the panel (it starts collapsed).

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
