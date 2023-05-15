import { useState, useCallback, useEffect } from "react";
import { Speaker } from "@charisma-ai/sdk";

import useLazyRef from "./useLazyRef.js";
import useChangeableRef from "./useChangeableRef.js";

export interface UseSpeakerOptions {
  onStart?: () => void;
  onStop?: () => void;
}

export const useSpeaker = ({ onStart, onStop }: UseSpeakerOptions = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const onStartRef = useChangeableRef(onStart);
  const onStopRef = useChangeableRef(onStop);

  const speakerRef = useLazyRef(() =>
    new Speaker()
      .on("start", () => {
        setIsSpeaking(true);
        if (onStartRef.current) {
          onStartRef.current();
        }
      })
      .on("stop", () => {
        setIsSpeaking(false);
        if (onStopRef.current) {
          onStopRef.current();
        }
      }),
  );

  const [isAvailable, setIsAvailable] = useState(() => {
    try {
      const audioContext = speakerRef.current.getAudioContext();
      if (audioContext.state === "running") {
        return true;
      }
    } catch {
      // it's possible this throws if `audioContext` couldn't be created
    }
    return false;
  });

  useEffect(() => {
    try {
      const audioContext = speakerRef.current.getAudioContext();
      audioContext.onstatechange = () => {
        setIsAvailable(audioContext.state === "running");
      };
    } catch {
      // it's possible this throws if `audioContext` couldn't be created
    }
  }, [speakerRef]);

  const handlePlay = useCallback(
    (...args: Parameters<Speaker["play"]>) => {
      return speakerRef.current.play(...args);
    },
    [speakerRef],
  );

  const makeAvailable = useCallback(() => {
    try {
      const audioContext = speakerRef.current.getAudioContext();
      audioContext.resume();
    } catch {
      // it's possible this throws if `audioContext` couldn't be created
    }
  }, [speakerRef]);

  return {
    isAvailable,
    isSpeaking,
    play: handlePlay,
    makeAvailable,
  };
};

export default useSpeaker;
