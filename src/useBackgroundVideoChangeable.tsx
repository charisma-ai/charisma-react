import React, { useRef, useState, useCallback } from "react";
import { MessageEvent } from "@charisma-ai/sdk";

import { fetchMedia } from "./fetchMedia";
import ChangeableVideo from "./ChangeableVideo";

interface UseBackgroundVideoOptions {
  disabled?: boolean;
  muted?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const useBackgroundVideo = ({
  disabled,
  muted,
  className,
  style,
}: UseBackgroundVideoOptions = {}) => {
  const [backgroundVideo, setBackgroundVideo] = useState<string>();
  const [backgroundVideoIdle, setBackgroundVideoIdle] = useState<string>();
  const backgroundVideoIdleSrc = useRef<string>();

  const [isVideoIdleActive, setIsVideoIdleActive] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);

  const activeVideo = isVideoIdleActive ? backgroundVideoIdle : backgroundVideo;

  const onEndedVideo = useCallback(() => {
    // when `background-once` finishes, default back to the idle if it exists
    if (!isVideoIdleActive && backgroundVideoIdleSrc.current) {
      setIsVideoIdleActive(true);
    }
  }, [isVideoIdleActive]);

  const onMessage = useCallback(async (messageEvent: MessageEvent) => {
    if (messageEvent.type === "character" || messageEvent.type === "panel") {
      const { metadata } = messageEvent.message;

      // `background-once` is played a single time before falling back to the `background` idle
      const newBackgroundVideo = metadata["background-once"];
      const newBackgroundVideoIdle = metadata.background;

      if (
        newBackgroundVideo === undefined &&
        newBackgroundVideoIdle === undefined
      ) {
        // Don't do anything if neither metadata key is specified.
        return;
      }

      // If at least one key _is_ specified, then fetch both videos if specified and not "false"

      const newBackgroundVideoBlobPromise =
        newBackgroundVideo !== undefined && newBackgroundVideo !== "false"
          ? fetchMedia(newBackgroundVideo)
          : undefined;

      const newBackgroundVideoIdleBlobPromise =
        newBackgroundVideoIdle !== undefined &&
        newBackgroundVideoIdle !== "false"
          ? fetchMedia(newBackgroundVideoIdle)
          : undefined;

      // If we have a value for `background-once`...
      if (newBackgroundVideo !== undefined && newBackgroundVideo !== "false") {
        // Wait for it to load...
        const newBackgroundVideoBlob = await newBackgroundVideoBlobPromise;
        // Now it's fetched, we can turn off the idle and play this one-shot video
        setBackgroundVideo(newBackgroundVideoBlob);
        setIsVideoIdleActive(false);
        if (videoRef.current) {
          // Replay `once` videos from the start on subsequent equal nodes
          videoRef.current.currentTime = 0;
          videoRef.current.play();
        }
      }

      // If we have a new value for `background`...
      if (
        newBackgroundVideoIdle !== undefined &&
        newBackgroundVideoIdle !== "false" &&
        newBackgroundVideoIdle !== backgroundVideoIdleSrc.current
      ) {
        // Wait for it to load...
        const newBackgroundVideoIdleBlob = await newBackgroundVideoIdleBlobPromise;
        backgroundVideoIdleSrc.current = newBackgroundVideoIdle;
        // Now it's fetched, we can make it the pending idle, which will be switched to
        // when the one-shot video finishes
        setBackgroundVideoIdle(newBackgroundVideoIdleBlob);
        if (videoRef.current) {
          // It's possible that fetch took a long time, so the `once` video finished.
          // In this case, start playing the idle.
          // Alternatively, if `background-once` isn't specified, also play immediately.
          if (
            videoRef.current.ended ||
            newBackgroundVideo === undefined ||
            newBackgroundVideo === "false"
          ) {
            setIsVideoIdleActive(true);
          }
          videoRef.current.play();
        }
      } else if (
        newBackgroundVideoIdle === undefined ||
        newBackgroundVideoIdle === "false"
      ) {
        // If it's not defined, we remove the pending idle, so that if a one-shot video _is_
        // defined, then it won't switch to it
        backgroundVideoIdleSrc.current = undefined;
        setBackgroundVideoIdle(undefined);
      }
    }
  }, []);

  return {
    Video: (
      <ChangeableVideo
        src={activeVideo}
        loop={isVideoIdleActive}
        muted={muted}
        onEnded={onEndedVideo}
        // When the story ends, we pause the current video
        playbackStatus={disabled ? "paused" : "playing"}
        className={className}
        style={style}
      />
    ),
    onMessage,
  };
};

export default useBackgroundVideo;
