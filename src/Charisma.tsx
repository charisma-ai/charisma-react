import React, { useEffect, useState } from "react";
import { Charisma as CharismaSDK } from "@charisma-ai/sdk";

import { CharismaProvider } from "./Context";
import useChangeableRef from "./useChangeableRef";

export interface UseCharismaOptions {
  playthroughToken?: string;
  charismaUrl?: string;
  isConnected?: boolean;
  onConnect?: () => void;
  onReconnect?: () => void;
  onReconnecting?: () => void;
  onDisconnect?: () => void;
  onReady?: () => void;
  onError?: (error: any) => void;
  onProblem?: (problem: { type: string; error: string }) => void;
}

// Good idea to preserve equality across renders.
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noOp = () => {};

export const useCharisma = ({
  playthroughToken,
  charismaUrl,
  isConnected = false,
  onConnect = noOp,
  onReconnect = noOp,
  onReconnecting = noOp,
  onDisconnect = noOp,
  onReady = noOp,
  onError = noOp,
  onProblem = noOp,
}: UseCharismaOptions) => {
  const [charisma, setCharisma] = useState<CharismaSDK>();

  const onConnectRef = useChangeableRef(onConnect);
  const onReconnectRef = useChangeableRef(onReconnect);
  const onReconnectingRef = useChangeableRef(onReconnecting);
  const onDisconnectRef = useChangeableRef(onDisconnect);
  const onReadyRef = useChangeableRef(onReady);
  const onErrorRef = useChangeableRef(onError);
  const onProblemRef = useChangeableRef(onProblem);

  useEffect(() => {
    if (playthroughToken) {
      const newCharisma = new CharismaSDK(playthroughToken, { charismaUrl });
      newCharisma
        .on("connect", (...args) => onConnectRef.current(...args))
        .on("reconnect", (...args) => onReconnectRef.current(...args))
        .on("reconnecting", (...args) => onReconnectingRef.current(...args))
        .on("disconnect", (...args) => onDisconnectRef.current(...args))
        .on("ready", (...args) => onReadyRef.current(...args))
        .on("error", (...args) => onErrorRef.current(...args))
        .on("problem", (...args) => onProblemRef.current(...args));
      setCharisma(newCharisma);
      return () => {
        newCharisma.cleanup();
      };
    }
    // Without this, TypeScript complains that not all code paths return a value.
    return undefined;
  }, [
    playthroughToken,
    charismaUrl,
    // All the below refs never change, this is to satisfy the linter.
    onConnectRef,
    onReconnectRef,
    onReconnectingRef,
    onDisconnectRef,
    onReadyRef,
    onErrorRef,
    onProblemRef,
  ]);

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
    <CharismaProvider value={charisma || null}>
      {typeof children === "function" ? children(charisma) : children}
    </CharismaProvider>
  );
};
