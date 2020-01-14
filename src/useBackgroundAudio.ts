import { useState, useRef, useEffect, useCallback } from "react";
import { MessageEvent } from "@charisma-ai/sdk";

const cache: { [url: string]: string } = {};

const fetchMedia = async (backgroundUrl: string, useCache = true) => {
  if (useCache && cache[backgroundUrl] !== undefined) {
    return cache[backgroundUrl];
  }

  const response = await fetch(backgroundUrl);
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  cache[backgroundUrl] = blobUrl;
  return blobUrl;
};

interface UseBackgroundAudioOptions {
  disabled?: boolean;
}

const useBackgroundAudio = ({ disabled }: UseBackgroundAudioOptions = {}) => {
  const [backgroundAudio, setBackgroundAudio] = useState<string>();
  const backgroundAudioSrc = useRef<string>();

  const [backgroundAudioIdle, setBackgroundAudioIdle] = useState<string>();
  const backgroundAudioIdleSrc = useRef<string>();

  const [isAudioIdleActive, setIsAudioIdleActive] = useState(true);

  const audioRef = useRef<HTMLAudioElement>(null);

  const activeAudio = isAudioIdleActive ? backgroundAudioIdle : backgroundAudio;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      if (activeAudio !== undefined) {
        audioRef.current.load();
        audioRef.current.play().catch(() => {});
      }
    }
  }, [activeAudio]);

  // When the story ends, we pause the current audio
  useEffect(() => {
    if (audioRef.current) {
      if (disabled) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [disabled]);

  const onMessage = useCallback(async (messageEvent: MessageEvent) => {
    if (messageEvent.type === "character") {
      const { metadata } = messageEvent.message;

      const audioEffect = metadata["audio-effect"];
      if (audioEffect) {
        new Audio(audioEffect).play().catch(() => {
          // If it failed, suppress the error and don't play the effect
        });
      }

      // `background-once` is played a single time before falling back to the `background` idle
      const newBackgroundAudio = metadata["audio-once"];
      const newBackgroundAudioIdle = metadata.audio;

      if (
        newBackgroundAudio === undefined &&
        newBackgroundAudioIdle === undefined
      ) {
        // Don't do anything if neither metadata key is specified.
        return;
      }

      // If at least one key _is_ specified, then fetch both audios if specified and not "false"

      const newBackgroundAudioBlobPromise =
        newBackgroundAudio !== undefined && newBackgroundAudio !== "false"
          ? fetchMedia(newBackgroundAudio)
          : undefined;

      const newBackgroundAudioIdleBlobPromise =
        newBackgroundAudioIdle !== undefined &&
        newBackgroundAudioIdle !== "false"
          ? fetchMedia(newBackgroundAudioIdle)
          : undefined;

      // If we have a new value for `audio-once`...
      if (
        newBackgroundAudio !== undefined &&
        newBackgroundAudio !== "false" &&
        newBackgroundAudio !== backgroundAudioSrc.current
      ) {
        // Wait for it to load...
        const newBackgroundAudioBlob = await newBackgroundAudioBlobPromise;
        backgroundAudioSrc.current = newBackgroundAudio;
        // Now it's fetched, we can turn off the idle and play this one-shot audio
        setBackgroundAudio(newBackgroundAudioBlob);
        setIsAudioIdleActive(false);
        if (audioRef.current) {
          audioRef.current.play();
        }
      }

      // If we have a new value for `audio`...
      if (
        newBackgroundAudioIdle !== undefined &&
        newBackgroundAudioIdle !== "false" &&
        newBackgroundAudioIdle !== backgroundAudioIdleSrc.current
      ) {
        // Wait for it to load...
        const newBackgroundAudioIdleBlob = await newBackgroundAudioIdleBlobPromise;
        backgroundAudioIdleSrc.current = newBackgroundAudioIdle;
        // Now it's fetched, we can make it the pending idle, which will be switched to
        // when the one-shot audio finishes
        setBackgroundAudioIdle(newBackgroundAudioIdleBlob);
        if (audioRef.current) {
          // It's possible that fetch took a long time, so the `once` audio finished.
          // In this case, start playing the idle.
          // Alternatively, if `audio-once` isn't specified, also play immediately.
          if (
            audioRef.current.ended ||
            (newBackgroundAudio === undefined || newBackgroundAudio === "false")
          ) {
            setIsAudioIdleActive(true);
          }
          audioRef.current.play();
        }
      } else if (
        newBackgroundAudioIdle === undefined ||
        newBackgroundAudioIdle === "false"
      ) {
        // If it's not defined, we remove the pending idle, so that if a one-shot audio _is_
        // defined, then it won't switch to it
        backgroundAudioIdleSrc.current = undefined;
        setBackgroundAudioIdle(undefined);
      }
    }
  }, []);

  const onEndedAudio = useCallback(() => {
    // when `audio-once` finishes, default back to the idle if it exists
    if (!isAudioIdleActive && backgroundAudioIdleSrc.current) {
      setIsAudioIdleActive(true);
    }
  }, [isAudioIdleActive]);

  return {
    audioProps: {
      ref: audioRef,
      src: activeAudio,
      autoPlay: true,
      loop: isAudioIdleActive,
      onEnded: onEndedAudio,
      style: {
        display: "none",
      },
    },
    onMessage,
  };
};

export type BackgroundAudioElementProps = ReturnType<
  typeof useBackgroundAudio
>["audioProps"];

export default useBackgroundAudio;
