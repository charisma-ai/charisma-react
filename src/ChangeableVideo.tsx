import React, { useState, useEffect, useRef } from "react";

interface ChangeableVideoProps {
  src?: string;
  muted: boolean;
  loop: boolean;
  playbackStatus: "playing" | "paused";
  onEnded?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/* eslint-disable jsx-a11y/media-has-caption */
const ChangeableVideo = ({
  src,
  muted,
  loop,
  playbackStatus,
  onEnded,
  className,
  style,
}: ChangeableVideoProps) => {
  const [activeVideo, setActiveVideo] = useState<1 | 2>(1);

  const [video1Src, setVideo1Src] = useState<string>();
  const [video2Src, setVideo2Src] = useState<string>();

  const video1Ref = useRef<HTMLVideoElement | null>(null);
  const video2Ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (activeVideo === 1) {
      setVideo2Src(src);
    } else {
      setVideo1Src(src);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useEffect(() => {
    if (playbackStatus === "playing") {
      if (activeVideo === 1 && video1Ref.current) {
        video1Ref.current.play();
      } else if (activeVideo === 2 && video2Ref.current) {
        video2Ref.current.play();
      }
    } else if (playbackStatus === "paused") {
      if (activeVideo === 1 && video1Ref.current) {
        video1Ref.current.pause();
      } else if (activeVideo === 2 && video2Ref.current) {
        video2Ref.current.pause();
      }
    }
  }, [activeVideo, playbackStatus]);

  return (
    <>
      <video
        src={video1Src}
        muted={muted}
        loop={loop}
        ref={video1Ref}
        onLoadedMetadata={() => {
          if (activeVideo === 2) {
            setActiveVideo(1);
            setVideo2Src(undefined);
          }
        }}
        onEnded={onEnded}
        style={{
          ...style,
          display: activeVideo === 1 ? undefined : "none",
        }}
        className={className}
      />
      <video
        src={video2Src}
        muted={muted}
        loop={loop}
        ref={video2Ref}
        onLoadedMetadata={() => {
          if (activeVideo === 1) {
            setActiveVideo(2);
            setVideo1Src(undefined);
          }
        }}
        onEnded={onEnded}
        style={{
          ...style,
          display: activeVideo === 2 ? undefined : "none",
        }}
        className={className}
      />
    </>
  );
};

ChangeableVideo.defaultProps = {
  muted: false,
  loop: false,
  playbackStatus: "playing",
};

export default ChangeableVideo;
