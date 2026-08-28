/**
 * Client-side image compression before upload (Section 5: "media upload with
 * client-side compression"). Downscales to a max dimension and re-encodes as
 * JPEG — cuts upload size dramatically without a noticeable quality drop.
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function compressImage(file: File, maxDim = 1600, quality = 0.8): Promise<Blob> {
  // Non-images (shouldn't happen — filtered in UI) pass through untouched.
  if (!file.type.startsWith('image/')) return file;

  try {
    const img = await loadImage(file);
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve) =>
      canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', quality),
    );
  } catch {
    return file; // if anything fails, upload the original
  }
}
