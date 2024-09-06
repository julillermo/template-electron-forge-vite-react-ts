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
