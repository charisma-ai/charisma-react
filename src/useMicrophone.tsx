import { useState, useCallback } from "react";
import { Microphone } from "@charisma-ai/sdk";

import useLazyRef from "./useLazyRef";
import useChangeableRef from "./useChangeableRef";

export interface UseMicrophoneOptions {
  onRecogniseInterim?: (text: string) => void;
  onRecognise?: (text: string) => void;
  onStart?: () => void;
  onStop?: () => void;
  onTimeout?: () => void;
}

export const useMicrophone = ({
  onRecogniseInterim,
  onRecognise,
  onStart,
  onStop,
  onTimeout,
}: UseMicrophoneOptions = {}) => {
  const [isListening, setIsListening] = useState(false);

  const onRecogniseInterimRef = useChangeableRef(onRecogniseInterim);
  const onRecogniseRef = useChangeableRef(onRecognise);
  const onStartRef = useChangeableRef(onStart);
  const onStopRef = useChangeableRef(onStop);
  const onTimeoutRef = useChangeableRef(onTimeout);

  const microphoneRef = useLazyRef(() =>
    new Microphone()
      .on("recognise-interim", (text) => {
        if (onRecogniseInterimRef.current) {
          onRecogniseInterimRef.current(text);
        }
      })
      .on("recognise", (text) => {
        if (onRecogniseRef.current) {
          onRecogniseRef.current(text);
        }
      })
      .on("start", () => {
        setIsListening(true);
        if (onStartRef.current) {
          onStartRef.current();
        }
      })
      .on("stop", () => {
        setIsListening(false);
        if (onStopRef.current) {
          onStopRef.current();
        }
      })
      .on("timeout", () => {
        if (onTimeoutRef.current) {
          onTimeoutRef.current();
        }
      }),
  );

  /* eslint-disable react-hooks/exhaustive-deps */

  const handleStartListening = useCallback(
    (timeout?: number) => {
      if (!isListening) {
        setIsListening(true);
        microphoneRef.current.startListening(timeout);
      }
    },
    [isListening],
  );

  const handleStopListening = useCallback(() => {
    if (isListening) {
      setIsListening(false);
      microphoneRef.current.stopListening();
    }
  }, [isListening]);

  const handleResetTimeout = useCallback(
    (timeout: number) => {
      if (isListening) {
        microphoneRef.current.resetTimeout(timeout);
      }
    },
    [isListening],
  );

  return {
    isListening,
    startListening: handleStartListening,
    stopListening: handleStopListening,
    resetTimeout: handleResetTimeout,
  };
};

export default useMicrophone;
