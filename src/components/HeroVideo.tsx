"use client";

import { useEffect, useRef, useState } from "react";

type HeroVideoProps = {
  src: string;
  alt: string;
};

export function HeroVideo({ src, alt }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);

    const video = videoRef.current;
    if (!video) return;

    video.load();
    void video.play().catch(() => {
      // Autoplay may be deferred by the browser; beige background shows until frames render.
    });
  }, [src]);

  if (failed) {
    return <div className="relative h-full w-full bg-bone" aria-label={alt} />;
  }

  return (
    <div className="relative h-full w-full bg-bone">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-label={alt}
        onError={() => setFailed(true)}
        className="absolute inset-0 h-full w-full object-cover object-center"
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}
