import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import {
  AudioManager,
  type AudioTrack,
  type AudioOutputsServicePlayOptions,
  type AudioManagerOptions as OriginalAudioManagerOptions,
} from "@charisma-ai/sdk";

type AudioManagerContextType = {
  isListening: boolean;
  isBrowserSupported: boolean;
  initialise: () => void;
  transcript: string;
  recordingStatus: RecordingStatus;
  startListening: () => void;
  stopListening: () => void;
  connect: (token: string, playerSessionId: string) => void;
  resetTimeout: (timeout: number) => void;
  playOutput: (
    audio: ArrayBuffer,
    playOptions: boolean | AudioOutputsServicePlayOptions,
  ) => Promise<void> | undefined;
  playMediaAudio: (audioTracks: AudioTrack[]) => void;
  setMediaVolume: (volume: number) => void;
  toggleMediaMute: () => void;
  stopAllMedia: () => void;
};

export type ModifiedAudioManagerOptions = Omit<
  OriginalAudioManagerOptions,
  "handleTranscript" | "handleStartSTT" | "handleStopSTT"
>;

export enum RecordingStatus {
  off,
  starting,
  recording,
}

const AudioManagerContext = createContext<AudioManagerContextType | undefined>(
  undefined,
);

export const AudioManagerProvider = ({
  children,
  options,
}: {
  children: ReactNode;
  options: ModifiedAudioManagerOptions;
}) => {
  const audioManagerRef = useRef<AudioManager | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isBrowserSupported, setIsBrowserSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>(
    RecordingStatus.off,
  );

  useEffect(() => {
    const customHandleTranscript = (transcriptText: string) => {
      if (transcriptText.trim().length > 0) {
        setTranscript(transcriptText);
      }
    };

    const customHandleStartSTT = () => {
      setRecordingStatus(RecordingStatus.recording);
    };

    const customHandleStopSTT = () => {
      setRecordingStatus(RecordingStatus.off);
    };

    const modifiedOptions = {
      ...options,
      handleTranscript: customHandleTranscript,
      handleStartSTT: customHandleStartSTT,
      handleStopSTT: customHandleStopSTT,
    };

    const audioManager = new AudioManager(modifiedOptions);
    audioManagerRef.current = audioManager;

    // Check if browser STT is supported.
    setIsBrowserSupported(audioManager.browserIsSupported());

    return () => {
      audioManagerRef.current?.stopListening();
    };
  }, [options]);

  const initialise = useCallback(() => {
    audioManagerRef.current?.initialise();
  }, []);

  const startListening = useCallback(() => {
    setRecordingStatus(RecordingStatus.starting);
    audioManagerRef.current?.startListening();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    audioManagerRef.current?.stopListening();
    setIsListening(false);
  }, []);

  const connect = useCallback((token: string, playerSessionId: string) => {
    audioManagerRef.current?.connect(token, playerSessionId);
  }, []);

  const resetTimeout = useCallback((timeout: number) => {
    audioManagerRef.current?.resetTimeout(timeout);
  }, []);

  const playOutput = useCallback(
    (
      audio: ArrayBuffer,
      playOptions: boolean | AudioOutputsServicePlayOptions,
    ) => {
      return audioManagerRef.current?.outputServicePlay(audio, playOptions);
    },
    [],
  );

  const playMediaAudio = useCallback((audioTracks: AudioTrack[]) => {
    audioManagerRef.current?.mediaAudioPlay(audioTracks);
  }, []);

  const setMediaVolume = useCallback((volume: number) => {
    audioManagerRef.current?.mediaAudioSetVolume(volume);
  }, []);

  const toggleMediaMute = useCallback(() => {
    audioManagerRef.current?.mediaAudioToggleMute();
  }, []);

  const stopAllMedia = useCallback(() => {
    audioManagerRef.current?.mediaAudioStopAll();
  }, []);

  const value = useMemo(
    () => ({
      isListening,
      isBrowserSupported,
      transcript,
      recordingStatus,
      initialise,
      startListening,
      stopListening,
      connect,
      resetTimeout,
      playOutput,
      playMediaAudio,
      setMediaVolume,
      toggleMediaMute,
      stopAllMedia,
    }),
    [
      isListening,
      isBrowserSupported,
      recordingStatus,
      transcript,
      initialise,
      startListening,
      stopListening,
      connect,
      resetTimeout,
      playOutput,
      playMediaAudio,
      setMediaVolume,
      toggleMediaMute,
      stopAllMedia,
    ],
  );

  return (
    <AudioManagerContext.Provider value={value}>
      {children}
    </AudioManagerContext.Provider>
  );
};

export const useAudioManager = () => {
  const context = useContext(AudioManagerContext);
  if (!context) {
    throw new Error(
      "useAudioManager must be used within an AudioManagerProvider",
    );
  }
  return context;
};
