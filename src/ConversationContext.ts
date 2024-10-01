import { createContext, useContext } from "react";
import { ConversationChildProps } from "./Conversation.js";

export const ConversationContext = createContext<
  ConversationChildProps | undefined
>(undefined);

export const ConversationProvider = ConversationContext.Provider;
export const ConversationConsumer = ConversationContext.Consumer;

export const useConversationContext = () => useContext(ConversationContext);
