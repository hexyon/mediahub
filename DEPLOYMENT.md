# MediaHub Deployment Guide

## 🚀 Deploying to Netlify (Secure Setup)

Follow these steps to deploy MediaHub with proper security:

---

## Step 1: Set Environment Variables in Netlify

1. **Go to your Netlify site dashboard**
2. Navigate to: **Site Settings** → **Environment Variables**
3. Click **Add a variable** and add these two variables:

   | Key | Value |
   |-----|-------|
   | `SUPABASE_URL` | Your Supabase project URL (e.g., `https://xxxxx.supabase.co`) |
   | `SUPABASE_KEY` | Your Supabase anon key |

4. Click **Save**

![Netlify Environment Variables Setup](file:///C:/Users/Chloe/.gemini/antigravity/brain/6d78b9dc-14f8-4e3d-80fc-a02d1f156121/netlify_env_vars_guide_1767807653795.png)

### Where to find your Supabase credentials:
- Go to your Supabase project dashboard
- Navigate to **Settings** → **API**
- Copy:
  - **Project URL** → Use for `SUPABASE_URL`
  - **anon public** key → Use for `SUPABASE_KEY`

---

## Step 2: Deploy Your Site

### Option A: Deploy from GitHub (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Add security fixes for config.js"
   git push origin main
   ```

2. **Netlify will automatically:**
   - Run `npm run build` (which runs `build.js`)
   - Inject your environment variables into `index.html`
   - Deploy the site with inline config
   - Block access to `/config.js` via the redirect rule

### Option B: Manual Deploy

1. **Build locally with your credentials:**
   ```powershell
   $env:SUPABASE_URL="your-actual-url"
   $env:SUPABASE_KEY="your-actual-key"
   npm run build
   ```

2. **Drag and drop** the entire folder to Netlify

---

## Step 3: Verify Security

After deployment, test that everything works:

### ✅ Test 1: App should work normally
```bash
# Visit your site - should load and function properly
https://your-site.netlify.app/
```

### ✅ Test 2: config.js should be blocked
```bash
# Should return 404
https://your-site.netlify.app/config.js
```

Or test in browser:
- Open DevTools (F12) → Network tab
- Visit `https://your-site.netlify.app/config.js`
- Should see **404 Not Found**

---

## Step 4: Rotate Your Supabase Keys (Important!)

Since your old key was exposed, you should rotate it:

1. **Go to Supabase Dashboard** → **Settings** → **API**
2. **Generate new anon key** (if available) or create a new project
3. **Update the environment variable** in Netlify with the new key
4. **Redeploy** (Netlify will auto-redeploy if connected to GitHub)

---

## Troubleshooting

### ❌ App shows "CONFIG is not defined" error
**Cause:** Environment variables not set in Netlify  
**Fix:** Go to Step 1 and add the environment variables

### ❌ Build fails with "SUPABASE_URL and SUPABASE_KEY environment variables are required!"
**Cause:** Environment variables not set in Netlify  
**Fix:** Add them in Site Settings → Environment Variables

### ❌ App works but config.js is still accessible
**Cause:** Redirect rule not deployed  
**Fix:** Make sure `netlify.toml` is committed and pushed to GitHub

---

## Security Checklist

After deployment, verify:

- [ ] Environment variables set in Netlify
- [ ] App loads and functions correctly
- [ ] `/config.js` returns 404
- [ ] AI description feature works (tests Supabase connection)
- [ ] Supabase keys rotated (if previously exposed)
- [ ] Row Level Security enabled on Supabase tables

---

## What Happens During Build

```
1. Netlify runs: npm run build
2. build.js reads environment variables
3. build.js injects config inline into index.html
4. Netlify deploys the modified index.html
5. Redirect rule blocks /config.js access
6. App works with inline config ✅
```

**Result:** No separate `config.js` file is served, credentials are injected inline during build.
