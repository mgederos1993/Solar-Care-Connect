# Build Guide for Solar Care Connect

This guide provides step-by-step instructions to build the web version of your Solar Care Connect app.

## Prerequisites

- **Node.js** (version 18 or higher) and **npm**
- **Expo CLI**: Install globally: `npm install -g @expo/cli`

## Step 1: Navigate to Your Project Directory

```bash
cd /path/to/your/solar-care-connect
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Build the Web Version

```bash
npm run build:web
```

This creates a `dist/` folder with the static web files.

## Step 4: Copy to Build Folder (Optional)

```bash
npm run postbuild
```

This copies the `dist/` contents to a `build/` folder.

## Step 5: Test Locally

```bash
npm run serve
```

Open your browser to the provided URL (usually `http://localhost:3000`).

## Step 6: Deploy

### GitHub Pages
1. Push your code to GitHub
2. Go to Settings > Pages
3. Select "GitHub Actions" as source
4. Upload the `dist/` folder contents

### Netlify
1. Drag and drop the `dist/` folder to netlify.com
2. Or use CLI: `netlify deploy --dir=dist --prod`

### Vercel
1. Use CLI: `vercel --prod --cwd dist`
2. Or drag and drop the `dist/` folder

## Troubleshooting

- **Build fails**: Run `npm install` and check for errors
- **Blank page**: Check browser console for JavaScript errors
- **Loading forever**: Clear browser cache and try again

## Fresh User Experience

The app now clears localStorage on each visit to ensure every user sees a clean, default experience with no previous user data.

Your app will be available as a Progressive Web App (PWA) that users can install directly from their browser.