import {
  useAudioManager,
  usePlaythroughContext,
  useConversationContext,
} from "@charisma-ai/react";

const StartButton = () => {
  const { connectionStatus, playerSessionId, playthroughToken } =
    usePlaythroughContext();
  const { initialise, connect } = useAudioManager();
  const conversation = useConversationContext();

  const handleStart = () => {
    conversation?.start();

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
