import { useState } from 'react';
import { VideoOff } from 'lucide-react';
import type { MediaVideo } from '../../types';
import { assetUrl } from '../../utils/assets';

export function VideoPlayer({ video, autoPlay = false }: { video: MediaVideo; autoPlay?: boolean }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="img-fallback video-fallback" role="note">
        <VideoOff size={28} aria-hidden="true" />
        <span>This video could not be played. ({video.title})</span>
      </div>
    );
  }

  return (
    <figure className="video-player">
      <video
        controls
        playsInline
        preload="metadata"
        autoPlay={autoPlay}
        poster={video.poster ? assetUrl(video.poster) : undefined}
        aria-label={video.title}
        onError={() => setFailed(true)}
      >
        <source src={assetUrl(video.src)} type={video.mimeType ?? 'video/mp4'} onError={() => setFailed(true)} />
        Your browser does not support embedded videos.
      </video>
      {(video.caption || video.title) && <figcaption>{video.caption ?? video.title}</figcaption>}
    </figure>
  );
}
