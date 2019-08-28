import React, { useContext, useEffect, useRef, useMemo, useState } from "react";
import {
  Conversation as ConversationType,
  MessageEvent,
  StartTypingEvent,
  StopTypingEvent,
  SceneCompleteEvent,
  SpeechConfig,
} from "@charisma-ai/sdk";

import { CharismaContext } from "./Context";
import useChangeableRef from "./useChangeableRef";

export interface UseSimpleConversationOptions {
  conversationId?: number;
  onMessage?: (event: MessageEvent) => void;
  onStartTyping?: (event: StartTypingEvent) => void;
  onStopTyping?: (event: StopTypingEvent) => void;
  onSceneComplete?: (event: SceneCompleteEvent) => void;
  speechConfig?: SpeechConfig;
  stopOnSceneComplete?: boolean;
}

export interface SimpleConversationChildProps {
  isReady: boolean;
  start: ConversationType["start"];
  reply: ConversationType["reply"];
  tap: ConversationType["tap"];
  resume: ConversationType["resume"];
}

export const useSimpleConversation = ({
  conversationId,
  onMessage,
  onStartTyping,
  onStopTyping,
  onSceneComplete,
  speechConfig,
  stopOnSceneComplete,
}: UseSimpleConversationOptions) => {
  const charisma = useContext(CharismaContext);

  if (charisma === undefined) {
    throw new Error(
      `To use \`SimpleConversation\`, you must wrap it within a \`Charisma\` instance.`,
    );
  }

  // These need to be refs, so we don't have to keep attaching and deattaching
  // the conversation `on` handlers. We can refer to the constant ref instead.
  const onMessageRef = useChangeableRef(onMessage);
  const onStartTypingRef = useChangeableRef(onStartTyping);
  const onStopTypingRef = useChangeableRef(onStopTyping);
  const onSceneCompleteRef = useChangeableRef(onSceneComplete);

  const [isReady, setIsReady] = useState(false);

  const conversationRef = useRef<ConversationType>();

  useEffect(() => {
    if (charisma && conversationId) {
      const conversation = charisma.joinConversation(conversationId);
      conversation.on("message", event => {
        if (onMessageRef.current) {
          onMessageRef.current(event);
        }
      });
      conversation.on("start-typing", event => {
        if (onStartTypingRef.current) {
          onStartTypingRef.current(event);
        }
      });
      conversation.on("stop-typing", event => {
        if (onStopTypingRef.current) {
          onStopTypingRef.current(event);
        }
      });
      conversation.on("scene-complete", event => {
        if (onSceneCompleteRef.current) {
          onSceneCompleteRef.current(event);
        }
      });

      conversation.setSpeechConfig(speechConfig);
      if (typeof stopOnSceneComplete === "boolean") {
        conversation.setStopOnSceneComplete(stopOnSceneComplete);
      }

      conversationRef.current = conversation;
      setIsReady(true);
    }

    return () => {
      if (
        charisma &&
        conversationId &&
        charisma.getConversation(conversationId)
      ) {
        charisma.leaveConversation(conversationId);
        conversationRef.current = undefined;
        setIsReady(false);
      }
    };
  }, [charisma, conversationId]);

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.setSpeechConfig(speechConfig);
    }
  }, [speechConfig]);

  useEffect(() => {
    if (conversationRef.current && typeof stopOnSceneComplete === "boolean") {
      conversationRef.current.setStopOnSceneComplete(stopOnSceneComplete);
    }
  }, [stopOnSceneComplete]);

  const returnedValue = useMemo((): SimpleConversationChildProps => {
    return {
      isReady,
      start: event => {
        if (conversationRef.current) {
          conversationRef.current.start(event);
        }
      },
      reply: event => {
        if (conversationRef.current) {
          conversationRef.current.reply(event);
        }
      },
      tap: () => {
        if (conversationRef.current) {
          conversationRef.current.tap();
        }
      },
      resume: () => {
        if (conversationRef.current) {
          conversationRef.current.resume();
        }
      },
    };
  }, [isReady]);

  return returnedValue;
};

export interface SimpleConversationProps extends UseSimpleConversationOptions {
  children: (conversation: SimpleConversationChildProps) => React.ReactNode;
}

export const SimpleConversation = ({
  children,
  ...props
}: SimpleConversationProps) => {
  const conversation = useSimpleConversation(props);

  return <>{children(conversation)}</>;
};
