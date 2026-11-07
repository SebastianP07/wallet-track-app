// A blob from fetch rather than a plain link, so that a failed export can say why in the page.
export function saveFile(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  // A click starts the download without waiting for it, and the browser still needs the URL right after.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
