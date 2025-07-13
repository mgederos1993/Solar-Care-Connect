# Build Guide for Solar Care Connect

This guide provides step-by-step instructions to build the web version of your Solar Care Connect app and save it to a `dist/` folder (or other directories like `build/` or `public/`) for distribution or hosting. Since native builds for iOS and Android require tools like Xcode and Android Studio, which may not be available in all environments, this focuses on the web build using Expo's capabilities.

## Prerequisites

Before starting, ensure you have the following installed on your system:
- **Node.js** (version 18 or higher) and **npm** (comes with Node.js)
- **Expo CLI**: Install globally if not already present by running:
  ```bash
  npm install -g expo-cli
  ```

## Step 1: Navigate to Your Project Directory

Open a terminal or command prompt and navigate to the root directory of your Solar Care Connect project:

```bash
cd /path/to/your/solar-care-connect
```

## Step 2: Build the Web Version

Expo supports building React Native apps for the web out of the box. Run the following command to build the web version of your app:

```bash
npm run build:web
```

- This command uses `expo build:web` to generate static web files.
- The output will be in the `web-build/` folder by default.

**Note**: If you're in an environment where local builds aren't possible, consider using Expo's cloud hosting (see Step 4 below for publishing directly to a public URL).

## Step 3: Copy Build Files to dist/ Folder

After the build completes, run the post-build script to copy the contents of `web-build/` to a `dist/` folder (or modify the script to use `build/` or `public/` if preferred):

```bash
node ./scripts/postbuild.js
```

- This script automatically copies all files from `web-build/` to `dist/`.
- If you want a different folder name (e.g., `build/` or `public/`), edit `scripts/postbuild.js` and change the `destDir` variable to your desired folder name:
  ```javascript
  const destDir = path.join(__dirname, '..', 'build'); // or 'public'
  ```

You now have your app's web build saved in the `dist/` folder, ready for hosting or distribution.

## Step 4: Test the Build Locally (Optional)

To verify the build works correctly, serve the `dist/` folder locally using a simple HTTP server:

```bash
npx serve dist
```

- This will start a local server (usually at `http://localhost:5000`).
- Open your browser and navigate to the provided URL to test the web app.

## Step 5: Host or Distribute the Build

### Option 1: Host on a Static Hosting Service
You can upload the contents of the `dist/` folder to any static hosting service for public access:
- **Netlify**: Drag and drop the `dist/` folder into the Netlify dashboard, or use the CLI:
  ```bash
  netlify deploy --dir=dist
  ```
- **Vercel**: Use the Vercel CLI and point to the `dist/` folder:
  ```bash
  vercel --prod --cwd dist
  ```
- **GitHub Pages**: Use a tool like `angular-cli-ghpages` or manually push the `dist/` contents to a `gh-pages` branch.

These services will provide a public URL for your app, allowing users to access it without downloading anything.

### Option 2: Publish to Expo Hosting (Simplest Public Link)
If you don't want to build locally, Expo offers free temporary hosting:
```bash
expo publish:web
```
- This uploads your web app to Expo's servers and provides a public URL (e.g., `https://expo.dev/@yourusername/solar-care-connect`).
- Note that Expo's free hosting may not be permanent for unpublished projects; use a static host for long-term deployment.

### Option 3: Save for Offline Distribution
If you simply want to save the build, zip the `dist/` folder or copy it to your desired location for archiving or sharing:
```bash
# On macOS/Linux
tar -czvf solar-care-connect-web.tar.gz dist

# On Windows (using PowerShell)
Compress-Archive -Path dist -DestinationPath solar-care-connect-web.zip
```

## Step 6: Notes on Native Builds (iOS/Android)

If your goal is to create native app builds for iOS or Android (e.g., `.apk` or `.ipa` files), note the following:
- Native builds require Xcode (for iOS) and Android Studio (for Android), which may not be available in all environments.
- You can use Expo Application Services (EAS) for cloud builds if local tools aren't available. Refer to Expo's documentation at [https://docs.expo.dev/build/introduction/](https://docs.expo.dev/build/introduction/).
- Since EAS isn't available in this specific setup, native builds are outside the scope of this guide. The focus here is on web builds for immediate distribution.

## Troubleshooting

- **Build Errors**: If `expo build:web` fails, ensure all dependencies are installed (`npm install`) and check for syntax errors in your code. Expo's error messages are usually descriptive.
- **Web Compatibility**: If the app doesn't render correctly on web, verify that platform-specific code is wrapped with `Platform.OS !== 'web'` checks (already implemented in the current codebase).
- **Hosting Issues**: If deployment to Netlify/Vercel fails, ensure the `dist/` folder contains an `index.html` file, which is the entry point for web apps.

## Progressive Web App (PWA) Features

Your `app.json` is configured with a web manifest, enabling PWA features:
- Users can add the app to their home screen on mobile devices.
- Basic offline functionality is supported via Expo's default caching.

For advanced PWA features (e.g., custom service workers), refer to Expo's web documentation.

## Need Help?

If you encounter issues or need assistance with hosting:
- Check Expo's web deployment guide: [https://docs.expo.dev/distribution/publishing-websites/](https://docs.expo.dev/distribution/publishing-websites/)
- Contact support at `solarcareconnect@gmail.com`.

By following these steps, you’ll have your app built and saved in a `dist/` folder, ready for distribution or hosting as a web app.