import {
  SpeechRecognitionResponse,
  SpeechRecognitionStarted,
  SpeechRecognitionStopped,
  useConversation,
  usePlaythroughContext,
} from "@charisma-ai/react";
import RecordingSwitch from "./RecordingSwitch";
import MessagesView from "./MessagesView";
import { useEffect, useState } from "react";
import RecordingIndicator from "./RecordingIndicator";

type ConversationViewProps = {
  conversationUuid: string | undefined;
  startGraphReferenceId: string | undefined;
};

const ConversationView = ({
  conversationUuid,
  startGraphReferenceId,
}: ConversationViewProps) => {
  const [service, setService] = useState<string>("");
  const playthroughContext = usePlaythroughContext();
  const playthrough = playthroughContext?.playthrough;

  const { messages, start, inputValue, reply, type } = useConversation({
    conversationUuid,
  });

  const hanldeSpeechRecognitionResponse = (
    speechRecognitionResponse: SpeechRecognitionResponse,
  ) => {
    if (speechRecognitionResponse.isFinal) {
      reply({ text: speechRecognitionResponse.text });
      type("");
    } else {
      type(speechRecognitionResponse.text);
    }
  };

  const handleSpeechRecognitionStarted = (
    speechRecognitionStarted: SpeechRecognitionStarted,
  ) => {
    setService(speechRecognitionStarted.service);
  };

  const handleSpeechRecognitionStopped = (
    speechRecognitionStopped: SpeechRecognitionStopped,
  ) => {
    setService("");
  };

  useEffect(() => {
    playthrough?.on(
      "speech-recognition-result",
      hanldeSpeechRecognitionResponse,
    );
    playthrough?.on(
      "speech-recognition-started",
      handleSpeechRecognitionStarted,
    );
    playthrough?.on(
      "speech-recognition-stopped",
      handleSpeechRecognitionStopped,
    );
    return () => {
      playthrough?.off(
        "speech-recognition-result",
        hanldeSpeechRecognitionResponse,
      );
      playthrough?.off(
        "speech-recognition-started",
        handleSpeechRecognitionStarted,
      );
      playthrough?.off(
        "speech-recognition-stopped",
        handleSpeechRecognitionStopped,
      );
    };
  }, [playthrough]);

  if (!conversationUuid) {
    return <div>Getting Conversation...</div>;
  }
  if (playthroughContext?.connectionStatus !== "connected") {
    return <div>Connecting...</div>;
  }

  return (
    <>
      <button onClick={() => start({ startGraphReferenceId })}>Start</button>
      <br />
      <br />
      <MessagesView messages={messages} />
      <br />
      <input
        onChange={({ currentTarget: { value } }) => type(value)}
        value={inputValue}
        onKeyDown={({ key }) => {
          if (key === "Enter") {
            reply({ text: inputValue });
          }
        }}
      />{" "}
      <RecordingSwitch />
      <RecordingIndicator service={service} />
    </>
  );
};

export default ConversationView;
