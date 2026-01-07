# MediaHub - Deployment Guide

## 🔐 Security Configuration

This app uses **inline credential injection** during build time to prevent exposing Supabase credentials in a separate `config.js` file.

### How It Works

1. **Development**: `index.html` contains placeholder tokens:
   ```javascript
   const CONFIG = {
     SUPABASE_URL: '__SUPABASE_URL__',
     SUPABASE_KEY: '__SUPABASE_KEY__'
   };
   ```

2. **Build Process**: `build.js` reads environment variables and replaces placeholders:
   ```bash
   npm run build
   ```

3. **Result**: Credentials are injected directly into the HTML file (no separate `config.js`)

### Netlify Deployment

1. **Set Environment Variables** in Netlify dashboard:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_KEY` - Your Supabase **anon/public** key (NOT service key!)

2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `.`

3. **Deploy**: Push to GitHub - Netlify will automatically build and deploy

### Security Features

✅ No separate `config.js` file exposed  
✅ Netlify redirects block access to `/config.js` (returns 404)  
✅ Credentials injected during build from environment variables  
✅ `config.js` in `.gitignore` to prevent accidental commits  

### Important Notes

> **⚠️ Client-Side Security Limitation**  
> Credentials used in client-side JavaScript are always visible in browser source. Real security comes from:
> - Using Supabase **Row Level Security (RLS)** policies
> - Using the **anon/public key** (never the service key)
> - Implementing proper backend security with Edge Functions

### Local Development

For local testing with real credentials:

```powershell
# Windows PowerShell
$env:SUPABASE_URL='your-url'; $env:SUPABASE_KEY='your-key'; npm run build
```

```bash
# Linux/Mac
SUPABASE_URL='your-url' SUPABASE_KEY='your-key' npm run build
```

Then open `index.html` in your browser.

**Remember**: After building locally, `index.html` will contain real credentials. Don't commit this file!

### Files Modified

- `build.js` - Injects credentials into HTML (no longer generates `config.js`)
- `index.html` - Contains inline CONFIG with placeholders
- `netlify.toml` - Blocks access to `/config.js` and example files
- `.gitignore` - Already includes `config.js`
