import { IpcMainInvokeEvent, ipcMain } from "electron";
import {
  openDirectoryDialog,
  openFileDialog,
} from "./functions/electron/dialog";

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
  // IPC communication - electron:dialog
  ipcMain.handle("dialog:openDirectory", ipcEventWrapper(openDirectoryDialog));
  ipcMain.handle("dialog:openFile", ipcEventWrapper(openFileDialog));
}
