import { useState, useCallback, useEffect } from "react";
import { Speaker } from "@charisma-ai/sdk";

import useLazyRef from "./useLazyRef";
import useChangeableRef from "./useChangeableRef";

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
    (data: AudioBuffer, interrupt = false) => {
      // FIXME: For some reason, the `ArrayBuffer` types are different here (from different TypeScript libs?)
      return speakerRef.current.play(data as any, interrupt);
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
