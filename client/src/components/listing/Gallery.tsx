/**
 * Photo gallery — a main image + thumbnail strip, opening a full-screen
 * lightbox with prev/next. Falls back to an icon placeholder when there are no
 * photos (Section 3.5). Keyboard: ←/→ navigate, Esc closes.
 */
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X, Home } from 'lucide-react';

export default function Gallery({ images, title }: { images: { imageUrl: string }[]; title: string }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const count = images.length;

  const go = (dir: number) => setActive((i) => (i + dir + count) % count);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, count]);

  if (count === 0) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-card border border-hairline bg-canvas text-hairline">
        <Home size={64} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div>
      {/* Main image */}
      <button
        onClick={() => setLightbox(true)}
        className="block aspect-[16/10] w-full overflow-hidden rounded-card border border-hairline"
      >
        <img
          src={images[active].imageUrl}
          alt={`${title} — photo ${active + 1}`}
          className="h-full w-full object-cover"
        />
      </button>

      {/* Thumbnails */}
      {count > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${
                i === active ? 'border-primary' : 'border-transparent'
              }`}
            >
              <img src={img.imageUrl} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(false)}
        >
          <button className="absolute right-4 top-4 text-white/80 hover:text-white" aria-label="Close">
            <X size={28} />
          </button>
          {count > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              className="absolute left-4 text-white/80 hover:text-white"
              aria-label="Previous"
            >
              <ChevronLeft size={40} />
            </button>
          )}
          <img
            src={images[active].imageUrl}
            alt={`${title} — photo ${active + 1}`}
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {count > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              className="absolute right-4 text-white/80 hover:text-white"
              aria-label="Next"
            >
              <ChevronRight size={40} />
            </button>
          )}
          <span className="absolute bottom-4 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
            {active + 1} / {count}
          </span>
        </div>
      )}
    </div>
  );
}
