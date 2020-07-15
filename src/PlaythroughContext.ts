import { createContext, useContext } from "react";
import { Playthrough, ConnectionStatus } from "@charisma-ai/sdk";

// If the context is `undefined`, it has not been initialised with a provider.
// If the context is `null`, it has been initialised with a provider, but the
// playthrough token has not been provided.
// Otherwise, the context is an instance of the Charisma SDK.

export type PlaythroughContextType = {
  connectionStatus: ConnectionStatus;
  playthrough: Playthrough | undefined;
  playthroughToken: string | undefined;
};

export const PlaythroughContext = createContext<
  PlaythroughContextType | undefined
>(undefined);

export const PlaythroughProvider = PlaythroughContext.Provider;
export const PlaythroughConsumer = PlaythroughContext.Consumer;

export const usePlaythroughContext = () => useContext(PlaythroughContext);
