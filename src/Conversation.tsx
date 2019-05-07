import React, { useContext, useEffect, useRef, useState, useMemo } from "react";
import {
  Conversation as ConversationType,
  MessageEvent,
  StartTypingEvent,
  StopTypingEvent,
  SceneCompletedEvent,
  Message
} from "@charisma-ai/sdk";

import { CharismaContext } from "./Context";

export interface UseConversationOptions {
  conversationId?: string;
  onMessage?: (event: MessageEvent) => void;
  onStartTyping?: (event: StartTypingEvent) => void;
  onStopTyping?: (event: StopTypingEvent) => void;
  onSceneCompleted?: (event: SceneCompletedEvent) => void;
}

export enum ChatMode {
  Tap = "tap",
  Chat = "chat"
}

export interface ConversationChildProps {
  inputValue: string;
  isTyping: boolean;
  messages: Message[];
  mode: ChatMode;
  type: (newInputValue: string) => void;
  start: ConversationType["start"];
  reply: ConversationType["reply"];
  tap: ConversationType["tap"];
}

export const useConversation = ({
  conversationId,
  onMessage,
  onStartTyping,
  onStopTyping,
  onSceneCompleted
}: UseConversationOptions) => {
  const charisma = useContext(CharismaContext);

  if (charisma === undefined) {
    throw new Error(
      `To use \`Conversation\`, you must wrap it within a \`Charisma\` instance.`
    );
  }

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [mode, setMode] = useState<ChatMode>(ChatMode.Chat);

  // These need to be refs, so we don't have to keep attaching and deattaching
  // the conversation `on` handlers. We can refer to the ref instead.
  const onMessageRef = useRef<(event: MessageEvent) => void>(() => {});
  const onStartTypingRef = useRef<(event: StartTypingEvent) => void>(() => {});
  const onStopTypingRef = useRef<(event: StopTypingEvent) => void>(() => {});
  const onSceneCompletedRef = useRef<(event: SceneCompletedEvent) => void>(
    () => {}
  );

  // Re-write the function refs if one of their dependencies change.
  useEffect(() => {
    onMessageRef.current = (event: MessageEvent) => {
      setMessages([...messages, event.message]);

      if (event.message.tapToContinue) {
        setMode(ChatMode.Tap);
      } else {
        setMode(ChatMode.Chat);
      }

      if (onMessage) {
        onMessage(event);
      }
    };
  }, [onMessage, messages]);

  useEffect(() => {
    onStartTypingRef.current = (event: StartTypingEvent) => {
      setIsTyping(true);
      if (onStartTyping) {
        onStartTyping(event);
      }
    };
  }, [onStartTyping]);

  useEffect(() => {
    onStopTypingRef.current = (event: StopTypingEvent) => {
      setIsTyping(false);
      if (onStopTyping) {
        onStopTyping(event);
      }
    };
  }, [onStopTyping]);

  useEffect(() => {
    onSceneCompletedRef.current = (event: SceneCompletedEvent) => {
      if (onSceneCompleted) {
        onSceneCompleted(event);
      }
    };
  }, [onSceneCompleted]);

  const conversationRef = useRef<ConversationType>();

  useEffect(() => {
    (async function run() {
      if (charisma && conversationId) {
        const conversation = await charisma.joinConversation(conversationId);
        conversation.on("message", event => onMessageRef.current(event));
        conversation.on("start-typing", event =>
          onStartTypingRef.current(event)
        );
        conversation.on("stop-typing", event => onStopTypingRef.current(event));
        conversation.on("scene-completed", event =>
          onSceneCompletedRef.current(event)
        );
        conversationRef.current = conversation;
        return () => {
          charisma.leaveConversation(conversationId);
          conversationRef.current = undefined;
        };
      }
      return undefined;
    })();
  }, [charisma, conversationId]);

  const returnedValue = useMemo((): ConversationChildProps => {
    const common = {
      inputValue,
      isTyping,
      messages,
      mode,
      type: setInputValue
    };
    if (conversationRef.current) {
      return {
        ...common,
        start: conversationRef.current.start,
        reply: conversationRef.current.reply,
        tap: conversationRef.current.tap
      };
    }
    return {
      ...common,
      start: () => {
        throw new Error(
          "`start` was called without joining a conversation. Please provide a valid `conversationId` as a prop for `Conversation`."
        );
      },
      reply: () => {
        throw new Error(
          "`reply` was called without joining a conversation. Please provide a valid `conversationId` as a prop for `Conversation`."
        );
      },
      tap: () => {
        throw new Error(
          "`tap` was called without joining a conversation. Please provide a valid `conversationId` as a prop for `Conversation`."
        );
      }
    };
  }, [inputValue, isTyping, messages, conversationRef.current]);

  return returnedValue;
};

export interface ConversationProps extends UseConversationOptions {
  children: (conversation: ConversationChildProps) => React.ReactNode;
}

export const Conversation = ({ children, ...props }: ConversationProps) => {
  const conversation = useConversation(props);

  return <>{children(conversation)}</>;
};
