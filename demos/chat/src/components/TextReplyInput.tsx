import { useEffect, useRef } from "react";
import { useAudioManager, useConversationContext } from "@charisma-ai/react";

const TextReplyInput = () => {
  const {
    liveTranscript,
    startListening,
    stopListening,
    clearTranscript,
    recordingStatus,
  } = useAudioManager();
  const conversation = useConversationContext();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && liveTranscript) {
      inputRef.current.value = liveTranscript;
    }
  }, [liveTranscript]);

  const handleRecordButton = (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (recordingStatus === "OFF") {
      clearTranscript();
      startListening();
    } else {
      stopListening();
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (inputRef.current?.value.trim()) {
      conversation?.reply({ text: inputRef.current.value });
      inputRef.current.value = "";
      stopListening();
      clearTranscript();
    }
  };

  if (!conversation?.messages.length) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Your reply..."
        style={{ width: "90%" }}
      />
      <div>
        <button
          disabled={recordingStatus === "STARTING"}
          onClick={handleRecordButton}
        >
          {recordingStatus === "OFF" && "Record"}
          {recordingStatus === "STARTING" && "Starting..."}
          {recordingStatus === "RECORDING" && "Stop"}
        </button>
        <button type="submit">Submit</button>
      </div>
    </form>
  );
};

export default TextReplyInput;
