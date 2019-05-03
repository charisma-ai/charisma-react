import { createContext } from "react";
import { Charisma } from "@charisma-ai/sdk";

export type CharismaContextType = Charisma | undefined;
export const CharismaContext = createContext<CharismaContextType>(undefined);
