# Skyport Web

A simple site built from your content. One page, one tab (Digital Strategy), with sections you can paste into.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

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
