import BackgroundAudio from "./AudioControls/BackgroundAudio";
import CharacterAudio from "./AudioControls/CharacterAudio";

const AudioControls = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <BackgroundAudio />
      <CharacterAudio />
    </div>
  );
};

export default AudioControls;
