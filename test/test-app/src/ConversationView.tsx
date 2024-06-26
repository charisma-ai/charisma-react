import {
  usePlaythroughContext,
  PlaythroughContextType,
  ProblemEvent,
  MessageEvent,
  SpeechRecognitionResponse,
  StartEvent,
  StoredMessage,
} from "@charisma-ai/react";
import MessagesView from "./MessagesView";
import { useEffect, useState, useRef } from "react";
import InputControls from "./InputControls";

type ConversationType = {
  start: (event?: StartEvent | undefined) => void;
  messages: StoredMessage[];
};

type ConversationViewProps = {
  conversationUuid: string | undefined;
  startGraphReferenceId: string | undefined;
  playthrough: any;
  speechRecognitionResponse: SpeechRecognitionResponse | null;
  speechIsRecording: boolean;
  speaker: any;
  microphone: any;
  conversation: ConversationType;
};

type ConversationRefType = ReturnType<
  Exclude<PlaythroughContextType["playthrough"], undefined>["joinConversation"]
>;

const ConversationView = ({
  conversationUuid,
  startGraphReferenceId,
  conversation: { messages, start },
  speaker,
  playthrough,
  speechRecognitionResponse,
  speechIsRecording,
}: ConversationViewProps) => {
  const playthroughContext = usePlaythroughContext();

  const [selectedInputType, setSelectedInputType] = useState("typing");

  const [activeInputType, setActiveInputType] = useState<{
    type: "tap" | "text-input";
  } | null>(null);
  const [playerChoseMicrophone, setPlayerChoseMicrophone] = useState(false);

  const conversationRef = useRef<ConversationRefType>();

  const [areCharacterVoicesOn, setAreCharacterVoicesOn] = useState(false);
  const [shouldShowControls, setShouldShowControls] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (playthroughContext?.playthrough && conversationUuid) {
      const conversation =
        playthroughContext?.playthrough.joinConversation(conversationUuid);
      conversationRef.current = conversation;

      const onMessage = (event: MessageEvent) => {
        console.log(event);

        if (event.type !== "media") {
          if (event.tapToContinue) {
            setActiveInputType({
              type: "tap",
            });
            setShouldShowControls(true);
          } else {
            const setPlayerSpeak =
              event.message.metadata["set-player-speak"] === "" ||
              event.message.metadata["set-player-speak"] === "true";
            if (
              // !selectedExperienceConfig.setPlayerSpeakIsEnabled ||
              setPlayerSpeak
            ) {
              // We need to add a small delay, to guarantee that the character starts
              // speaking the audio clip. Otherwise there's a very tiny window where the
              // speech recognition starts (because there are no characters speaking),
              // and then immediately stops as the character starts speaking. This leads
              // to very bad results!
              setTimeout(() => {
                setActiveInputType({ type: "text-input" });
                setShouldShowControls(true);
                inputRef.current?.focus();
              }, 150);
            } else {
              setShouldShowControls(false);
            }
          }

          const audioUrl = event.message.metadata.audio;
          if (typeof audioUrl === "string") {
            new Audio(audioUrl).play().catch((err) => {
              console.error(`Could not play audio from ${audioUrl}`, err);
            });
          }
        }
      };

      const onProblem = (problem: ProblemEvent) => {
        console.warn(problem);
        // if we submitted a reply, and nothing could be done about it,
        // show the input controls again
        if (problem.code === "NO_PATHWAY_FOUND") {
          setShouldShowControls(true);
        }
      };

      conversation.on("message", onMessage);
      conversation.on("problem", onProblem);
      return () => {
        conversation.off("message", onMessage);
        conversation.on("problem", onProblem);
      };
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playthroughContext?.playthrough, conversationUuid]);

  if (!conversationUuid) {
    return <div>Getting Conversation...</div>;
  }
  if (playthrough?.connectionStatus !== "connected") {
    return <div>Connecting...</div>;
  }

  const playthroughStartSpeechRecognition = () => {
    playthrough.playthrough?.startSpeechRecognition({
      service: "unified:deepgram",
      customServiceParameters: {
        endpointing: 1200,
        utterance_end_ms: 2000,
      },
    });
  };

  const playthroughStopSpeechRecognition = () =>
    playthrough.playthrough?.stopSpeechRecognition();

  return (
    <>
      <button
        onClick={() => {
          start({ startGraphReferenceId });
        }}
      >
        Start
      </button>
      <button
        style={{ margin: "0px 10px" }}
        onClick={() => {
          setPlayerChoseMicrophone(!playerChoseMicrophone);
          setSelectedInputType(
            selectedInputType === "typing" ? "speech" : "typing",
          );
        }}
        disabled={!shouldShowControls}
      >
        {playerChoseMicrophone ? "Switch to Type" : "Use microphone"}
      </button>
      <button
        onClick={() => {
          if (areCharacterVoicesOn) {
            setAreCharacterVoicesOn(false);
            speaker.changeIsActive((isActive: boolean) => !isActive);
          } else {
            speaker.changeIsActive((isActive: boolean) => !isActive);
            setAreCharacterVoicesOn(true);
          }
        }}
      >
        Toggle character voices: {areCharacterVoicesOn ? "Off" : "On"}
      </button>
      <br />
      <br />
      <MessagesView messages={messages} />
      <br />
      <div>
        <InputControls
          selectedInputType={selectedInputType}
          speechIsRecording={speechIsRecording}
          speechRecognitionResponse={speechRecognitionResponse}
          playthroughStartSpeechRecognition={playthroughStartSpeechRecognition}
          playthroughStopSpeechRecognition={playthroughStopSpeechRecognition}
          onSubmitText={(text: string) => {
            if (text.trim()) {
              conversationRef.current?.reply({ text });
              setShouldShowControls(false);
            }
          }}
          onTap={() => {
            conversationRef.current?.tap();
          }}
          inputType={activeInputType?.type}
          shouldShowControls={shouldShowControls}
        />
      </div>
    </>
  );
};

export default ConversationView;
