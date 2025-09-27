# Runtime Error Detection Checklist

## 1. Always Check Browser Console
- Open browser DevTools Console tab
- Look for red error messages
- Check Network tab for failed module loads
- Verify no 404s for missing files

## 2. Post-Change Validation Steps
After ANY code changes, always:
1. ✅ Check TypeScript compilation: `npm run build` or check VS Code errors
2. ✅ Check runtime in browser: Open DevTools → Console
3. ✅ Test basic functionality: Click buttons, navigate, verify no JS errors
4. ✅ Check Network tab: Ensure all modules load successfully

## 3. Common Runtime Issues to Watch For
- **Module Import Errors**: "does not provide an export named X"
- **Missing Dependencies**: Failed network requests for modules
- **Circular Dependencies**: Module loading hangs or fails
- **Browser Compatibility**: ES6+ features not supported
- **Async Loading Issues**: Race conditions in module loading

## 4. Before Completing Tasks
Always run these final checks:
```bash
# 1. Build check
npm run build

# 2. Test check  
npm test

# 3. Dev server visual check
npm run dev
# Then manually open browser and check console
```

## 5. Better Error Reporting Tools
Consider adding:
- Error boundary components
- Runtime error logging
- Automated browser testing
- Console.error listeners for production