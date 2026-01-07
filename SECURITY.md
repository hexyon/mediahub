# MediaHub Security Guide

## 🔒 Configuration Security

### How Credentials Are Protected

MediaHub uses a **multi-layer security approach** to protect your Supabase credentials:

1. **Inline Injection**: During build, credentials are injected directly into `index.html` (not a separate file)
2. **Netlify Redirects**: Direct access to `/config.js` returns 404
3. **Headers Protection**: Additional `_headers` file prevents caching and indexing

### Build Process

The `build.js` script:
- Reads environment variables (`SUPABASE_URL`, `SUPABASE_KEY`)
- Injects them inline into `index.html` at build time
- Replaces `<script src="config.js"></script>` with inline config

### Environment Variables

**For Netlify deployment:**
1. Go to Site Settings → Environment Variables
2. Add:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_KEY`: Your Supabase anon key

**For local development:**
Create a `config.js` file manually (it's gitignored):
```javascript
const CONFIG = {
    SUPABASE_URL: 'your-url-here',
    SUPABASE_KEY: 'your-key-here'
};
```

### Security Best Practices

> **⚠️ Important**: After deploying these security fixes, you should:
> 1. **Rotate your Supabase anon key** in the Supabase dashboard
> 2. **Update environment variables** in Netlify with the new key
> 3. **Enable Row Level Security (RLS)** on all Supabase tables
> 4. **Set up rate limiting** on your Edge Functions

### What Changed

**Before (Vulnerable):**
- `build.js` generated `config.js` file
- `config.js` was publicly accessible at `yoursite.netlify.app/config.js`
- Anyone could view credentials via direct URL

**After (Secure):**
- Credentials injected inline during build
- No separate `config.js` file served
- Direct access to `/config.js` returns 404
- Credentials only visible in page source (same as any client-side app)

### Files Modified

- `build.js` - Now injects config inline instead of creating separate file
- `netlify.toml` - Added redirect rule to block `/config.js`
- `_headers` - Added headers to prevent caching/indexing of config files

### Testing Security

After deployment, verify:
```bash
# Should return 404
curl https://yoursite.netlify.app/config.js

# Should return 200 and show the app
curl https://yoursite.netlify.app/
```

---

**Note**: While credentials are no longer in a separate accessible file, they're still visible in the page source (as with any client-side application). The real security comes from Supabase Row Level Security policies, not hiding the anon key.
