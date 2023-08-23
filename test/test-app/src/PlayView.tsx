import { PlayParameters } from "./PlayParameters";
import MyChat from "./MyChat";

type PlayViewProps = {
  conversationParameters: PlayParameters;
  confirmed: boolean;
  apiKey: string;
};

const PlayView = ({
  conversationParameters,
  confirmed,
  apiKey,
}: PlayViewProps) => {
  if (!confirmed) {
    return null;
  }

  return (
    <MyChat conversationParameters={conversationParameters} apiKey={apiKey} />
  );
};

export default PlayView;
