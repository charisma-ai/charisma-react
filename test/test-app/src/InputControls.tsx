import { useEffect, useState } from "react";
import { SpeechRecognitionResponse } from "@charisma-ai/react";
import TapButton from "./TapButton";
import RecognisedSpeechPlayerInput from "./RecognisedSpeechPlayerInput";
import TypedPlayerInput from "./TypedPlayerInput";

type InputControlsProps = {
  speechIsRecording: boolean;
  speechRecognitionResponse: SpeechRecognitionResponse | null;
  playthroughStartSpeechRecognition: () => void;
  playthroughStopSpeechRecognition: () => void;
  onSubmitText: (text: string) => void;
  onTap: () => void;
  inputType: "tap" | "text-input" | undefined;
  shouldShowControls: boolean;
  selectedInputType: string;
};

const InputControls = ({
  speechIsRecording,
  speechRecognitionResponse,
  playthroughStartSpeechRecognition,
  playthroughStopSpeechRecognition,
  onSubmitText,
  onTap,
  inputType,
  shouldShowControls,
  selectedInputType,
}: InputControlsProps) => {
  const [speechRecognitionRequested, setSpeechRecognitionRequested] =
    useState(false);

  useEffect(() => {
    if (speechRecognitionRequested) {
      playthroughStartSpeechRecognition();
    } else {
      playthroughStopSpeechRecognition();
    }
  }, [speechRecognitionRequested]);

  return (
    <>
      {shouldShowControls && (
        <>
          {selectedInputType === "speech" && (
            <>
              <RecognisedSpeechPlayerInput
                speechRecognitionResponse={speechRecognitionResponse}
                microphoneIsOn={speechIsRecording}
                sendStartMicrophoneRequest={() =>
                  setSpeechRecognitionRequested(true)
                }
                sendStopMicrophoneRequest={() => {
                  setSpeechRecognitionRequested(false);
                }}
                sendText={onSubmitText}
              />
              <div className="player-input-help">
                <div className="player-input-help-item">
                  (Hold) SHIFT - <i>Speak</i>
                </div>
              </div>
            </>
          )}
          {selectedInputType === "typing" && (
            <>
              <TypedPlayerInput onSubmitText={onSubmitText} />
              <div className="player-input-help">
                <div className="player-input-help-item">
                  ENTER - <i>Send</i>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {shouldShowControls && inputType === "tap" && (
        <TapButton
          onClick={() => {
            onTap();
          }}
        />
      )}
    </>
  );
};

export default InputControls;
