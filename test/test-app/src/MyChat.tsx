import {
  SpeechRecognitionResponse,
  createConversation,
  createPlaythroughToken,
  usePlaythrough,
  useBackgroundVideo,
  useBackgroundAudio,
} from "@charisma-ai/react";
import { useEffect, useState } from "react";
import { PlayParameters } from "./PlayParameters";
import ConversationView from "./ConversationView";
import SingleConversationPlaythrough from "./SingleConversationPlaythrough";

type MyChatProps = {
  conversationParameters: PlayParameters;
  apiKey: string;
};

const MyChat = ({ conversationParameters, apiKey }: MyChatProps) => {
  const { storyId, version, startGraphReferenceId, charismaUrl } =
    conversationParameters;

  const [playthroughToken, setPlaythroughToken] = useState<string>();
  const [conversationUuid, setConversationUuid] = useState<string>();

  const { onMessage: onMessageVideo } = useBackgroundVideo();
  const { onMessage: onMessageAudio } = useBackgroundAudio();

  const [speechIsRecording, setSpeechIsRecording] = useState(false);
  const [speechRecognitionResponse, setSpeechRecognitionResponse] =
    useState<SpeechRecognitionResponse | null>(null);

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
    <SingleConversationPlaythrough
      playthroughToken={playthroughToken}
      conversationUuid={conversationUuid}
      conversationOptions={{
        onMessage: (event) => {
          onMessageVideo(event);
          onMessageAudio(event);
        },
      }}
    >
      {(props) => (
        <ConversationView
          {...props}
          conversationUuid={conversationUuid}
          startGraphReferenceId={startGraphReferenceId}
          playthrough={playthrough}
          speechRecognitionResponse={speechRecognitionResponse}
        />
      )}
    </SingleConversationPlaythrough>
  );
};

export default MyChat;
