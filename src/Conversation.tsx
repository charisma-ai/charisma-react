import React, { useContext, useEffect, useRef, useState, useMemo } from "react";
import {
  Conversation as ConversationType,
  MessageEvent,
  StartTypingEvent,
  StopTypingEvent,
  SceneCompletedEvent,
  Message,
  StartEvent,
  ReplyEvent,
  SpeechConfig,
  Mood
} from "@charisma-ai/sdk";

import { CharismaContext } from "./Context";

export interface UseConversationOptions {
  conversationId?: number;
  onChangeCharacterMoods?: (newCharacterMoods: CharacterMoods) => void;
  onMessage?: (event: MessageEvent) => void;
  onStartTyping?: (event: StartTypingEvent) => void;
  onStopTyping?: (event: StopTypingEvent) => void;
  onSceneCompleted?: (event: SceneCompletedEvent) => void;
  onStart?: (event: StartEvent) => void;
  onReply?: (event: ReplyEvent) => void;
  onTap?: () => void;
  speechConfig?: SpeechConfig;
  stopOnSceneComplete?: boolean;
}

export enum ChatMode {
  Tap = "tap",
  Chat = "chat"
}

export interface CharacterMoods {
  [id: number]: Mood;
}

export type StoredMessage =
  | Message
  | { type: "player"; message: { text: string } };

export interface ConversationChildProps {
  inputValue: string;
  isTyping: boolean;
  messages: StoredMessage[];
  mode: ChatMode;
  type: (newInputValue: string) => void;
  start: ConversationType["start"];
  reply: ConversationType["reply"];
  tap: ConversationType["tap"];
}

export const useConversation = ({
  conversationId,
  onChangeCharacterMoods,
  onMessage,
  onStartTyping,
  onStopTyping,
  onSceneCompleted,
  onStart,
  onReply,
  onTap,
  speechConfig,
  stopOnSceneComplete
}: UseConversationOptions) => {
  const charisma = useContext(CharismaContext);

  if (charisma === undefined) {
    throw new Error(
      `To use \`Conversation\`, you must wrap it within a \`Charisma\` instance.`
    );
  }

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [mode, setMode] = useState<ChatMode>(ChatMode.Chat);

  // These need to be refs, so we don't have to keep attaching and deattaching
  // the conversation `on` handlers. We can refer to the ref instead.
  const onMessageRef = useRef<(event: MessageEvent) => void>(() => {});
  const onStartTypingRef = useRef<(event: StartTypingEvent) => void>(() => {});
  const onStopTypingRef = useRef<(event: StopTypingEvent) => void>(() => {});
  const onSceneCompletedRef = useRef<(event: SceneCompletedEvent) => void>(
    () => {}
  );

  const characterMoodsRef = useRef<CharacterMoods>({});

  // Re-write the function refs if one of their dependencies change.
  useEffect(() => {
    onMessageRef.current = (event: MessageEvent) => {
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
    };
  }, [onMessage, messages, onChangeCharacterMoods]);

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
    if (conversationRef.current) {
      conversationRef.current.setSpeechConfig(speechConfig);
      if (typeof stopOnSceneComplete === "boolean") {
        conversationRef.current.setStopOnSceneEnd(stopOnSceneComplete);
      }
    }
  }, [speechConfig, stopOnSceneComplete]);

  useEffect(() => {
    (async function run() {
      if (charisma && conversationId) {
        const conversation = await charisma.joinConversation(conversationId);
        conversation.on("message", event => {
          onMessageRef.current(event);
        });
        conversation.on("start-typing", event =>
          onStartTypingRef.current(event)
        );
        conversation.on("stop-typing", event => onStopTypingRef.current(event));
        conversation.on("scene-completed", event =>
          onSceneCompletedRef.current(event)
        );
        conversation.setSpeechConfig(speechConfig);
        if (typeof stopOnSceneComplete === "boolean") {
          conversation.setStopOnSceneEnd(stopOnSceneComplete);
        }
        conversationRef.current = conversation;
        return () => {
          charisma.leaveConversation(conversationId);
          conversationRef.current = undefined;
        };
      }
      return undefined;
    })();
  }, [charisma, conversationId]);

  const onStartRef = useRef(onStart);
  const onReplyRef = useRef(onReply);
  const onTapRef = useRef(onTap);
  useEffect(() => {
    onStartRef.current = onStart;
  }, [onStart]);
  useEffect(() => {
    onReplyRef.current = onReply;
  }, [onReply]);
  useEffect(() => {
    onTapRef.current = onTap;
  }, [onTap]);

  const returnedValue = useMemo((): ConversationChildProps => {
    return {
      inputValue,
      isTyping,
      messages,
      mode,
      type: setInputValue,
      start: event => {
        if (onStartRef.current) {
          onStartRef.current(event || {});
        }
        setMessages([]);
        if (conversationRef.current) {
          conversationRef.current.start(event);
        }
      },
      reply: event => {
        if (onReplyRef.current) {
          onReplyRef.current(event);
        }
        setMessages([
          ...messages,
          {
            type: "player",
            message: {
              text: event.text
            }
          }
        ]);
        setInputValue("");
        if (conversationRef.current) {
          conversationRef.current.reply(event);
        }
      },
      tap: () => {
        if (onTapRef.current) {
          onTapRef.current();
        }
        if (conversationRef.current) {
          conversationRef.current.tap();
        }
      }
    };
  }, [inputValue, isTyping, messages, mode]);

  return returnedValue;
};

export interface ConversationProps extends UseConversationOptions {
  children: (conversation: ConversationChildProps) => React.ReactNode;
}

export const Conversation = ({ children, ...props }: ConversationProps) => {
  const conversation = useConversation(props);

  return <>{children(conversation)}</>;
};
