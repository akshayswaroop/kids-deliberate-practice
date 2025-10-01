# Deployment Guide

## Production Deployment to Netlify

**Site URL**: https://kids-deliberate-practice.netlify.app

### Standard Deployment Process

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to production**:
   ```bash
   netlify deploy --prod --dir=dist
   ```

### Quick Deploy (One Command)

```bash
npm run build && netlify deploy --prod --dir=dist
```

### Notes

- **Auto-deploy from GitHub**: Currently configured but may have webhook issues
- **Manual deploy**: Use the commands above for reliable deployment
- **Build directory**: Always `dist` (configured in `netlify.toml`)
- **Site ID**: `af361b70-0d1f-4462-a62e-805efaac9009` (stored in `.netlify/state.json`)

### Troubleshooting

If GitHub auto-deploy isn't working:
1. Check Netlify dashboard: https://app.netlify.com/sites/kids-deliberate-practice/deploys
2. Verify GitHub webhook is configured in Netlify settings
3. Use manual deploy as backup: `netlify deploy --prod --dir=dist`

### Prerequisites

- Netlify CLI installed: `npm install -g netlify-cli`
- Authenticated with Netlify: `netlify login` (if needed)
