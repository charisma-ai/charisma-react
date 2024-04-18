import { useCallback } from "react";
import { useMicrophone, UseMicrophoneOptions } from "@charisma-ai/react";
import type { SpeechRecognitionOptions } from "@charisma-ai/react";
// import { Toaster, Intent } from "@blueprintjs/core";

// const Toast = typeof window !== "undefined" ? Toaster.create() : null;

export const useMicrophoneWithError = (options: UseMicrophoneOptions) => {
  const microphone = useMicrophone(options);

  const { startListening } = microphone;
  const handleStartListening = useCallback(
    (startListeningOptions?: SpeechRecognitionOptions) => {
      try {
        startListening(startListeningOptions);
      } catch (err) {
        console.error(err);
        // if (Toast) {
        // Toast.show({
        //   intent: Intent.DANGER,
        //   message:
        //     "Hmm, looks like speech recognition isn't supported in this browser. Currently, the only browser supported is Chrome.",
        // });
        // }
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
