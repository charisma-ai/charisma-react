import { useState, useCallback } from "react";
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

  const handlePlay = useCallback(
    (data: number[], interrupt = false) => {
      speakerRef.current.play(data, interrupt);
    },
    [speakerRef],
  );

  return {
    isSpeaking,
    play: handlePlay,
  };
};

export default useSpeaker;
