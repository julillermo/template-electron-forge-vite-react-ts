// For  more detailed reference, refer to the official documentation:
// https://www.electronjs.org/docs/latest/api/dialog#dialogshowopendialogwindow-options

import { dialog } from "electron";

export type OpenDialogProps = {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  // MacOS: Message to display above input boxes
  message?: string;
  // MacOS & MacAppStore Create security scoped bookmarks when packaged for the Mac App Store.
  securityScopedBookmarks?: boolean;
  filters?: {
    name: string; // ex. EPUB
    extensions: string[]; // ex. ["epub", "zip"] or ["*"] for all files
  }[];
  properties?: (
    | "openFile"
    | "openDirectory"
    | "multiSelections"
    | "showHiddenFiles"
    // MacOS: Allow creating new directories from dialog.
    | "createDirectory"
    // Windows: Prompt for creation if the file path entered in the dialog does not exist.
    | "promptToCreate"
    // MacOS: Selected aliases will now return the alias path instead of their target path.
    | "noResolveAliases"
    // MacOS: Treat packages, such as .app folders, as a directory instead of a file.
    | "treatPackageAsDirectory"
    // Windows: Do not add the item being opened to the recent documents list.
    | "dontAddToRecent"
  )[];
};

export async function openFileDialog({
  title,
  defaultPath,
  buttonLabel,
  filters,
  properties,
  message,
  securityScopedBookmarks,
}: OpenDialogProps) {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title,
    defaultPath,
    buttonLabel,
    filters: filters?.concat({ name: "All Files", extensions: ["*"] }),
    properties: properties ? properties.concat("openFile") : ["openFile"],
    message,
    securityScopedBookmarks,
  });
  if (!canceled) {
    return filePaths[0];
  }
}

export async function openDirectoryDialog({
  title,
  defaultPath,
  buttonLabel,
  filters,
  properties,
  message,
  securityScopedBookmarks,
}: OpenDialogProps) {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title,
    defaultPath,
    buttonLabel,
    filters: filters?.concat({ name: "All Files", extensions: ["*"] }),
    properties: properties
      ? properties.concat("openDirectory")
      : ["openDirectory"],
    message,
    securityScopedBookmarks,
  });
  if (!canceled) {
    return filePaths[0];
  }
}
