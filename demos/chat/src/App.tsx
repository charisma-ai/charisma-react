import {
  AudioManagerProvider,
  type AudioManagerOptions,
} from "@charisma-ai/react";
import Player from "./components/Player";
import { useState } from "react";
import StorySetupForm from "./components/StorySetupForm";

function App() {
  const [storyId, setStoryId] = useState<number>();
  const [storyKey, setStoryKey] = useState<string>();

  // AudioManager options are initialised here. They can't be changed after initialisation.
  const options: AudioManagerOptions = {
    duckVolumeLevel: 0.5,
    normalVolumeLevel: 1,
    sttService: "charisma/deepgram",
    streamTimeslice: 1000,
    handleConnect: () => console.log("Connected from App.tsx"),
    handleDisconnect: () => console.log("Disconnected from App.tsx"),
    handleError: (error: string) => console.error("Error from App.tsx", error),
  };

  return (
    <div className="app">
      {storyId && storyKey ? (
        <AudioManagerProvider options={options}>
          <Player storyId={storyId} storyKey={storyKey} />
        </AudioManagerProvider>
      ) : (
        <StorySetupForm setStoryId={setStoryId} setStoryKey={setStoryKey} />
      )}
    </div>
  );
}

export default App;
