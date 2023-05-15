import { useState, useCallback } from "react";
import {
  Microphone,
  SpeechRecognitionOptions,
  SpeechRecognitionStopOptions,
} from "@charisma-ai/sdk";

import type { SpeechRecognitionEvent } from "@charisma-ai/sdk/dist/src/speech-types";

import useLazyRef from "./useLazyRef.js";
import useChangeableRef from "./useChangeableRef.js";

export interface UseMicrophoneOptions {
  onRecogniseInterim?: (text: string) => void;
  onRecognise?: (text: string) => void;
  onResult?: (event: SpeechRecognitionEvent) => void;
  onStart?: () => void;
  onStop?: () => void;
  onTimeout?: () => void;
}

export const useMicrophone = ({
  onRecogniseInterim,
  onRecognise,
  onResult,
  onStart,
  onStop,
  onTimeout,
}: UseMicrophoneOptions = {}) => {
  const [isListening, setIsListening] = useState(false);

  const onRecogniseInterimRef = useChangeableRef(onRecogniseInterim);
  const onRecogniseRef = useChangeableRef(onRecognise);
  const onResultRef = useChangeableRef(onResult);
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
      .on("result", (event) => {
        if (onResultRef.current) {
          onResultRef.current(event);
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

  const handleStartListening = useCallback(
    (options?: SpeechRecognitionOptions) => {
      if (!isListening) {
        microphoneRef.current.startListening(options);
      }
    },
    [isListening, microphoneRef],
  );

  const handleStopListening = useCallback(
    (options?: SpeechRecognitionStopOptions) => {
      if (isListening) {
        microphoneRef.current.stopListening(options);
      }
    },
    [isListening, microphoneRef],
  );

  const handleResetTimeout = useCallback(
    (timeout: number) => {
      if (isListening) {
        microphoneRef.current.resetTimeout(timeout);
      }
    },
    [isListening, microphoneRef],
  );

  return {
    isSupported: microphoneRef.current.isSupported,
    isListening,
    startListening: handleStartListening,
    stopListening: handleStopListening,
    resetTimeout: handleResetTimeout,
  };
};

export default useMicrophone;
