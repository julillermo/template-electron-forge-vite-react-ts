// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import { OpenDialogProps } from "../main/functions/electron/dialog";

// When calling these functions in the 'renderer' process, it may help to
//  call them with the `await` keyword even when the functions aren't
//  asynchronous themselves.

// Note that passing the deconstructed args ({...args}) is imporant
//  when the function is expecting potentially undefined arguments

// Unless required by the original function, it seems generally safer to
//  make the arguments optional

contextBridge.exposeInMainWorld("electron", {
  openFile: (args?: OpenDialogProps) =>
    ipcRenderer.invoke("dialog:openFile", { ...args }),
  openDirectory: (args?: OpenDialogProps) =>
    ipcRenderer.invoke("dialog:openDirectory", { ...args }),
});

contextBridge.exposeInMainWorld("node", {
  isAFile: (args: string) =>
    ipcRenderer.invoke("node:fs.statSync.isAFile", args),
  isDirectory: (args: string) =>
    ipcRenderer.invoke("node:fs.statSync.isDirectory", args),
});