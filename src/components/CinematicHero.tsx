"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ClockIcon, PhoneIcon, PinIcon } from "@/components/icons";
import { SITE } from "@/lib/content";

type HeroVideoItem = {
  src: string;
  alt: string;
};

type CinematicHeroProps = {
  eyebrow: string;
  headline: string;
  subheadline: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  videos?: HeroVideoItem[];
};

const CROSSFADE_MS = 700;

/**
 * Fixed Header clearance in px (site html font-size is 75%/12px, so rem
 * utilities undershoot the real logo+py-4 header).
 */
const HEADER_BAND = "h-[74px] shrink-0 sm:h-[88px]";

export function CinematicHero({
  eyebrow,
  headline,
  subheadline,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  videos = [],
}: CinematicHeroProps) {
  const hasVideos = videos.length > 0;
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleLayer, setVisibleLayer] = useState<0 | 1>(0);
  const [ready, setReady] = useState(false);

  const layer0Ref = useRef<HTMLVideoElement>(null);
  const layer1Ref = useRef<HTMLVideoElement>(null);
  const switchingRef = useRef(false);
  const activeIndexRef = useRef(0);
  const visibleLayerRef = useRef<0 | 1>(0);
  const videosRef = useRef(videos);
  videosRef.current = videos;

  const getLayer = useCallback((layer: 0 | 1) => {
    return layer === 0 ? layer0Ref.current : layer1Ref.current;
  }, []);

  const playLayer = useCallback(
    (layer: 0 | 1, src: string) => {
      const el = getLayer(layer);
      if (!el) return;
      if (el.src !== new URL(src, window.location.origin).href) {
        el.src = src;
        el.load();
      }
      el.defaultPlaybackRate = 1;
      el.playbackRate = 1;
      try {
        el.currentTime = 0;
      } catch {
        /* ignore seek before metadata */
      }
      void el.play().catch(() => {
        /* autoplay may be blocked until interaction */
      });
    },
    [getLayer],
  );

  useEffect(() => {
    if (!hasVideos) return;
    const first = videosRef.current[0]?.src;
    if (!first) return;
    playLayer(0, first);
  }, [hasVideos, playLayer]);

  const advance = useCallback(() => {
    const list = videosRef.current;
    if (list.length < 2 || switchingRef.current) return;
    switchingRef.current = true;

    const nextIndex = (activeIndexRef.current + 1) % list.length;
    const nextLayer = (visibleLayerRef.current === 0 ? 1 : 0) as 0 | 1;
    const nextSrc = list[nextIndex].src;

    window.requestAnimationFrame(() => {
      playLayer(nextLayer, nextSrc);
      visibleLayerRef.current = nextLayer;
      activeIndexRef.current = nextIndex;
      setVisibleLayer(nextLayer);
      setActiveIndex(nextIndex);
      window.setTimeout(() => {
        switchingRef.current = false;
      }, CROSSFADE_MS + 50);
    });
  }, [playLayer]);

  useEffect(() => {
    if (!hasVideos) return;
    const el = getLayer(visibleLayer);
    if (!el) return;

    const onEnded = () => advance();
    const onPlaying = () => setReady(true);

    el.addEventListener("ended", onEnded);
    el.addEventListener("playing", onPlaying);
    return () => {
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("playing", onPlaying);
    };
  }, [advance, getLayer, hasVideos, visibleLayer]);

  /*
    Milder crop than a full-bleed landscape cover of 9:16 phone clips.
    object-center (not upper-face bias) + 9:16 stage ≈ native frame = sharper.
  */
  const videoClassName = (layer: 0 | 1) =>
    `absolute inset-0 h-full w-full object-cover object-center transition-opacity ease-out ${
      visibleLayer === layer && ready ? "opacity-100" : "opacity-0"
    }`;

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-black text-white">
      {/* Spacer under fixed site Header — video must not bleed into nav */}
      <div className={HEADER_BAND} aria-hidden />

      {/* Middle band only: media + copy between nav and info strip */}
      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0 bg-black">
          {hasVideos ? (
            <div
              className="absolute inset-0 flex items-center justify-center overflow-hidden"
              data-hero-media-plane
            >
              {/*
                Portrait phone clips stay in a 9:16 column inside the band.
                Slightly short of full band height = milder zoom (sharper,
                less humongous) vs filling the whole middle strip.
              */}
              <div className="relative h-[90%] max-w-full aspect-[9/16] overflow-hidden">
                <video
                  ref={layer0Ref}
                  muted
                  playsInline
                  autoPlay
                  preload="auto"
                  aria-label={videos[activeIndex]?.alt ?? "The Barber Lounge"}
                  aria-hidden={visibleLayer !== 0}
                  onPlaying={() => setReady(true)}
                  className={videoClassName(0)}
                  style={{ transitionDuration: `${CROSSFADE_MS}ms` }}
                />
                <video
                  ref={layer1Ref}
                  muted
                  playsInline
                  preload="metadata"
                  aria-label={videos[activeIndex]?.alt ?? "The Barber Lounge"}
                  aria-hidden={visibleLayer !== 1}
                  onPlaying={() => setReady(true)}
                  className={videoClassName(1)}
                  style={{ transitionDuration: `${CROSSFADE_MS}ms` }}
                />
              </div>
            </div>
          ) : null}

          <div
            className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-black/55 md:from-black/75 md:via-black/20 md:to-black/75"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25"
            aria-hidden
          />
        </div>

        <div className="relative z-10 flex h-full min-h-[min(100%,36rem)] items-end md:items-center">
          <div className="mx-auto w-full max-w-7xl px-5 pb-10 pt-6 sm:px-8 sm:pb-12 md:pb-14 md:pt-8">
            <div className="max-w-[20rem] sm:max-w-xl lg:max-w-2xl">
              <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/85 sm:text-[11px]">
                {eyebrow}
              </p>
              <h1 className="mt-3 font-serif text-[clamp(2.4rem,7.5vw,5.5rem)] font-semibold leading-[0.96] tracking-[-0.03em] text-white [text-shadow:0_2px_28px_rgba(0,0,0,0.55)] sm:mt-4">
                {headline}
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85 sm:mt-5 sm:text-lg">
                {subheadline}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
                <a
                  href={primaryHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-analytics-label="Book Appointment (cinematic hero)"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  {primaryLabel}
                  <span aria-hidden>→</span>
                </a>
                <a
                  href={secondaryHref}
                  data-analytics-label="Call Now (cinematic hero)"
                  className="inline-flex items-center justify-center rounded-md border border-white/75 bg-black/20 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  {secondaryLabel}
                </a>
              </div>
            </div>
          </div>
        </div>

        {hasVideos && videos.length > 1 ? (
          <div
            className="pointer-events-none absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2"
            aria-hidden
          >
            {videos.map((video, i) => (
              <span
                key={video.src}
                className={`h-1 w-6 rounded-full transition ${
                  i === activeIndex ? "bg-white" : "bg-white/35"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Address / phone / walk-ins — below video, never overlaid by media */}
      <div className="relative z-20 shrink-0 border-t border-white/10 bg-black/55 backdrop-blur-md">
        <div className="mx-auto grid max-w-7xl gap-3 px-5 py-3.5 sm:grid-cols-3 sm:gap-0 sm:px-8 sm:py-4">
          <a
            href="https://maps.google.com/?q=1518+A+St,+Antioch,+CA+94509"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-white/90 transition hover:text-white sm:border-r sm:border-white/10 sm:pr-6"
          >
            <PinIcon className="h-4 w-4 shrink-0 stroke-white" />
            <span>{SITE.address}</span>
          </a>
          <a
            href={`tel:${SITE.phoneTel}`}
            data-analytics-label="Call or Text (hero info bar)"
            className="flex items-center gap-3 text-sm text-white/90 transition hover:text-white sm:border-r sm:border-white/10 sm:px-6"
          >
            <PhoneIcon className="h-4 w-4 shrink-0 stroke-white" />
            <span>
              {SITE.phone} <span className="text-white/55">Call or Text</span>
            </span>
          </a>
          <div className="flex items-center gap-3 text-sm text-white/90 sm:pl-6">
            <ClockIcon className="h-4 w-4 shrink-0 stroke-white" />
            <span>Walk-Ins Welcome, Appointments Preferred</span>
          </div>
        </div>
      </div>
    </section>
  );
}
