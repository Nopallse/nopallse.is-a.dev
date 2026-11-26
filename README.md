# Naufal — Creative Technologist Portfolio

An accessible, dependency-free foundation for an editorial monochrome portfolio.

## Run locally

```bash
npm run dev
```

Then open `http://localhost:4173`.

## Content updates

Portfolio copy is organized in `data.js`, while section copy lives in `index.html`. Replace the current remote concept images with locally optimized, rights-cleared project visuals before launch. The section structure and visual styles live separately in `index.html` and `styles.css`.

## Foundation decisions

- No framework or animation dependency is required for the static responsive experience.
- `server.js` is a minimal development server only; any static host can publish these files.
- Native, reduced-motion-aware scroll choreography is isolated in `app.js` and `styles.css`.
