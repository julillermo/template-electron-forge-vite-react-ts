# About
This `template-electron-forge-vite-react-ts` project is my attempt creating a React template for electron projects without relying too much on existing packagesw, and will instead build as a combination of the following starting points:
  * [Electron Forge](https://www.electronforge.io/)
  * [Vite](https://vitejs.dev/)

This project was made primarily for learning and as a possible base for future projects. Feel free to use this as a starting piont if it is of any use to you.

# Steps to manually recreate the template
### 1. Generate an Electron Forge as a base for the project
Generate a new `Electorn Forge` project with the `vite-typescript` template using the following command.
```
npm init electron-app@latest <name-of-electron-forge-project> -- --template=vite-typescript
```
*Be sure to change change &lt;name-of-the-project&gt; with your intended project name*

### 2. Organize the Electron Forge project files
Move the following files in the updated locations. This is primarily done for organization purposes and separation of contexts. The usefulness of this becomes more apparant once you start to create files that are exclusively used in one of the three contexts (`main`, `preload`, and `renderer`)

| Original location  | New file locatoin |
|------------------------ | ----------------- |
| `src/main.ts` | move to `src/main/main.ts` |
| `src/preload.ts` | move to `src/preload/preload.ts` |
| `src/renderer.ts` | move to `src/renderer/renderer.ts` or delete |
| `src/index.css` | move to `src/renderer/index.css` or delete |

**NOTE:**
  * Once we're already working with React, the `renderer.ts` and `index.css` files. However, these files can still be retained if you wish to work with vanilla JavaScript/TypeScript instead of React.
  * Once React has been set up, you will see how the `main.tsx` and `App.tsx` effectively serve the same purpose of rendering the project's "frontend" as what `renderer.ts` was intended for.

Because we changed up the directories in our `electron-forge-project`, this change must be specified in the `forge.config.ts`. Look for the part of the file that's similar to the following and update it to match accordingly:
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

Additionally, update `vite.renderer.config.ts` to have the following `base`
```
  base: "./renderer",
```

### 3. Generate a React project using Vite to copy files from
In a different folder, create a new instance of a `vite` project with the `react-ts` template using the following command.

```
npm create vite@latest <name-of-vite-project> -- --template react-ts
```

<u>**Copy `tsconfig.json` details**</u>

Update `tsconfig.json` in the `electron-forge-project` to include the following. Tested using trial-and-error, these are taken from the `tsconfig.app.json` and `tsconfig.node.json` of the `vite-project`. The following specifications are those that don't conflict with the `electron-forge-project`'s set-up based on manual testing.
```
  // added specifically for React
  "jsx": "react-jsx",

  // linting
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true
```

<u>**Copy files, directories, and packages from the `vite-project` to the `electron-forge-project`**</u>

Do the following actions for the specific files and directories from the `vite-project`:

|File/Directory | Action |
|---------------|--------|
|`public/`| copy to root directory|
|`.gitignore`| copy the lines that aren't present inside the `electron-forge-project` `.gitignore` file|
| `src/` | move the files into the `renderer/` folder we made previously in the `electron-forge-project`|
| `index.html` | replace the `index.html` of the `electron-forge-project`. Be sure to update the `<script type="module" src="/src/main.tsx"></script>` to `<script type="module" src="/src/renderer/main.tsx"></script>` so the HTML knows where to look for our `main.tsx` file|
| `package.json` | Install the listed `dependencies` and `devDependencies` packages from the `vite-project` `package.json` into the `electron-forge-project`. The `npm install <package-name>` command should resolve potential dependency issues for you. <br><br> Note that not all of these will be used by the `electron-forge-project`. You may run `npx depcheck` to list unused packages and decide whether or not to remove them from there. <br><br> You may also use this opportunity to update the details of the project specified in the `package.json`.|

As of writing, a new `vite` project created usnig the `react-ts` template includes the following packages.
```
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.8.0", // can be skipped (unused)
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1", // can be skipped (unused)
    "eslint": "^9.8.0",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0", // can be skipped (unused)
    "eslint-plugin-react-refresh": "^0.4.9", // can be skipped (unused)
    "globals": "^15.9.0", // can be skipped (unused)
    "typescript": "^5.5.3",
    "typescript-eslint": "^8.0.0",
    "vite": "^5.4.0"
  }
```

<u>**Make the `electron-forge-project` recognize our React changes**</u>

In the `electron-forge-project`, update the `src/main/main.ts` to recognize the React project. Include the following code inside the `createWindow()` function. This looks for the vite live server and renderes it as the "frontend" of the project. Overwrite the part of the code that's similar to the following. 
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

### 4. Run the project
You should now be able to run the project using the following commands
```
npm run start
```
or
```
npm start
```
![Working template-electron-forge-vite-react-ts example screenshot](./public/Screenshot_working_sample.png "Working example screenshot")