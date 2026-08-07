# THE-BARBER-LOUNGE

A single-page marketing site for **The Barber Lounge**, built with React, Vite,
Tailwind CSS, Framer Motion, and lucide-react icons.

## Requirements

- Node.js 18+ (developed on Node 22)
- npm 10+

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the Vite dev server on http://localhost:5173
```

## Available scripts

- `npm run dev` — start the development server with hot module replacement.
- `npm run build` — create an optimized production build in `dist/`.
- `npm run preview` — locally preview the production build.

## Project structure

- `index.html` — Vite entry HTML.
- `src/main.jsx` — React entry point that mounts the app and loads Tailwind.
- `src/App.jsx` — the full single-page site component.
- `src/index.css` — Tailwind directives.
- `public/videos/` — drop the site's `.mp4` clips here (`facial.mp4`,
  `beard-lineup.mp4`, `mid-fade.mp4`). They are referenced by `src/App.jsx`
  and are intentionally not committed.

## Media assets

The hero and "Recent Work" sections reference local videos under
`public/videos/`. Add your own clips with the file names above to populate
those players; the rest of the site renders without them.
