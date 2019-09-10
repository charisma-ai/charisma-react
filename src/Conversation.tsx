import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Conversation as ConversationType,
  MessageEvent,
  StartTypingEvent,
  StopTypingEvent,
  SceneCompleteEvent,
  Message,
  StartEvent,
  ReplyEvent,
  SpeechConfig,
  Mood,
} from "@charisma-ai/sdk";

import { useQueuedConversation } from "./QueuedConversation";

export interface UseConversationOptions {
  conversationId?: number;
  onChangeCharacterMoods?: (newCharacterMoods: CharacterMoods) => void;
  onMessage?: (event: MessageEvent) => void;
  onStartTyping?: (event: StartTypingEvent) => void;
  onStopTyping?: (event: StopTypingEvent) => void;
  onSceneComplete?: (event: SceneCompleteEvent) => void;
  onStart?: (event: StartEvent) => void;
  onReply?: (event: ReplyEvent) => void;
  onResume?: () => void;
  onTap?: () => void;
  shouldResumeOnReady?: boolean | StartEvent;
  shouldStartOnReady?: boolean | StartEvent;
  speechConfig?: SpeechConfig;
  stopOnSceneComplete?: boolean;
}

export enum ChatMode {
  Tap = "tap",
  Chat = "chat",
}

export interface CharacterMoods {
  [id: number]: Mood;
}

export type StoredMessage =
  | Message
  | { type: "player"; timestamp: number; message: { text: string } };

export interface ConversationChildProps {
  inputValue: string;
  isTyping: boolean;
  messages: StoredMessage[];
  mode: ChatMode;
  type: (newInputValue: string) => void;
  start: ConversationType["start"];
  reply: ConversationType["reply"];
  tap: ConversationType["tap"];
  resume: ConversationType["resume"];
}

export const useConversation = ({
  conversationId,
  onChangeCharacterMoods,
  onMessage,
  onStartTyping,
  onStopTyping,
  onSceneComplete,
  onStart,
  onReply,
  onResume,
  onTap,
  shouldResumeOnReady,
  shouldStartOnReady,
  speechConfig,
  stopOnSceneComplete,
}: UseConversationOptions) => {
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [mode, setMode] = useState<ChatMode>(ChatMode.Chat);

  const characterMoodsRef = useRef<CharacterMoods>({});

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      setMessages([...messages, event]);

      if (event.tapToContinue) {
        setMode(ChatMode.Tap);
      } else {
        setMode(ChatMode.Chat);
      }

      if (event.characterMoods.length > 0) {
        const newCharacterMoods = { ...characterMoodsRef.current };
        event.characterMoods.forEach(({ id, mood }) => {
          newCharacterMoods[id] = mood;
        });
        characterMoodsRef.current = newCharacterMoods;
        if (onChangeCharacterMoods) {
          onChangeCharacterMoods(newCharacterMoods);
        }
      }

      if (onMessage) {
        onMessage(event);
      }
    },
    [onMessage, messages, onChangeCharacterMoods],
  );

  const handleStartTyping = useCallback(
    (event: StartTypingEvent) => {
      setIsTyping(true);
      if (onStartTyping) {
        onStartTyping(event);
      }
    },
    [onStartTyping],
  );

  const handleStopTyping = useCallback(
    (event: StopTypingEvent) => {
      setIsTyping(false);
      if (onStopTyping) {
        onStopTyping(event);
      }
    },
    [onStopTyping],
  );

  const { start, reply, resume, tap, isReady } = useQueuedConversation({
    conversationId,
    onMessage: handleMessage,
    onStartTyping: handleStartTyping,
    onStopTyping: handleStopTyping,
    onSceneComplete,
    speechConfig,
    stopOnSceneComplete,
  });

  useEffect(() => {
    if (isReady) {
      if (shouldResumeOnReady) {
        resume();
      }
      if (shouldStartOnReady) {
        const event = shouldStartOnReady === true ? {} : shouldStartOnReady;
        start(event);
      }
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [isReady]);

  const handleStart = useCallback(
    (event: StartEvent = {}) => {
      setMessages([]);
      if (onStart) {
        onStart(event);
      }
      start(event);
    },
    [onStart, start],
  );

  const handleReply = useCallback(
    (event: ReplyEvent) => {
      if (onReply) {
        onReply(event);
      }
      setMessages([
        ...messages,
        {
          type: "player",
          timestamp: Date.now(),
          message: {
            text: event.text,
          },
        },
      ]);
      setInputValue("");
      reply(event);
    },
    [onReply, messages, reply],
  );

  const handleTap = useCallback(() => {
    if (onTap) {
      onTap();
    }
    tap();
  }, [onTap, tap]);

  const handleResume = useCallback(() => {
    if (onResume) {
      onResume();
    }
    resume();
  }, [onResume, resume]);

  return {
    inputValue,
    isTyping,
    messages,
    mode,
    type: setInputValue,
    start: handleStart,
    reply: handleReply,
    tap: handleTap,
    resume: handleResume,
  };
};

export interface ConversationProps extends UseConversationOptions {
  children: (conversation: ConversationChildProps) => React.ReactNode;
}

export const Conversation = ({ children, ...props }: ConversationProps) => {
  const conversation = useConversation(props);

  return <>{children(conversation)}</>;
};
