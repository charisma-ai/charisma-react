import React, { useRef, useEffect } from "react";
import { Charisma as CharismaSDK } from "@charisma-ai/sdk";

import { CharismaContext } from "./Context";

export interface UseCharismaOptions {
  playthroughToken?: string;
  charismaUrl?: string;
  isConnected?: boolean;
}

export const useCharisma = ({
  playthroughToken,
  charismaUrl,
  isConnected = false
}: UseCharismaOptions) => {
  const charismaRef = useRef<CharismaSDK>();

  useEffect(() => {
    if (playthroughToken) {
      const charisma = new CharismaSDK(playthroughToken, { charismaUrl });
      charismaRef.current = charisma;
      return () => {
        charisma.cleanup();
      };
    }
    /* Without this, TypeScript complains that not all code paths return a value. */
    return undefined;
  }, [playthroughToken]);

  useEffect(() => {
    if (charismaRef.current) {
      if (isConnected) {
        charismaRef.current.connect();
      } else {
        charismaRef.current.cleanup();
      }
    }
  }, [isConnected, charismaRef.current]);

  return charismaRef.current;
};

export interface CharismaProps extends UseCharismaOptions {
  children: React.ReactNode;
}

export const Charisma = ({ children, ...props }: CharismaProps) => {
  const charisma = useCharisma(props);
  return (
    <CharismaContext.Provider value={charisma || null}>
      <>{children}</>
    </CharismaContext.Provider>
  );
};
