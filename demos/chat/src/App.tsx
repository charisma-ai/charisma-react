import {
  AudioManagerProvider,
  type AudioManagerOptions,
} from "@charisma-ai/react";
import Player from "./components/Player";
import { useEffect, useState } from "react";
import StorySetupForm from "./components/StorySetupForm";
import AudioControls from "./components/AudioControls";

export interface StoryParams {
  storyId: number;
  apiKey: string;
  startGraphReferenceId?: string;
  storyVersion?: number;
}

const audioOptions: AudioManagerOptions = {
  duckVolumeLevel: 0.1,
  sttService: "charisma/deepgram",
  streamTimeslice: 1000,
  handleConnect: () => console.log("Connected from App.tsx"),
  handleDisconnect: () => console.log("Disconnected from App.tsx"),
  handleError: (error: string) => console.error("Error from App.tsx", error),
  debugLogFunction: (message: string) => console.log(message),
};

function App() {
  const [storyParams, setStoryParams] = useState<StoryParams>({
    storyId: 0,
    apiKey: "",
    startGraphReferenceId: undefined,
    storyVersion: undefined,
  });
  const [readyToPlay, setReadyToPlay] = useState(false);

  useEffect(() => {
    if (storyParams.storyId) {
      setReadyToPlay(true);
    }
  }, [storyParams]);

  return (
    <div className="app">
      <AudioManagerProvider options={audioOptions}>
        {readyToPlay ? (
          <Player storyParams={storyParams} />
        ) : (
          <StorySetupForm setStoryParams={setStoryParams} />
        )}
        <AudioControls />
      </AudioManagerProvider>
    </div>
  );
}

export default App;
