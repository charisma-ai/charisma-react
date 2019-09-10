import { useRef, useState, useCallback, useEffect } from "react";
import { MessageEvent } from "@charisma-ai/sdk";

const fetchMedia = async (backgroundUrl: string) => {
  const response = await fetch(backgroundUrl);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

interface UseBackgroundVideoOptions {
  disabled?: boolean;
}

const useBackgroundVideo = ({ disabled }: UseBackgroundVideoOptions = {}) => {
  const [backgroundVideo, setBackgroundVideo] = useState<string>();
  const backgroundVideoSrc = useRef<string>();

  const [backgroundVideoIdle, setBackgroundVideoIdle] = useState<string>();
  const backgroundVideoIdleSrc = useRef<string>();

  const [isVideoIdleActive, setIsVideoIdleActive] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);

  const activeVideo = isVideoIdleActive ? backgroundVideoIdle : backgroundVideo;

  // When the story ends, we pause the current video
  useEffect(() => {
    if (videoRef.current) {
      if (disabled) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [disabled]);

  const onEndedVideo = useCallback(() => {
    // when `background-once` finishes, default back to the idle if it exists
    if (!isVideoIdleActive && backgroundVideoIdleSrc.current) {
      setIsVideoIdleActive(true);
    }
  }, [isVideoIdleActive]);

  const onMessage = useCallback((messageEvent: MessageEvent) => {
    if (messageEvent.type === "character") {
      // `background-once` is played a single time before falling back to the `background` idle
      const newBackgroundVideo =
        messageEvent.message.metadata["background-once"];
      const newBackgroundVideoIdle = messageEvent.message.metadata.background;

      if (newBackgroundVideo) {
        // Only fetch if the video's source has changed
        if (newBackgroundVideo !== backgroundVideoSrc.current) {
          backgroundVideoSrc.current = newBackgroundVideo;
          fetchMedia(newBackgroundVideo).then(video => {
            setBackgroundVideo(video);
            // Once fetched, we can turn off the idle and play this one-shot video
            setIsVideoIdleActive(false);
            if (videoRef.current) {
              videoRef.current.play();
            }
          });
        } else {
          // If the source hasn't changed, we still want to play this video once
          setIsVideoIdleActive(false);
        }
      }

      if (
        newBackgroundVideoIdle !== undefined &&
        newBackgroundVideoIdle !== "false"
      ) {
        // Only fetch if the video's source has changed
        if (newBackgroundVideoIdle !== backgroundVideoIdleSrc.current) {
          backgroundVideoIdleSrc.current = newBackgroundVideoIdle;
          fetchMedia(newBackgroundVideoIdle).then(video => {
            setBackgroundVideoIdle(video);
            if (videoRef.current) {
              videoRef.current.play();
            }
          });
        }
      } else if (newBackgroundVideoIdle === "false") {
        backgroundVideoIdleSrc.current = undefined;
        setBackgroundVideoIdle(undefined);
      }
    }
  }, []);

  return {
    videoProps: {
      ref: videoRef,
      src: activeVideo,
      autoPlay: true,
      loop: isVideoIdleActive,
      onEnded: onEndedVideo,
      style: {
        display: activeVideo === undefined ? "none" : "",
      },
    },
    onMessage,
  };
};

export default useBackgroundVideo;
