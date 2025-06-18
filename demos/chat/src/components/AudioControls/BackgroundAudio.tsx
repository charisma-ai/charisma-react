import { useAudioManager } from "@charisma-ai/react";

const BackgroundAudio = () => {
  const { setMediaAudioMuted, setMediaAudioVolume } = useAudioManager();

  return (
    <div>
      <label>Background Audio</label>
      <input
        type="checkbox"
        id="characterMute"
        defaultChecked
        onChange={(event) =>
          setMediaAudioMuted(!(event.target as HTMLInputElement).checked)
        }
      />
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        defaultValue="1"
        onInput={(event) =>
          setMediaAudioVolume(
            parseFloat((event.target as HTMLInputElement).value),
          )
        }
      />
    </div>
  );
};

export default BackgroundAudio;
