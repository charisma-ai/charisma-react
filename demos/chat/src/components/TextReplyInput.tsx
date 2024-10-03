import { useEffect, useRef } from "react";
import { useAudioManager, useConversationContext } from "@charisma-ai/react";

const TextReplyInput = () => {
  const { transcript, stopListening } = useAudioManager();
  const conversation = useConversationContext();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (transcript.trim()) {
      if (inputRef.current) {
        inputRef.current.value = transcript;
      }
    }
  }, [transcript]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (inputRef.current?.value.trim()) {
      conversation?.reply({ text: inputRef.current.value });
      inputRef.current.value = "";
      stopListening();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} type="text" placeholder="Your reply..." />
      <button type="submit">Submit</button>
    </form>
  );
};

export default TextReplyInput;
