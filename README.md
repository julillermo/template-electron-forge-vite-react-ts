# Steps to manually recreate the template

Generate a new electorn forge project with the `vite-typescript` template using the following command. 
```
npm init electron-app@latest <name-of-electron-forge-project> -- --template=vite-typescript
```

Move the following existing files into the following folders.

| Previous file locatoin  | New file locatoin |
|------------------------ | ----------------- |
| `src/main.ts` | move to `src/main/main.ts` |
| `src/preload.ts` | move to `src/preload/preload.ts` |
| `src/renderer.ts` | move to `src/renderer/renderer.ts` or delete |
| `src/index.css` | move to `src/renderer/index.css` or delete |

The files `renderer.ts` and `index.css` are actually no longer neccesary once working with React. However, these files can still be retained if you wish to work with vanilla JavaScript/TypeScript instead of React. What we really want is to separate out `main.ts`, `preload.ts`, and `renderer.ts` for organization. This usefulness of this becomes more apparante when you start to create files that exclusively used by one of three files.

In React, the `main.tsx` and `App.tsx` will effectively serve the same purpose as what `renderer.ts` what intended for.

Because we changed up the directories that electron-forge looks for, this change must be specified in the `forge.config.ts`. Look for the part of the file that's similar to the following and update it to match accordingly:
```
  build: [
    {
      // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
      entry: "src/main/main.ts",
      config: "vite.main.config.ts",
    },
    {
      entry: "src/preload/preload.ts",
      config: "vite.preload.config.ts",
    },
  ],
  renderer: [
    {
      name: "main_window",
      config: "vite.renderer.config.ts",
    },
  ],
```

Update `tsconfig.json` to include the following. These are taken from the `tsconfig.app.json` and `tsconfig.node.json` of the `vite-project`. Tested via trial-and-error, the following properties are those that don't conflict with the `electron-forge-project`'s set-up.
```
  // added specifically for React
  "jsx": "react-jsx",

  // linting
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true
```

Update the `vite.renderer.config.ts` to have the following `base`
```
  base: "./renderer",
```

In a different folder, create a new instance of a `vite` project with the `react-swc-ts` template using the following command.

```
npm create vite@latest <name-of-vite-project> -- --template react-swc-ts
```

*be sure to change change &lt;name-of-project&gt; with your intended project name*

Do the following actions for the specific files from the `vite-project`:

|File/Directory | Action |
|---------------|--------|
|`public/`| copy to root directory|
|`.gitignore`| copy the lines that aren't present inside the `electron-forge` `.gitignore` file|
| `src/` | move the files into the `renderer/` folder we made previously |
| `index.html` | replace the `index.html` of the `electron-forge-project`. Be sure to update the `<script type="module" src="/src/main.tsx"></script>` to `<script type="module" src="/src/renderer/main.tsx"></script>` so the HTML knows where to look for our `main.tsx` file|
| `package.json` | Install the `dependencies` and `devDependencies` packages from the `vite-project` `package.json` into the `electron-forge-project`. The `npm install <package-name>` command should resolve potential dependency issues for you|

As of writing, new `vite` project using the `react-swc-ts` template include the following packages.
```
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.8.0", // can be skipped (unused)
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react-swc": "^3.5.0", // can be skipped (unused)
    "eslint": "^9.8.0",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0", // can be skipped (unused)
    "eslint-plugin-react-refresh": "^0.4.9", // can be skipped (unused)
    "globals": "^15.9.0", // can be skipped (unused)
    "typescript": "^5.5.3",
    "typescript-eslint": "^8.0.0",
    "vite": "^5.4.0"
  }
```

In the `electron-forge-project`, update the `src/main/main.ts` to recognize the React project. Include the following code inside the `createWindow()` function. Overwrite the part of the code that's similar to the following. This looks for the vite live server and renders it.
```
  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    // MAIN_WINDOW_VITE_DEV_SERVER_URL is the localhost
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    console.log(
      `🛜  Loaded through localhost ${MAIN_WINDOW_VITE_DEV_SERVER_URL}`
    );
  } else {
    // MAIN_WINDOW_VITE_NAME is "main_window"
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
    console.log(
      `📁  Loaded through a local file:  ${path.join(
        __dirname,
        `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`
      )}`
    );
  }
``` 

Also include the following somewhere at the top of the `src/main/main.ts` file to remove the linting error that underlines these varialbes
```
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;
```

You may now run the the project using `npm start` or `npm run start`.

