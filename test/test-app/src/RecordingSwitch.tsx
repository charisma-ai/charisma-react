import {
  SpeechRecognitionStartEvent,
  usePlaythroughContext,
} from "@charisma-ai/react";
import { useState } from "react";

const speechRecognitionStartEvent: SpeechRecognitionStartEvent = {
  service: "unified:deepgram",
  languageCode: "en-US",
};

const RecordingSwitch = () => {
  const [recording, setRecording] = useState(false);
  const playthroughContext = usePlaythroughContext();
  const playthrough = playthroughContext?.playthrough;

  const recordingSwitch = () => {
    if (!playthrough) {
      return;
    }
    if (recording) {
      playthrough.stopSpeechRecognition({});
      setRecording(false);
    } else {
      playthrough.startSpeechRecognition(speechRecognitionStartEvent);
      setRecording(true);
    }
  };
  return (
    <button onClick={recordingSwitch} disabled={!playthrough}>
      🎤
    </button>
  );
};

export default RecordingSwitch;
