import React, { useRef, useEffect } from "react";
import { Charisma as CharismaSDK } from "@charisma-ai/sdk";

import { CharismaContext } from "./Context";

export interface UseCharismaOptions {
  playthroughToken: string;
  charismaUrl?: string;
}

export const useCharisma = ({
  playthroughToken,
  charismaUrl
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

  return charismaRef.current;
};

export interface CharismaProps extends UseCharismaOptions {
  children: React.ReactNode;
}

export const Charisma = ({ children, ...props }: CharismaProps) => {
  const charisma = useCharisma(props);
  return (
    <CharismaContext.Provider value={charisma}>
      {children}
    </CharismaContext.Provider>
  );
};
