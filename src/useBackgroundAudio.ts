import { useState, useRef, useEffect, useCallback } from "react";
import { MessageEvent } from "@charisma-ai/sdk";

const fetchMedia = async (backgroundUrl: string) => {
  const response = await fetch(backgroundUrl);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
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

  const onMessage = useCallback((messageEvent: MessageEvent) => {
    if (messageEvent.type === "character") {
      /* AUDIO */
      const newBackgroundAudio = messageEvent.message.metadata["audio-once"];
      const newBackgroundAudioIdle = messageEvent.message.metadata.audio;

      if (newBackgroundAudio) {
        // Only fetch if the audio's source has changed
        if (newBackgroundAudio !== backgroundAudioSrc.current) {
          backgroundAudioSrc.current = newBackgroundAudio;
          fetchMedia(newBackgroundAudio).then(audio => {
            setBackgroundAudio(audio);
            // Once fetched, we can turn off the idle and play this one-shot audio
            setIsAudioIdleActive(false);
          });
        } else {
          // If the source hasn't changed, we still want to play this audio once
          setIsAudioIdleActive(false);
        }
      }

      if (
        newBackgroundAudioIdle !== undefined &&
        newBackgroundAudioIdle !== "false"
      ) {
        // Only fetch if the audio's source has changed
        if (newBackgroundAudioIdle !== backgroundAudioIdleSrc.current) {
          backgroundAudioIdleSrc.current = newBackgroundAudioIdle;
          fetchMedia(newBackgroundAudioIdle).then(audio => {
            setBackgroundAudioIdle(audio);
          });
        }
      } else if (newBackgroundAudioIdle === "false") {
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

export default useBackgroundAudio;
