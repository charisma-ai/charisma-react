import { Thunk, thunk, Action, action } from "easy-peasy";
import { ConversationState } from "@charisma-ai/react";

import { createPlaythroughToken, createConversation } from "../../createChat";

export interface ChatModel {
  chats: {
    [storyIdAndVersion: string]:
      | {
          playthroughToken?: string;
          conversationUuid?: string;
        }
      | undefined;
  };

  chatStates: {
    [conversationUuid: string]: ConversationState | undefined;
  };

  setChatPlaythroughToken: Action<
    ChatModel,
    {
      storyId: number;
      version?: number;
      languageCode: string;
      playthroughToken: string;
    }
  >;
  setChatConversationUuid: Action<
    ChatModel,
    {
      storyId: number;
      version?: number;
      languageCode: string;
      conversationUuid: string;
    }
  >;

  createChat: Thunk<
    ChatModel,
    { storyId: number; version?: number; languageCode: string }
  >;

  setChatState: Action<
    ChatModel,
    { conversationUuid: string; state: ConversationState }
  >;
}

const chat: ChatModel = {
  chats: {},
  chatStates: {},

  setChatPlaythroughToken: action((state, payload) => {
    const key = `${payload.storyId}-${payload.version}-${payload.languageCode}`;
    return {
      ...state,
      chats: {
        ...state.chats,
        [key]: {
          ...state.chats[key],
          playthroughToken: payload.playthroughToken,
        },
      },
    };
  }),

  setChatConversationUuid: action((state, payload) => {
    const key = `${payload.storyId}-${payload.version}-${payload.languageCode}`;
    return {
      ...state,
      chats: {
        ...state.chats,
        [key]: {
          ...state.chats[key],
          conversationUuid: payload.conversationUuid,
        },
      },
    };
  }),

  createChat: thunk(async (actions, payload) => {
    const { token } = await createPlaythroughToken(payload);
    const { conversationUuid } = await createConversation(token);

    actions.setChatPlaythroughToken({ ...payload, playthroughToken: token });
    actions.setChatConversationUuid({
      ...payload,
      conversationUuid,
    });
  }),

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
