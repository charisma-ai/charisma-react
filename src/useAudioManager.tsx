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
import {
  AudioManagerConnectionError,
  AudioManagerInitialisationError,
  AudioPlaybackError,
} from "./errors/AudioManagerErrors.js";

type AudioManagerContextType = {
  isListening: boolean;
  isBrowserSupported: boolean;
  initialise: () => void;
  transcript: string;
  interimTranscript: string;
  liveTranscript: string;
  recordingStatus: RecordingStatus;
  clearTranscript: () => void;
  startListening: (timeout?: number) => void;
  stopListening: () => void;
  connect: (token: string, playerSessionId: string) => void;
  disconnect: () => void;
  resetTimeout: (timeout: number) => void;
  playCharacterSpeech: (
    audio: ArrayBuffer,
    playOptions: boolean | AudioOutputsServicePlayOptions,
  ) => Promise<void> | undefined;
  characterSpeechVolume: number;
  setCharacterSpeechVolume: (volume: number) => void;
  characterSpeechIsMuted: boolean;
  setCharacterSpeechMuted: (muted: boolean) => void;
  playMediaAudio: (audioTracks: AudioTrack[]) => void;
  mediaAudioVolume: number;
  setMediaAudioVolume: (volume: number) => void;
  mediaAudioIsMuted: boolean;
  setMediaAudioMuted: (muted: boolean) => void;
  stopAllMedia: () => void;
};

export type ModifiedAudioManagerOptions = Omit<
  OriginalAudioManagerOptions,
  | "handleTranscript"
  | "handleInterimTranscript"
  | "handleStartSTT"
  | "handleStopSTT"
>;

export type RecordingStatus = "OFF" | "STARTING" | "RECORDING";

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
  const [interimTranscript, setInterimTranscript] = useState("");
  const [confirmedTranscripts, setConfirmedTranscripts] = useState("");
  const [recordingStatus, setRecordingStatus] =
    useState<RecordingStatus>("OFF");
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    try {
      const customHandleTranscript = (transcriptText: string) => {
        if (transcriptText.trim().length > 0) {
          queueMicrotask(() => {
            setTranscript(transcriptText);
            setInterimTranscript("");
            setConfirmedTranscripts((existing) =>
              `${existing} ${transcriptText}`.trim(),
            );
          });
        }
      };

      const customHandleInterimTranscript = (transcriptText: string) => {
        if (transcriptText.trim().length > 0) {
          queueMicrotask(() => setInterimTranscript(transcriptText));
        }
      };

      const customHandleStartSTT = () => {
        setRecordingStatus("RECORDING");
      };

      const customHandleStopSTT = () => {
        setRecordingStatus("OFF");
      };

      const modifiedOptions = {
        ...options,
        handleTranscript: customHandleTranscript,
        handleInterimTranscript: customHandleInterimTranscript,
        handleStartSTT: customHandleStartSTT,
        handleStopSTT: customHandleStopSTT,
      };

      const audioManager = new AudioManager(modifiedOptions);
      audioManagerRef.current = audioManager;
      setIsBrowserSupported(audioManager.browserIsSupported());
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to initialise AudioManager:", error);
    }

    return () => {
      audioManagerRef.current?.stopListening();
      audioManagerRef.current?.mediaAudioStopAll();
      audioManagerRef.current = null;
    };
  }, [options]);

  const initialise = useCallback(() => {
    audioManagerRef.current?.initialise();
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setConfirmedTranscripts("");
  }, []);

  const startListening = useCallback((timeout?: number) => {
    try {
      if (!audioManagerRef.current) {
        throw new AudioManagerInitialisationError(
          "AudioManager is not initialised",
        );
      }

      setRecordingStatus("STARTING");
      audioManagerRef.current.startListening(timeout);
      setIsListening(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to start listening:", error);
      setRecordingStatus("OFF");
    }
  }, []);

  const stopListening = useCallback(() => {
    try {
      if (!audioManagerRef.current) {
        throw new AudioManagerInitialisationError(
          "AudioManager is not initialised",
        );
      }

      audioManagerRef.current?.stopListening();
      setIsListening(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to stop listening:", error);
    }
  }, []);

  const connect = useCallback((token: string, playerSessionId: string) => {
    try {
      if (!audioManagerRef.current) {
        throw new AudioManagerInitialisationError(
          "AudioManager is not initialised",
        );
      }

      audioManagerRef.current.connect(token, playerSessionId);
    } catch (error) {
      throw new AudioManagerConnectionError(
        "Failed to connect to AudioManager",
      );
    }
  }, []);

  const disconnect = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    audioManagerRef.current?.disconnect();
  }, []);

  const resetTimeout = useCallback((timeout: number) => {
    audioManagerRef.current?.resetTimeout(timeout);
  }, []);

  const playCharacterSpeech = useCallback(
    async (
      audio: ArrayBuffer,
      playOptions: boolean | AudioOutputsServicePlayOptions,
    ) => {
      try {
        if (!audioManagerRef.current) {
          throw new AudioManagerInitialisationError(
            "AudioManager is not initialised",
          );
        }
        return await audioManagerRef.current.playCharacterSpeech(
          audio,
          playOptions,
        );
      } catch (error) {
        throw new AudioPlaybackError("Failed to play output");
      }
    },
    [],
  );

  const characterSpeechVolume = audioManagerRef.current
    ? audioManagerRef.current.characterSpeechVolume
    : 1;

  const setCharacterSpeechVolume = useCallback((volume: number) => {
    if (!audioManagerRef.current) {
      console.warn(
        "setMediaAudioMuted called but AudioManager is not initialised",
      );
      return;
    }
    audioManagerRef.current.characterSpeechVolume = volume;
    forceUpdate((x) => x + 1);
  }, []);

  const characterSpeechIsMuted = audioManagerRef.current
    ? audioManagerRef.current.characterSpeechIsMuted
    : false;

  const setCharacterSpeechMuted = useCallback((mute: boolean) => {
    if (!audioManagerRef.current) {
      console.warn(
        "setMediaAudioMuted called but AudioManager is not initialised",
      );
      return;
    }
    audioManagerRef.current.characterSpeechIsMuted = mute;
    forceUpdate((x) => x + 1);
  }, []);

  const playMediaAudio = useCallback((audioTracks: AudioTrack[]) => {
    audioManagerRef.current?.mediaAudioPlay(audioTracks);
  }, []);

  const mediaAudioVolume = audioManagerRef.current
    ? audioManagerRef.current.mediaAudioVolume
    : 1;

  const setMediaAudioVolume = useCallback((volume: number) => {
    if (!audioManagerRef.current) {
      console.warn(
        "setMediaAudioMuted called but AudioManager is not initialised",
      );
      return;
    }
    audioManagerRef.current.mediaAudioVolume = volume;
    forceUpdate((x) => x + 1);
  }, []);

  const mediaAudioIsMuted = audioManagerRef.current
    ? audioManagerRef.current.mediaAudioIsMuted
    : false;

  const setMediaAudioMuted = useCallback((mute: boolean) => {
    if (!audioManagerRef.current) {
      console.warn(
        "setMediaAudioMuted called but AudioManager is not initialised",
      );
      return;
    }
    audioManagerRef.current.mediaAudioIsMuted = mute;
    forceUpdate((x) => x + 1);
  }, []);

  const stopAllMedia = useCallback(() => {
    audioManagerRef.current?.mediaAudioStopAll();
  }, []);

  const liveTranscript = `${confirmedTranscripts} ${interimTranscript}`.trim();

  const value = useMemo(
    () => ({
      isListening,
      isBrowserSupported,
      initialise,
      transcript,
      interimTranscript,
      liveTranscript,
      clearTranscript,
      recordingStatus,
      startListening,
      stopListening,
      connect,
      disconnect,
      resetTimeout,
      playCharacterSpeech,
      characterSpeechVolume,
      setCharacterSpeechVolume,
      characterSpeechIsMuted,
      setCharacterSpeechMuted,
      playMediaAudio,
      mediaAudioVolume,
      setMediaAudioVolume,
      mediaAudioIsMuted,
      setMediaAudioMuted,
      stopAllMedia,
    }),
    [
      isListening,
      isBrowserSupported,
      initialise,
      transcript,
      interimTranscript,
      liveTranscript,
      clearTranscript,
      recordingStatus,
      startListening,
      stopListening,
      connect,
      disconnect,
      resetTimeout,
      playCharacterSpeech,
      characterSpeechVolume,
      setCharacterSpeechVolume,
      characterSpeechIsMuted,
      setCharacterSpeechMuted,
      playMediaAudio,
      mediaAudioVolume,
      setMediaAudioVolume,
      mediaAudioIsMuted,
      setMediaAudioMuted,
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
