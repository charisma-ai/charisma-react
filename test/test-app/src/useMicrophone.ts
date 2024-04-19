import { useCallback } from "react";
import { useMicrophone, UseMicrophoneOptions } from "@charisma-ai/react";
import type { SpeechRecognitionOptions } from "@charisma-ai/react";

export const useMicrophoneWithError = (options: UseMicrophoneOptions) => {
  const microphone = useMicrophone(options);

  const { startListening } = microphone;
  const handleStartListening = useCallback(
    (startListeningOptions?: SpeechRecognitionOptions) => {
      try {
        startListening(startListeningOptions);
      } catch (err) {
        console.error(err);
      }
    },
    [startListening],
  );

  return {
    ...microphone,
    startListening: handleStartListening,
  };
};

export default useMicrophoneWithError;
