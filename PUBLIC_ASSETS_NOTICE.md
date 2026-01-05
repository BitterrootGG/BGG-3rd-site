# Public Assets Notice

This repository is intended for deployment on GitHub Pages. All static media that must ship with the public site lives under the `public/` directory and is copied to the root of the production bundle.

## Current Media Inputs

| Asset | Purpose | Notes |
| --- | --- | --- |
| `public/video/hero-mulching.mp4` | Primary hero background video | Must be an MP4 encoded with H.264 video + AAC audio. Video plays muted/looped inline; keep file size under 20 MB for GitHub Pages performance. |
| `public/video/hero-mulching-poster.jpg` | Poster frame for the hero video | Displayed while the MP4 buffers; export at ≤ 250 KB. |
| `public/assets/services/*` | Service illustrations | Static imagery referenced across overview cards. |
| `public/desktop_pc/*`, `public/planet/*` | Texture atlases for 3D canvases | Already optimized and licensed per included `license.txt` files. |
| `public/resume/*` | Downloadable resume artifacts | PDFs/JSON served as-is. |

## Contribution Guidelines

1. **Licensing** – Only add media you have the rights to redistribute. Include a `license.txt` (or similar) when attribution is required.
2. **Optimization** – Compress video and imagery before committing. Use modern encoders (e.g., `ffmpeg -crf 22 -preset slow` for video, `imagemin`/`Squoosh` for imagery).
3. **Paths** – Reference assets via `/public/...` paths within the React app (e.g., `/video/hero-mulching.mp4`). Avoid importing them through the bundler when they should remain static.
4. **GitHub Pages Limits** – Keep the total `public/` payload below ~100 MB to ensure fast pushes and deployments.
5. **Versioning** – When replacing a file, keep the old name if possible to avoid cache busting issues on GitHub Pages. If renaming, update every reference in `src/`.

For anything not covered here, document the asset in this file with purpose, location, and licensing requirements before merging into `main`.
