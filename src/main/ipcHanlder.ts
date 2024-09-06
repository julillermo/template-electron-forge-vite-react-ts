import { IpcMainInvokeEvent, ipcMain } from "electron";
import {
  openDirectoryDialog,
  openFileDialog,
} from "./functions/electron/dialog";
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
  // Open the DevTools. (comment in/out)
  // mainWindow.webContents.openDevTools();

  // Toggle resizable window (comment in/out)
  // mainWindow.setResizable(false);

  // IPC communication - electron:dialog
  ipcMain.handle("dialog:openDirectory", ipcEventWrapper(openDirectoryDialog));
  ipcMain.handle("dialog:openFile", ipcEventWrapper(openFileDialog));

  // IPC communication - node:fs
  ipcMain.handle("node:fs.statSync.isAFile", ipcEventWrapper(isAFile));
  ipcMain.handle("node:fs.statSync.isDirectory", ipcEventWrapper(isDirectory));
}
