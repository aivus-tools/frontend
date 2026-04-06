export const downloadPdf = async (url: string, fallbackFilename: string): Promise<void> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`PDF download failed: ${response.status}`);
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  const disposition = response.headers.get('Content-Disposition');
  let filename = fallbackFilename;
  if (disposition) {
    const starMatch = disposition.match(/filename\*=UTF-8''(.+?)(?:;|$)/i);
    if (starMatch) {
      filename = decodeURIComponent(starMatch[1]);
    } else {
      const plainMatch = disposition.match(/filename="?([^";]+)"?/);
      if (plainMatch) {
        filename = plainMatch[1];
      }
    }
  }

  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
};
