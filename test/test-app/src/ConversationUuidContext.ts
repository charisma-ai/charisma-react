import { createContext, useContext } from "react";

const ConversationUuidContext = createContext<string | undefined>(undefined);

export const useConversationUuid = () => useContext(ConversationUuidContext);

export const ConversationUuidProvider = ConversationUuidContext.Provider;
