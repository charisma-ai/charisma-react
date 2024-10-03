import { useEffect, useState } from "react";
import {
  Conversation,
  createConversation,
  createPlaythroughToken,
  Message,
  Playthrough,
  useAudioManager,
} from "@charisma-ai/react";
import Messages from "./Messages";
import RecordToggleButton from "./RecordToggleButton";
import TextReplyInput from "./TextReplyInput";
import StartButton from "./StartButton";
import MuteBackgroundButton from "./MuteBackgroundButton";

interface Props {
  storyId: number;
  apiKey: string;
}

const Player = ({ storyId, apiKey }: Props) => {
  const { playOutput, stopAllMedia, playMediaAudio } = useAudioManager();

  const [playthroughToken, setPlaythroughToken] = useState<string>();
  const [conversationUuid, setConversationUuid] = useState<string>();

  useEffect(() => {
    const getParameters = async () => {
      const tokenResult = await createPlaythroughToken({
        storyId: storyId,
        version: -1,
        apiKey,
      });
      const conversationResult = await createConversation(tokenResult.token);

      setPlaythroughToken(tokenResult.token);
      setConversationUuid(conversationResult.conversationUuid);
    };
    getParameters();
  }, []);

  const handleOnMessage = (message: Message) => {
    const characterMessage =
      message.type === "character" ? message.message : null;

    // For this demo, we only care about character messages.
    if (!characterMessage) return;

    if (characterMessage.speech) {
      playOutput(characterMessage.speech.audio as ArrayBuffer, {
        trackId: String(characterMessage.character?.id),
        interrupt: "track",
      });
    }

    if (characterMessage.media.stopAllAudio) {
      stopAllMedia();
    }

    playMediaAudio(characterMessage.media.audioTracks);
  };

  if (!playthroughToken || !conversationUuid) {
    return <>Loading...</>;
  }

  return (
    <Playthrough
      playthroughToken={playthroughToken}
      charismaUrl="https://play.charisma.ai"
      autoconnect
    >
      <Conversation
        conversationUuid={conversationUuid}
        onMessage={handleOnMessage}
        onProblem={console.warn}
        speechConfig={{
          encoding: ["mp3", "wav"],
          output: "buffer",
        }}
      >
        <>
          <StartButton />
          <Messages />
          <RecordToggleButton />
          <TextReplyInput />
          <MuteBackgroundButton />
        </>
      </Conversation>
    </Playthrough>
  );
};

export default Player;
