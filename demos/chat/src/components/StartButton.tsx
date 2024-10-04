import {
  useAudioManager,
  usePlaythroughContext,
  useConversationContext,
} from "@charisma-ai/react";

interface Props {
  startGraphReferenceId?: string;
}

const StartButton = ({ startGraphReferenceId }: Props) => {
  const { connectionStatus, playerSessionId, playthroughToken } =
    usePlaythroughContext();
  const { initialise, connect } = useAudioManager();
  const conversation = useConversationContext();

  const handleStart = () => {
    conversation?.start({ startGraphReferenceId });

    initialise();
    if (playerSessionId && playthroughToken) {
      connect(playthroughToken, playerSessionId);
    }
  };

  return (
    <button disabled={connectionStatus !== "connected"} onClick={handleStart}>
      {connectionStatus === "connected" ? "Start" : "Connecting..."}
    </button>
  );
};

export default StartButton;
