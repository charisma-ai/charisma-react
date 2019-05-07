import { createContext } from "react";
import { Charisma } from "@charisma-ai/sdk";

// If the context is `undefined`, it has not been initialised with a provider.
// If the context is `null`, it has been initialised with a provider, but the
// playthrough token has not been provided.
// Otherwise, the context is an instance of the Charisma SDK.

export type CharismaContextType = Charisma | null | undefined;
export const CharismaContext = createContext<CharismaContextType>(undefined);
