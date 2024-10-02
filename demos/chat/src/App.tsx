import {
  AudioManagerProvider,
  type AudioManagerOptions,
} from "@charisma-ai/react";
import Player from "./components/Player";
import { useState } from "react";
import StorySetupForm from "./components/StorySetupForm";

function App() {
  const [storyId, setStoryId] = useState<number>();
  const [apiKey, setApiKey] = useState<string>();

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
      {storyId && apiKey ? (
        <AudioManagerProvider options={options}>
          <Player storyId={storyId} apiKey={apiKey} />
        </AudioManagerProvider>
      ) : (
        <StorySetupForm setStoryId={setStoryId} setApiKey={setApiKey} />
      )}
    </div>
  );
}

export default App;
