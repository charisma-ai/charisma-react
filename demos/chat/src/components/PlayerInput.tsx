import { useAudioManager } from "@charisma-ai/react";
import { useEffect } from "react";

const PlayerInput = () => {
  const { transcript } = useAudioManager();

  useEffect(() => {
    console.log("TRANSCRIPT:", transcript);
  }, [transcript]);

  return (
    <>
      <p>INPUT SECTION - {transcript}</p>
    </>
  );
};

export default PlayerInput;
