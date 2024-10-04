import { useAudioManager, useConversationContext } from "@charisma-ai/react";

const RecordToggleButton = () => {
  const { startListening, stopListening, recordingStatus } = useAudioManager();
  const conversation = useConversationContext();

  const onClick = () => {
    if (recordingStatus === "OFF") {
      startListening();
    } else if (recordingStatus === "RECORDING") {
      stopListening();
    }
  };

  if (!conversation) return null;

  return (
    conversation.messages.length > 0 && (
      <button disabled={recordingStatus === "STARTING"} onClick={onClick}>
        {recordingStatus === "OFF" && "Record"}
        {recordingStatus === "STARTING" && "Starting..."}
        {recordingStatus === "RECORDING" && "Stop"}
      </button>
    )
  );
};

export default RecordToggleButton;
