import { useAudioManager } from "@charisma-ai/react";

const BackgroundAudio = () => {
  const { setCharacterSpeechMuted, setCharacterSpeechVolume } =
    useAudioManager();

  return (
    <div>
      <label>Character Speech</label>
      <input
        type="checkbox"
        id="characterMute"
        defaultChecked
        onChange={(event) =>
          setCharacterSpeechMuted(!(event.target as HTMLInputElement).checked)
        }
      />
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        defaultValue="1"
        onInput={(event) =>
          setCharacterSpeechVolume(
            parseFloat((event.target as HTMLInputElement).value),
          )
        }
      />
    </div>
  );
};

export default BackgroundAudio;
