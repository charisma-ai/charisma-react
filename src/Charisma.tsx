import React, { useRef, useEffect, useState } from "react";
import { Charisma as CharismaSDK } from "@charisma-ai/sdk";

import { CharismaContext } from "./Context";

export interface UseCharismaOptions {
  playthroughToken?: string;
  charismaUrl?: string;
  isConnected?: boolean;
  onConnect?: () => void;
  onReady?: () => void;
  onError?: (error: any) => void;
}

export const useCharisma = ({
  playthroughToken,
  charismaUrl,
  onConnect = () => {},
  onReady = () => {},
  onError = () => {},
  isConnected = false,
}: UseCharismaOptions) => {
  const [charisma, setCharisma] = useState<CharismaSDK>();

  const onConnectRef = useRef(onConnect);
  useEffect(() => {
    onConnectRef.current = onConnect;
  }, [onConnect]);

  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (playthroughToken) {
      const newCharisma = new CharismaSDK(playthroughToken, { charismaUrl });
      newCharisma.on("connect", onConnectRef.current);
      newCharisma.on("ready", onReadyRef.current);
      newCharisma.on("error", onErrorRef.current);
      setCharisma(newCharisma);
      return () => {
        newCharisma.cleanup();
      };
    }
    /* Without this, TypeScript complains that not all code paths return a value. */
    return undefined;
  }, [playthroughToken]);

  useEffect(() => {
    if (charisma) {
      if (isConnected) {
        charisma.connect();
      } else {
        charisma.cleanup();
      }
    }
  }, [isConnected, charisma]);

  return charisma;
};

export interface CharismaProps extends UseCharismaOptions {
  children: React.ReactNode | ((charisma?: CharismaSDK) => React.ReactNode);
}

export const Charisma = ({ children, ...props }: CharismaProps) => {
  const charisma = useCharisma(props);
  return (
    <CharismaContext.Provider value={charisma || null}>
      {typeof children === "function" ? children(charisma) : children}
    </CharismaContext.Provider>
  );
};
