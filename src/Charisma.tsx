import React, { useEffect, useState } from "react";
import {
  Charisma as CharismaSDK,
  ConnectionStatus,
  setBaseUrl,
} from "@charisma-ai/sdk";

import { CharismaProvider } from "./Context";
import useChangeableRef from "./useChangeableRef";

export interface UseCharismaOptions {
  playthroughToken?: string;
  charismaUrl?: string;
  isConnected?: boolean;
  onConnectionStatus?: (connectionStatus: ConnectionStatus) => void;
  onError?: (error: any) => void;
  onProblem?: (problem: { type: string; error: string }) => void;
}

// Preserve equality across renders by defining this function outside the component.
const noOp = () => undefined;

export const useCharisma = ({
  playthroughToken,
  charismaUrl,
  isConnected = false,
  onConnectionStatus = noOp,
  onError = noOp,
  onProblem = noOp,
}: UseCharismaOptions) => {
  const [charisma, setCharisma] = useState<CharismaSDK>();

  const onConnectionStatusRef = useChangeableRef(onConnectionStatus);
  const onErrorRef = useChangeableRef(onError);
  const onProblemRef = useChangeableRef(onProblem);

  useEffect(() => {
    if (playthroughToken) {
      if (charismaUrl) {
        setBaseUrl(charismaUrl);
      }

      const newCharisma = new CharismaSDK(playthroughToken);
      newCharisma
        .on("connection-status", (...args) =>
          onConnectionStatusRef.current(...args),
        )
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
    onConnectionStatusRef,
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
