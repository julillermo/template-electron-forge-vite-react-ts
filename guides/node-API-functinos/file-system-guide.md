# Node `fs` (File system) API

### Introduction:
This guide will cover how to incorporate the `isFile()` and `isDirectory()` from Node's `fs.lstatSync` API, as described in the [Node API documentation](https://nodejs.org/docs/latest/api/fs.html#fslstatsyncpath-options).

Two functions will be created from `fs.lstatSync`. Both will accept a `string` path value and return a `boolean`:
1. a function to check whether a input path is pointing a file
2. a function to check whether a input path is pointing to a directory

The guide will also cover how to route the functions from the 'main' process to the 'renderer' process via the IPC.

> [!IMPORTANT]
> Although this guide discusses the details of incorporting the Node's `fs.lstatSync` API, the general approach covered here can be used to adapt other Node APIs into the electron project template.

> [!NOTE]
> Because Node is intended to work on local machines (server-side) and not on the client-side that the 'renderer' process depends on, Node-specific API must be can only be loaded from 'main' process. They need to be exposed via the IPC to be ussable in the 'renderer' process

> [!TIP]
> The [guide on how to include electorn's `dialog` API](../electron-api-functions/main-process/dialog-guide.md) generally follows the same concepts discussed here while arguably being more comprehensive. It might be worthwhile to go over this as well

### Directory:
1. [Guide](#guide)
    1. [Prepare the `fileSystem.ts` file](#1-prepare-the-filesystemts-file)
    2. [Prepare handling of just created functions]()
    3. [Route the functions through the IPC `preload.ts`]()
    4. [Call the functions on the 'renderer' process]()
2. [Appendix](#appendix)



# Guide

### 1. Prepare the `fileSystem.ts` file

> [!TIP]
> <b><u>Recommended prerequisite</u></b>:
> Although not required, I highly recommend first [organizing the 'main' process functions directory](../organize-main-function-directory.md).

Navigate to your where you store your 'main' process functions. If you followed the recommended ['main' process functions organization](../organize-main-function-directory.md), this will be the `./src/main/functions/electron` directory. If you didn't follow the above guide, the following can be directly inputted into the `main.ts`.

Create a new file named `fileSystem.ts` if you're not inputting directly into the `main.ts`. This file will contain everything about the [Node lstatSync API](https://nodejs.org/docs/latest/api/fs.html#fslstatsyncpath-options) that we want to include in our project.

Perfom a simple read through of the [Node lstatSync API](https://nodejs.org/docs/latest/api/fs.html#fslstatsyncpath-options) documentation to determine which aspects you want to include, and plan how you will incorporate them into your project. This guide will only cover how to include `isFile()` and `isDirectory()` from Node's `fs.lstatSync` API.


#### A. <u>Function to check whether a path points to a file</u>

To start with the function to **check whether a path is pointing to a file**, import `node:fs` into `fileSystem.ts` (or `main.ts` if you're inputting here) and create the function for opening files:

```typescript
import * as fs from "node:fs";
// or 
// import { lstatSync } from "node:fs"

export function isAFile(path: string): boolean {
  let fileValidity = false;
  try {
    fileValidity = fs.lstatSync(path).isFile();
  } catch (err) {
    console.error(
      `lstatSync(path).isFile() WARN: ${path} is neither a file path nor a directory path`
    );
  }
  return fileValidity;
}
```

*The `import * as fs from "node:fs"` imports everything included in Node's file system API; it is a common way to import Node's file system API. However, you may also import only the specfic parts of the file System API that you need. Importing via `import { lstatSync } from "node:fs"` also works just fine for the purpose of this guide* 


#### B. <u>Function to check whether a path points to a directory</u>

For the functoin to **check whether a path is pointing to a directory**, similarly draw from the same `fs` variable and draw from the function.

```typescript
// ...

export function isDirectory(path: string): boolean {
  let fileValidity = false;
  try {
    fileValidity = fs.lstatSync(path).isDirectory();
  } catch (err) {
    console.error(
      `lstatSync(path).isDirectory() WARN: ${path} is neither a file path nor a directory path`
    );
  }
  return fileValidity;
}
```

> [!NOTE]
> If you intently read through the [Node API documentation](https://nodejs.org/docs/latest/api/fs.html#fslstatsyncpath-options), you'll find that there are may be other ways to verify whether a path leads to a directory or a file (ex. using [Dirents](https://nodejs.org/docs/latest/api/fs.html#class-fsdirent) a.k.a. directroy entries). The above synchronous approach is the simplest based on my preference and use case.

Because of above functions' simplicity of taking only take a single function argument, the `path` variable, we don't need to perform the additional work that comes with supporting additional arguments (see [guide on how to include electorn's `dialog` API](../electron-api-functions/main-process/dialog-guide.md)).

A completed `fileSystem.ts` file is provided in the [appendix](#final-filesystemts-file) as well as in the [code base](../../src/main/functions/node/fileSystem.ts).


### 2. Prepare handling of the just created `isAFile()` and `isDirectory()` functions (inside `main.ts`/`ipcHandler.ts`)

Because of [how electorn works](https://www.electronjs.org/docs/latest/tutorial/process-model), functions on the 'main' process need to get passed through the IPC to be accessible and usable by the 'renderer' process. This is especially true for functions with dependencies that may only work in the 'main' process, such as Node specific API.

> [!TIP]
> <b><u>Recommended prerequisite</u></b>:
> Although not required, I highly recommend first [extracting 'main' process IPC event listeners to an external file]() (UNFINISHED EMPTYLINK).

Locate where you handle your IPC event listeners on the 'main' process. If you followed the [guide on extracting 'main' process IPC event listeners to an external file]() (UNFINISHED EMPTY LINK), this should be the `./src/main/functions/ipcHandler.ts` file. Otherewise, the IPC event listeners are usually included as part of the `main.ts` file.

In your file, either `ipcHandler.ts` or `main.ts`, import `Event`, `ipcMain` and the previously made `isAFile()` and `isDirectory()` functions:

```typescript
// top of the `./src/main/functions/ipcHandler.ts` or `main.ts` file
import { Event, ipcMain } from "electron";
import {
  isAFile,
  isDirectory
} from "./functions/node/fileSystem";

// change the dialog file location as necessary.
```

Afterwards, use the `ipcMain.handle()` to include event listeners that trigger our functions for specific events. Traditionally, these event listener are placed as part of the the `main.ts` file, inside `createWindow()` ([see reference](https://www.electronjs.org/docs/latest/tutorial/ipc)).

```typescript
// `./src/main/functions/ipcHandler.ts` or `main.ts` file
ipcMain.handle("node:fs.statSync.isAFile", isAFile(args));
ipcMain.handle("node:fs.statSync.isDirectory", isDirectory(args));
```

*The "node:fs.statSync.isAFile" and "node:fs.statSync.isDirectory" are arbitrary strings that associate events to our functions. As long as you are consistent with how you refer to the functions, these can be any string value.*

The `isAFile()` and `isDirectory()` functions expect and argument, so our callback listeners should reflect this, `( args )`. However, ff you try to run your project with the above code however, you'll receive an error because `ipcMain.handle()` expects its callback function to have **2 arguments**. The **1st argument** should be of the type `Electron.IpcMainInvokeEvent`, and the **2nd argument** are then the arguments of our original function. This dilema can easily be resolved by wrapping our 'main' process functions inside a wrapper function before passing them on to the event listener:

```ts
// `./src/main/functions/ipcHandler.ts` or `main.ts` file

import { IpcMainInvokeEvent, ipcMain } from "electron";
import {
  isAFile,
  isDirectory
} from "./functions/node/fileSystem";

function ipcEventWrapper<Input, Output>(mainProcessFn: (arg: Input) => Output) {
  return (_event: IpcMainInvokeEvent, args: Input) => mainProcessFn(args);
}

// if working with `./src/main/functions/ipcHandler.ts` wrap the below code in an exportable function and then call it in `main.ts`, inside `createWindow()`.
ipcMain.handle("node:fs.statSync.isAFile", ipcEventWrapper(isAFile));
ipcMain.handle("node:fs.statSync.isDirectory", ipcEventWrapper(isDirectory));
```

A completed `ipcHandler.ts` file is provided in the [appendix](#final-dialogts-file) as well as in the [code base](../../src/main/ipcHanlder.ts).


### 3. Route the functions through the IPC `preload.ts`

After all that, you now have to make the `isAFile()` and `isDirectory()` functions accessible to the  'renderer' process side of electron. 

Locate your `preload.ts` and expose your functions as such:

```ts
// `./src/preload/preload.ts`
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("node", {
  isAFile: (args: string) => ipcRenderer.invoke("node:fs.statSync.isAFile", args),
  isDirectory: (args: string) => ipcRenderer.invoke("node:fs.statSync.isDirectory", args),
});
```

In the above code, the `contextBridge.exposeInMainWorld()` exposes our function to make it accessible. The first `string` variable agrument (*"node"* in this case), serves as the access point to our function on the 'renderer' side of electron. By default, this will make our functions accessbile through the `window` object via `window.node.[name_of_function]`. The names of the functions are the `key-values` provided as part of the second argument to `contextBridge.exposeInMainWorld()` (*isAFile* and *isDirectory*). Hence, the proper calls to our function on the 'renderer' process will be `window.node.isAFile()` and `window.node.isDirectory()`.

The `ipcRenderer.invoke()` calls on the our function in the 'main' process via the handler we made previously. Make sure that the arbitrary strings used in the `preload.ts` matches the corresponding strings used in `ipcHandler.ts`/`main.ts`.

If you're function is expecting more arguments or an object containing arguments in the form of key-value pairs, go over the [guide on how to include electorn's `dialog` API](../electron-api-functions/main-process/dialog-guide.md), as this provides a more comprehensive example function.



### 4. Call the `fs` functions from the 'renderer' process part of the electron project.

Anywhere in the 'renderer' process, you can call the functions similar to the following:

```ts
// examples:
const filePath = await window.node.isAFile("/place/example/path/here/"); // either true or false
const directorypath = await window.node.isDirectory("/place/example/path/here/"); // either true or false
```

Lastly, note that, based on experience, adding the `await` keyword before the function call, even if functions themselves aren't asynchronous, can help limit unexpected behaviors.



# Appendix

#### <u>Final `fileSystem.ts` file</u>
```ts
import * as fs from "node:fs";

export function isAFile(path: string): boolean {
  let fileValidity = false;
  try {
    fileValidity = fs.lstatSync(path).isFile();
  } catch (err) {
    console.error(
      `lstatSync(path).isFile() WARN: ${path} is neither a file path nor a directory path`
    );
  }
  return fileValidity;
}

export function isDirectory(path: string): boolean {
  let fileValidity = false;
  try {
    fileValidity = fs.lstatSync(path).isDirectory();
  } catch (err) {
    console.error(
      `lstatSync(path).isDirectory() WARN: ${path} is neither a file path nor a directory path`
    );
  }
  return fileValidity;
}

```

#### <u>Final `handler.ts` file</u>
```ts
import { IpcMainInvokeEvent, ipcMain } from "electron";
import { isAFile, isDirectory } from "./functions/node/fileSystem";

// Wraps the 'main' process functions into a function that accepts electron
//  events of the type IpcMainInvokeEvent while allowing inputs from the
//  'renderer' process side of the application
function ipcEventWrapper<Input, Output>(mainProcessFn: (arg: Input) => Output) {
  return (_event: IpcMainInvokeEvent, args: Input) => mainProcessFn(args);
}

// The following functions were originally part of the the 'main.ts' file.
//    Along with the 'preload.ts', these functions are what allow the
//    'main' and 'renderer' processes to interact.
export default function ipcHandler() {
  // IPC communication - node:fs
  ipcMain.handle("node:fs.statSync.isAFile", ipcEventWrapper(isAFile));
  ipcMain.handle("node:fs.statSync.isDirectory", ipcEventWrapper(isDirectory));
}

