import {
  Playthrough,
  PlaythroughContextType,
  PlaythroughProvider,
  SpeechRecognitionResponse,
  createConversation,
  createPlaythroughToken,
  usePlaythrough,
} from "@charisma-ai/react";
import { useEffect, useState, useRef } from "react";
import { PlayParameters } from "./PlayParameters";
import ConversationView from "./ConversationView";
import InputControls from "./InputControls";

type MyChatProps = {
  conversationParameters: PlayParameters;
  apiKey: string;
};

type ConversationType = ReturnType<
  Exclude<PlaythroughContextType["playthrough"], undefined>["joinConversation"]
>;

const MyChat = ({ conversationParameters, apiKey }: MyChatProps) => {
  const { storyId, version, startGraphReferenceId, charismaUrl } =
    conversationParameters;

  const [playthroughToken, setPlaythroughToken] = useState<string>();
  const [conversationUuid, setConversationUuid] = useState<string>();
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

  useEffect(() => {
    async function run() {
      const tokenResult = await createPlaythroughToken({
        storyId,
        version,
        apiKey,
      });
      const conversationResult = await createConversation(tokenResult.token);

      setPlaythroughToken(tokenResult.token);
      setConversationUuid(conversationResult.conversationUuid);
    }
    run();
  }, [storyId, version, apiKey]);

  const playthrough = usePlaythrough({
    playthroughToken,
    autoconnect: true,
    charismaUrl,
    onSpeechRecognitionResponse: (event: SpeechRecognitionResponse) =>
      setSpeechRecognitionResponse(event),
    onSpeechRecognitionStarted: () => setSpeechIsRecording(true),
    onSpeechRecognitionStopped() {
      setSpeechIsRecording(false);
      setSpeechRecognitionResponse(null);
    },
    onError: console.error,
    onProblem: console.warn,
  });

  return (
    // <Playthrough
    //   playthroughToken={playthroughToken}
    //   autoconnect
    //   charismaUrl={charismaUrl}
    // >
    //   <ConversationView
    //     conversationUuid={conversationUuid}
    //     startGraphReferenceId={startGraphReferenceId}
    //   />
    // </Playthrough>
    <PlaythroughProvider value={playthrough}>
      <ConversationView
        conversationUuid={conversationUuid}
        startGraphReferenceId={startGraphReferenceId}
        playthrough={playthrough}
      />
    </PlaythroughProvider>
  );
};

export default MyChat;
