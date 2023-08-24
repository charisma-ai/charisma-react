import {
  SpeechRecognitionResponse,
  useConversation,
  usePlaythroughContext,
} from "@charisma-ai/react";
import RecordingSwitch from "./RecordingSwitch";
import MessagesView from "./MessagesView";
import { useEffect } from "react";

type ConversationViewProps = {
  conversationUuid: string | undefined;
  startGraphReferenceId: string | undefined;
};

const ConversationView = ({
  conversationUuid,
  startGraphReferenceId,
}: ConversationViewProps) => {
  const playthroughContext = usePlaythroughContext();
  const playthrough = playthroughContext?.playthrough;

  const { messages, start, inputValue, reply, type } = useConversation({
    conversationUuid,
  });

  const hanlder = (speechRecognitionResponse: SpeechRecognitionResponse) => {
    console.log(speechRecognitionResponse);
    if (speechRecognitionResponse.isFinal) {
      reply({ text: speechRecognitionResponse.text });
      type("");
    } else {
      type(speechRecognitionResponse.text);
    }
  };

  useEffect(() => {
    playthrough?.on("speech-recognition-result", hanlder);
    return () => {
      playthrough?.off("speech-recognition-result", hanlder);
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
    </>
  );
};

export default ConversationView;
