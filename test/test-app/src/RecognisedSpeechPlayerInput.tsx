import { SpeechRecognitionResponse } from "@charisma-ai/react";
import { useEffect, useState } from "react";
import ReactiveMicrophoneIcon from "./ReactiveMicrophoneIcon";

type RecognisedSpeechPlayerInputProps = {
  speechRecognitionResponse: SpeechRecognitionResponse | null;
  microphoneIsOn: boolean;
  sendStartMicrophoneRequest: () => void;
  sendStopMicrophoneRequest: () => void;
  switchToTyping?: () => void;
  sendText?: (text: string) => void;
};

const RecognisedSpeechPlayerInput = ({
  speechRecognitionResponse,
  microphoneIsOn,
  sendStartMicrophoneRequest,
  sendStopMicrophoneRequest,
  switchToTyping,
  sendText,
}: RecognisedSpeechPlayerInputProps) => {
  const [shiftPressed, setShiftPressed] = useState(false);
  const [confirmedText, setConfirmedText] = useState("");
  const [volatileText, setVolatileText] = useState("");
  const [countdown, setCountdown] = useState(0);

  let fullText = confirmedText;
  if (volatileText) {
    fullText = [confirmedText, volatileText].join(" ").trim();
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Shift") {
      setConfirmedText("");
      setVolatileText("");
      setCountdown(0);
      setShiftPressed(true);
      sendStartMicrophoneRequest();
    }
    if (event.key === "Control") {
      switchToTyping?.();
    }
  };
  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === "Shift") {
      setShiftPressed(false);
      sendStopMicrophoneRequest();
      if (sendText) {
        setCountdown(1);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (speechRecognitionResponse) {
      const newText = speechRecognitionResponse.text;

      if (!speechRecognitionResponse.isFinal) {
        setVolatileText(newText);
        return;
      }

      let newFullText = confirmedText;

      if (newText) {
        newFullText = newFullText ? newFullText.concat(" ", newText) : newText;
        setConfirmedText(newFullText);
      }
      setVolatileText("");
    }
  }, [speechRecognitionResponse]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (countdown > 0 && sendText) {
      if (countdown < 0.01) {
        sendText(fullText);
        setCountdown(0);
      } else {
        timer = setInterval(() => {
          setCountdown((previousCountdown) => previousCountdown - 0.01);
        }, 10);
      }
    }
    return () => clearInterval(timer);
  }, [countdown]);

  console.log("from mic");
  return (
    <>
      <div
        // style={{
        //   position: "relative",
        //   top: 0,
        //   left: 0,
        //   fontSize: "20px",
        //   transition: "all 0.2s ease-in-out",
        // }}
        className="player-input-area"
      >
        <input
          // id="speech-to-text-result-display-box"
          value={fullText}
          style={{
            backdropFilter: "blur(10px)",
            height: 50,
            fontSize: 20,
            position: "relative",
            color: "yellow",
          }}
          disabled
        />
        <ReactiveMicrophoneIcon
          microphoneIsOn={microphoneIsOn}
          shiftPressed={shiftPressed}
        />
        {/* {!!countdown && (
          <div className="progress-bar-container" data-testid="progress-bar">
            <ProgressBar
              intent="success"
              value={countdown}
              animate={false}
              stripes={false}
            />
          </div>
        )} */}
      </div>
      {/* <style jsx>{`
        .player-input-area {
          position: relative;
          top: 0;
          left: 0;
          font-size: 20px;
          transition: all 0.2s ease-in-out;
        }

        .progress-bar-container {
          width: 100%;
          bottom: -12px;
          position: absolute;
          margin: 0 auto;
          left: 0;
          right: 0;
          min-width: 260px;
        }

        @media (max-width: 500px) {
          .player-input-area {
            min-width: 90%;
          }
          .speech-to-text-controls {
            min-width: 95%;
          }
        }
      `}</style> */}
    </>
  );
};

export default RecognisedSpeechPlayerInput;
