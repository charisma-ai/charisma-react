import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Playthrough as PlaythroughClass,
  ConnectionStatus,
  setGlobalBaseUrl,
} from "@charisma-ai/sdk";

import useChangeableRef from "./useChangeableRef.js";

export interface UsePlaythroughOptions {
  playthroughToken?: string;
  charismaUrl?: string;
  autoconnect?: boolean;
  onConnectionStatus?: (connectionStatus: ConnectionStatus) => void;
  onError?: (error: any) => void;
  onProblem?: (problem: { code: string; error: string }) => void;
}

// Preserve equality across renders by defining this function outside the component.
const noOp = () => undefined;

export const usePlaythrough = ({
  playthroughToken,
  charismaUrl,
  autoconnect = false,
  onConnectionStatus = noOp,
  onError = noOp,
  onProblem = noOp,
}: UsePlaythroughOptions) => {
  const [playthrough, setPlaythrough] = useState<PlaythroughClass>();

  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [playerSessionId, setPlayerSessionId] = useState<string>();

  const onConnectionStatusRef = useChangeableRef(onConnectionStatus);
  const onErrorRef = useChangeableRef(onError);
  const onProblemRef = useChangeableRef(onProblem);

  useEffect(() => {
    if (charismaUrl) {
      setGlobalBaseUrl(charismaUrl);
    }
  }, [charismaUrl]);

  useEffect(() => {
    if (playthroughToken) {
      const newPlaythrough = new PlaythroughClass(playthroughToken);
      newPlaythrough
        .on("connection-status", (newConnectionStatus) => {
          setConnectionStatus(newConnectionStatus);
          onConnectionStatusRef.current(newConnectionStatus);
        })
        .on("error", (...args) => onErrorRef.current(...args))
        .on("problem", (...args) => onProblemRef.current(...args));
      setPlaythrough(newPlaythrough);
      return () => {
        newPlaythrough.disconnect();
      };
    }
    // Without this, TypeScript complains that not all code paths return a value.
    return undefined;
  }, [
    playthroughToken,
    // All the below refs never change, this is to satisfy the linter.
    onConnectionStatusRef,
    onErrorRef,
    onProblemRef,
  ]);

  useEffect(() => {
    const connect = async () => {
      if (playthrough && autoconnect) {
        const connection = await playthrough.connect();
        setPlayerSessionId(connection.playerSessionId);
      }
    };

    connect();
  }, [playthrough, autoconnect]);

  return {
    connectionStatus,
    playthrough,
    playthroughToken,
    playerSessionId,
  };
};

interface PlaythroughContextType {
  connectionStatus: ConnectionStatus;
  playthrough: PlaythroughClass | undefined;
  playthroughToken: string | undefined;
  playerSessionId: string | undefined;
}

const PlaythroughContext = createContext<PlaythroughContextType | undefined>(
  undefined,
);

export interface PlaythroughProps extends UsePlaythroughOptions {
  children: React.ReactNode;
}

export const Playthrough = ({ children, ...props }: PlaythroughProps) => {
  const playthrough = usePlaythrough(props);

  return (
    <PlaythroughContext.Provider value={playthrough}>
      {children}
    </PlaythroughContext.Provider>
  );
};

export const usePlaythroughContext = () => useContext(PlaythroughContext);
