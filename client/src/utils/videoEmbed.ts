/**
 * Turn a video URL (YouTube / Vimeo / direct file) into something embeddable.
 * Returns null if the URL isn't a recognised video.
 */
export function getVideoEmbed(url: string): { type: 'iframe' | 'video'; src: string } | null {
  if (!url) return null;

  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  if (yt) return { type: 'iframe', src: `https://www.youtube.com/embed/${yt[1]}` };

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeo[1]}` };

  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) return { type: 'video', src: url };

  return null;
}
