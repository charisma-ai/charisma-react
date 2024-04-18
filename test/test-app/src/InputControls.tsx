import { useEffect, useState } from "react";
import { SpeechRecognitionResponse } from "@charisma-ai/react";
import TapButton from "./TapButton";
import RecognisedSpeechPlayerInput from "./RecognisedSpeechPlayerInput";
import TypedPlayerInput from "./TypedPlayerInput";

type InputControlsProps = {
  offerMicrophone: boolean | undefined;
  speechIsRecording: boolean;
  speechRecognitionResponse: SpeechRecognitionResponse | null;
  playthroughStartSpeechRecognition: () => void;
  playthroughStopSpeechRecognition: () => void;
  onSubmitText: (text: string) => void;
  onTap: () => void;
  inputType: "tap" | "text-input" | undefined;
  shouldShowControls: boolean;
};

type CurrentlySelectedTextInputType = "typing" | "speech";

const InputControls = ({
  offerMicrophone,
  speechIsRecording,
  speechRecognitionResponse,
  playthroughStartSpeechRecognition,
  playthroughStopSpeechRecognition,
  onSubmitText,
  onTap,
  inputType,
  shouldShowControls,
}: InputControlsProps) => {
  const [speechRecognitionRequested, setSpeechRecognitionRequested] =
    useState(false);

  const [currentlySelectedTextInputType, setCurrentlySelectedTextInputType] =
    useState<CurrentlySelectedTextInputType>(
      offerMicrophone ? "speech" : "typing",
    );

  useEffect(() => {
    offerMicrophone
      ? setCurrentlySelectedTextInputType("speech")
      : setCurrentlySelectedTextInputType("typing");
  }, [offerMicrophone]);

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
        <div className="input-controls visible">
          {inputType === "text-input" && (
            <div className="input-centre-section">
              <div className="player-text-input">
                {offerMicrophone &&
                  currentlySelectedTextInputType === "speech" && (
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
                        switchToTyping={() =>
                          setCurrentlySelectedTextInputType("typing")
                        }
                        sendText={onSubmitText}
                      />
                      <div className="player-input-help">
                        <div className="player-input-help-item">
                          (Hold) SHIFT - <i>Speak</i>
                        </div>
                        <div className="player-input-help-item">
                          CTRL - <i>Switch to typing</i>
                        </div>
                      </div>
                    </>
                  )}
                {currentlySelectedTextInputType === "typing" && (
                  <>
                    <TypedPlayerInput
                      onSubmitText={onSubmitText}
                      offerMicrophone={!!offerMicrophone}
                      switchToSpeaking={() =>
                        setCurrentlySelectedTextInputType("speech")
                      }
                    />
                    <div className="player-input-help">
                      <div className="player-input-help-item">
                        ENTER - <i>Send</i>
                      </div>
                      {offerMicrophone && (
                        <div className="player-input-help-item">
                          CTRL - <i>Switch to speaking</i>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* <TapButton
        isVisible={shouldShowControls && inputType === "tap"}
        onClick={() => {
          onTap();
        }}
      /> */}
      {/* <style jsx>{`
        .input-controls {
          position: absolute;
          width: 100%;
          height: 128px;
          bottom: 0;
          opacity: 0;
          pointer-events: none;
        }

        .input-controls.visible {
          opacity: 1;
          pointer-events: all;
        }

        .input-centre-section {
          display: flex;
          justify-content: center;
          align-items: center;
          width: inherit;
          height: 100%;
          min-width: 480px;
        }

        @media (max-width: 500px) {
          .input-centre-section {
            min-width: 90%;
          }
        }

        .player-text-input {
          width: 50%;
          min-width: 480px;
        }
        @media (max-width: 500px) {
          .player-text-input {
            min-width: 90%;
          }
        }

        .player-input-help {
          position: relative;
          display: flex;
          margin-top: 16px;
          width: 100%;
          max-width: 100vw;
          justify-content: space-around;
        }

        .player-input-help-item {
          text-align: center;
          max-width: 45vw;
          font-size: 20px;
        }

        .player-input-help-item :not(:first-child) {
          margin-left: 12px;
        }
      `}</style> */}
    </>
  );
};

export default InputControls;
