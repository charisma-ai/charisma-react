import { useAudioManager, useConversationContext } from "@charisma-ai/react";

const MuteBackgroundButton = () => {
  const conversation = useConversationContext();
  const { toggleMediaMute } = useAudioManager();

  if (!conversation?.messages.length) {
    return null;
  }

  return (
    <button onClick={() => toggleMediaMute()}>Toggle Mute Background</button>
  );
};

export default MuteBackgroundButton;
