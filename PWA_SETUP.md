# Jirani Mwema SHG PWA Setup

This PWA setup uses native browser APIs. No new npm package is required.

## Files

```txt
src/components/PwaRegister.tsx
src/app/layout.tsx
src/app/offline/page.tsx
public/manifest.webmanifest
public/sw.js
public/icons/icon-192.png
public/icons/icon-192-maskable.png
public/icons/icon-512.png
public/icons/icon-512-maskable.png
```

## Dependencies

No extra PWA dependency is required.

Your app already uses:

```powershell
npm install framer-motion lucide-react recharts
```

## Test

```powershell
cd "C:\Users\Public\jirani-finance-app"
npm run build
npm run dev
```

Open:

```txt
http://localhost:3000
```

For full install testing, use the Vercel HTTPS production URL.

## Chrome production test

```txt
1. Open the Vercel production URL
2. Open DevTools
3. Go to Application
4. Check Manifest
5. Check Service Workers
6. Confirm installability
```

## Notes

PWA installation works best on HTTPS. Vercel production URLs are HTTPS by default.

This service worker gives app-shell caching and an offline fallback page. Live Firestore data still requires network unless Firebase offline persistence is added later.
