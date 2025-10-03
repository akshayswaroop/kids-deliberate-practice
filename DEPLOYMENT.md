# Deployment Guide

## Production Deployment to GitHub Pages

This project now uses GitHub Pages for hosting the production build.

**Live Site (example)**: https://<your-github-username>.github.io/kids-deliberate-practice/

### Standard Deployment Process (GitHub Pages)

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to GitHub Pages** (uses `gh-pages`):
   ```bash
   npm run deploy:gh
   ```

### Quick Deploy (One Command)

```bash
npm run deploy
```

### Notes

- **Build directory**: `dist`
- `deploy:gh` will copy `dist/index.html` to `dist/404.html` (so SPA routing works on GitHub Pages) and publish the `dist` folder using `gh-pages`.

### Troubleshooting

If deployment fails:
1. Ensure `gh-pages` is installed (`npm install --save-dev gh-pages`) and you have push rights to the repository.
2. Confirm the `homepage` field in `package.json` points to the correct GitHub Pages URL. Example:
   ```json
   "homepage": "https://<your-github-username>.github.io/kids-deliberate-practice/"
   ```
3. For manual publish you can run:
   ```bash
   npx gh-pages -d dist
   ```

### Prerequisites

- Ensure the `homepage` field in `package.json` is correct.
- If you prefer CI-based deploys, configure GitHub Actions to run `npm run deploy:gh` on push to `main`.
