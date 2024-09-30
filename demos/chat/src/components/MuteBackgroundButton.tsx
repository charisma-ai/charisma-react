import { useAudioManager } from "@charisma-ai/react";

const MuteBackgroundButton = () => {
  const { toggleMediaMute } = useAudioManager();
  return (
    <button onClick={() => toggleMediaMute()}>Toggle Mute Background</button>
  );
};

export default MuteBackgroundButton;
