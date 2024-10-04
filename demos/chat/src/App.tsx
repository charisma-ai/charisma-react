import {
  AudioManagerProvider,
  type AudioManagerOptions,
} from "@charisma-ai/react";
import Player from "./components/Player";
import { useEffect, useState } from "react";
import StorySetupForm from "./components/StorySetupForm";

export interface StoryParams {
  storyId: number;
  apiKey: string;
  startGraphReferenceId?: string;
  storyVersion?: number;
}

function App() {
  const [storyParams, setStoryParams] = useState<StoryParams>({
    storyId: 0,
    apiKey: "",
    startGraphReferenceId: undefined,
    storyVersion: -1,
  });
  const [readyToPlay, setReadyToPlay] = useState(false);

  useEffect(() => {
    if (storyParams.storyId && storyParams.apiKey) {
      setReadyToPlay(true);
    }
  }, [storyParams]);

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
      {readyToPlay ? (
        <AudioManagerProvider options={options}>
          <Player storyParams={storyParams} />
        </AudioManagerProvider>
      ) : (
        <StorySetupForm setStoryParams={setStoryParams} />
      )}
    </div>
  );
}

export default App;
