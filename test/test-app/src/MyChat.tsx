import {
  Playthrough,
  createConversation,
  createPlaythroughToken,
} from "@charisma-ai/react";
import { useEffect, useState } from "react";
import { PlayParameters } from "./PlayParameters";
import ConversationView from "./ConversationView";

type MyChatProps = {
  conversationParameters: PlayParameters;
  apiKey: string;
};

const MyChat = ({ conversationParameters, apiKey }: MyChatProps) => {
  const storyId = conversationParameters.storyId;
  const version = conversationParameters.version;
  const startGraphReferenceId = conversationParameters.startGraphReferenceId;

  const [playthroughToken, setPlaythroughToken] = useState<string>();
  const [conversationUuid, setConversationUuid] = useState<string>();
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

  return (
    <Playthrough playthroughToken={playthroughToken} autoconnect>
      <ConversationView
        conversationUuid={conversationUuid}
        startGraphReferenceId={startGraphReferenceId}
      />
    </Playthrough>
  );
};

export default MyChat;
