import { Action, action } from "easy-peasy";
import { ConversationState } from "@charisma-ai/react";

export interface ChatModel {
  chatStates: {
    [conversationUuid: string]: ConversationState | undefined;
  };

  setChatState: Action<
    ChatModel,
    { conversationUuid: string; state: ConversationState }
  >;
}

const chat: ChatModel = {
  chatStates: {},

  setChatState: action((state, payload) => {
    const key = payload.conversationUuid;
    return {
      ...state,
      chatStates: {
        ...state.chatStates,
        [key]: payload.state,
      },
    };
  }),
};

export default chat;
