import {
  SpeechRecognitionResponse,
  SpeechRecognitionStarted,
  SpeechRecognitionStopped,
  useConversation,
  usePlaythroughContext,
  PlaythroughContextType,
  ProblemEvent,
  MessageEvent,
} from "@charisma-ai/react";
import RecordingSwitch from "./RecordingSwitch";
import MessagesView from "./MessagesView";
import { useEffect, useState, useRef } from "react";
import RecordingIndicator from "./RecordingIndicator";
import InputControls from "./InputControls";

type ConversationViewProps = {
  conversationUuid: string | undefined;
  startGraphReferenceId: string | undefined;
  playthrough: any;
};

interface OnlineDemoWindow extends Window {
  // hack to make it constructor-like
  AudioContext?: () => AudioContext;
  webkitAudioContext?: () => AudioContext;
}

type ConversationType = ReturnType<
  Exclude<PlaythroughContextType["playthrough"], undefined>["joinConversation"]
>;

declare const window: OnlineDemoWindow;

const ConversationView = ({
  conversationUuid,
  startGraphReferenceId,
  playthrough,
}: ConversationViewProps) => {
  const [service, setService] = useState<string>("");
  const playthroughContext = usePlaythroughContext();
  // const playthrough = playthroughContext?.playthrough;

  const [activeInputType, setActiveInputType] = useState<{
    type: "tap" | "text-input";
  } | null>(null);
  const [playerChoseMicrophone, setPlayerChoseMicrophone] = useState(false);
  const [speechIsRecording, setSpeechIsRecording] = useState(false);
  const [speechRecognitionResponse, setSpeechRecognitionResponse] =
    useState<SpeechRecognitionResponse | null>(null);
  const conversationRef = useRef<ConversationType>();
  const [areCharacterVoicesOn, setAreCharacterVoicesOn] = useState(false);
  const [shouldShowControls, setShouldShowControls] = useState(false);
  const [recording, setRecording] = useState(false);

  const { messages, start, inputValue, reply, type } = useConversation({
    conversationUuid,
  });

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
            console.log("in TAP");
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

  if (!conversationUuid) {
    return <div>Getting Conversation...</div>;
  }
  if (playthroughContext?.connectionStatus !== "connected") {
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
          start({ startGraphReferenceId: undefined });
          setShouldShowControls(true);
        }}
      >
        Start
      </button>
      <button
        // icon={areCharacterVoicesOn ? "volume-up" : "volume-off"}
        style={{ position: "absolute", top: 16, left: 16 }}
        // minimal
        // outlined
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
        <button
          onClick={() => {
            setPlayerChoseMicrophone(!playerChoseMicrophone);
            // setSpeechIsRecording(!speechIsRecording);
            // speechIsRecording
            //   ? playthroughStartSpeechRecognition()
            //   : playthroughStopSpeechRecognition();
          }}
        >
          🎤
        </button>
      </div>

      {/* <input
        onChange={({ currentTarget: { value } }) => type(value)}
        value={inputValue}
        onKeyDown={({ key }) => {
          if (key === "Enter") {
            reply({ text: inputValue });
          }
        }}
      />{" "}
      <RecordingSwitch />
      <RecordingIndicator service={service} /> */}
    </>
  );
};

export default ConversationView;
