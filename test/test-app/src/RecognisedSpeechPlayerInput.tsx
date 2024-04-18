import { SpeechRecognitionResponse } from "@charisma-ai/react";
import { useEffect, useState } from "react";
import ReactiveMicrophoneIcon from "./ReactiveMicrophoneIcon";

type RecognisedSpeechPlayerInputProps = {
  speechRecognitionResponse: SpeechRecognitionResponse | null;
  microphoneIsOn: boolean;
  sendStartMicrophoneRequest: () => void;
  sendStopMicrophoneRequest: () => void;
  sendText?: (text: string) => void;
};

const RecognisedSpeechPlayerInput = ({
  speechRecognitionResponse,
  microphoneIsOn,
  sendStartMicrophoneRequest,
  sendStopMicrophoneRequest,
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

  return (
    <>
      <div
        style={{
          position: "relative",
        }}
      >
        <input
          value={fullText}
          style={{
            backdropFilter: "blur(1px)",
            height: 35,
            fontSize: 15,
            position: "relative",
            minWidth: "400px",
          }}
          disabled
        />
        <ReactiveMicrophoneIcon
          microphoneIsOn={microphoneIsOn}
          shiftPressed={shiftPressed}
        />
      </div>
    </>
  );
};

export default RecognisedSpeechPlayerInput;
