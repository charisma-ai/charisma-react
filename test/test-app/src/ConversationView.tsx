import {
  useConversation,
  usePlaythroughContext,
  PlaythroughContextType,
  ProblemEvent,
  MessageEvent,
} from "@charisma-ai/react";
import MessagesView from "./MessagesView";
import { useEffect, useState, useRef, useCallback } from "react";
import InputControls from "./InputControls";

type ConversationType = {
  inputValue: any;
  mode: any;
  reply: any;
  start: any;
  tap: any;
  type: any;
  messages: any;
};
type ConversationViewProps = {
  conversationUuid: string | undefined;
  startGraphReferenceId: string | undefined;
  playthrough: any;
  speechRecognitionResponse: any;
  speaker: any;
  microphone: any;
  conversation: ConversationType;
};

interface OnlineDemoWindow extends Window {
  // hack to make it constructor-like
  AudioContext?: () => AudioContext;
  webkitAudioContext?: () => AudioContext;
}

type ConversationRefType = ReturnType<
  Exclude<PlaythroughContextType["playthrough"], undefined>["joinConversation"]
>;

declare const window: OnlineDemoWindow;

const ConversationView = ({
  conversationUuid,
  startGraphReferenceId,
  conversation: { inputValue, messages, mode, reply, start, tap, type },
  microphone,
  speaker,
  playthrough,
  speechRecognitionResponse,
}: ConversationViewProps) => {
  // const playthroughContext = usePlaythroughContext();

  const [activeInputType, setActiveInputType] = useState<{
    type: "tap" | "text-input";
  } | null>(null);
  const [playerChoseMicrophone, setPlayerChoseMicrophone] = useState(false);
  const [speechIsRecording, setSpeechIsRecording] = useState(false);
  const [isSpeakerActive, setIsSpeakerActive] = useState(false);

  const conversationRef = useRef<ConversationRefType>();

  const [areCharacterVoicesOn, setAreCharacterVoicesOn] = useState(true);
  const [shouldShowControls, setShouldShowControls] = useState(false);

  // const { isSpeaking, makeAvailable } = speaker;

  // const handleChangeIsSpeakerActive = useCallback(
  //   (isActive: boolean) => {
  //     if (isActive) {
  //       makeAvailable();
  //     }
  //     setIsSpeakerActive(isActive);
  //   },
  //   [makeAvailable],
  // );

  // const { messages, start } = useConversation({
  //   conversationUuid,
  // });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.AudioContext = (function AudioContextWrapper() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioContextClass: any =
        window.AudioContext || window.webkitAudioContext;

      return function AudioContext() {
        return new AudioContextClass();
      };
    })();
  }, []);

  useEffect(() => {
    if (playthrough.playthrough && conversationUuid) {
      const conversation =
        playthrough.playthrough.joinConversation(conversationUuid);
      conversationRef.current = conversation;

      const onMessage = (event: MessageEvent) => {
        console.log(event);

        // if (event.endStory) {
        //   setLoadState(LoadState.ExperienceCompletePhase);
        // }

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
  }, [playthrough.playthrough, conversationUuid]);

  // if (!conversationUuid) {
  //   return <div>Getting Conversation...</div>;
  // }
  // if (playthroughContext?.connectionStatus !== "connected") {
  //   return <div>Connecting...</div>;
  // }

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

  console.log({ areCharacterVoicesOn });
  return (
    <>
      <button
        onClick={() => {
          start({ startGraphReferenceId: undefined });
          setShouldShowControls(true);
        }}
      >
        Start
      </button>
      <button
        onClick={() => {
          setPlayerChoseMicrophone(!playerChoseMicrophone);
        }}
      >
        use microphone
      </button>
      <button
        onClick={() => {
          if (areCharacterVoicesOn) {
            conversationRef.current?.setSpeechConfig(undefined);
            setAreCharacterVoicesOn(false);
          } else {
            conversationRef.current?.setSpeechConfig({
              encoding: ["wav", "mp3"],
              output: "buffer",
            });
            setAreCharacterVoicesOn(true);
          }
        }}
      >
        Toggle character voices
      </button>
      <br />
      <br />
      <MessagesView messages={messages} />
      <br />
      <div>
        <InputControls
          offerMicrophone={playerChoseMicrophone}
          speechIsRecording={speechIsRecording}
          speechRecognitionResponse={speechRecognitionResponse}
          playthroughStartSpeechRecognition={playthroughStartSpeechRecognition}
          playthroughStopSpeechRecognition={playthroughStopSpeechRecognition}
          onSubmitText={(text: string) => {
            if (text.trim()) {
              conversationRef.current?.reply({ text });
              // setShouldShowControls(false);
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
