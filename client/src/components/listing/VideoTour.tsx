/**
 * Video tour / virtual walkthrough for a listing. Embeds YouTube/Vimeo or plays
 * a direct video file. Renders nothing if the URL isn't a valid video.
 */
import { PlayCircle } from 'lucide-react';
import { getVideoEmbed } from '../../utils/videoEmbed';

export default function VideoTour({ url }: { url: string | null }) {
  if (!url) return null;
  const embed = getVideoEmbed(url);
  if (!embed) return null;

  return (
    <section className="mt-6">
      <h2 className="mb-2 flex items-center gap-2 font-heading text-xl font-semibold text-ink">
        <PlayCircle size={20} className="text-cta" /> Video tour
      </h2>
      <div className="aspect-video w-full overflow-hidden rounded-card border border-hairline bg-black">
        {embed.type === 'iframe' ? (
          <iframe
            src={embed.src}
            title="Property video tour"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video src={embed.src} controls className="h-full w-full" />
        )}
      </div>
    </section>
  );
}
