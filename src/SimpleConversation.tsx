import React, { useContext, useEffect, useRef, useMemo, useState } from "react";
import {
  Conversation as ConversationType,
  MessageEvent,
  StartTypingEvent,
  StopTypingEvent,
  EpisodeCompleteEvent,
  SpeechConfig,
} from "@charisma-ai/sdk";

import { CharismaContext } from "./Context";
import useChangeableRef from "./useChangeableRef";

export interface UseSimpleConversationOptions {
  conversationId?: number;
  onMessage?: (event: MessageEvent) => void;
  onStartTyping?: (event: StartTypingEvent) => void;
  onStopTyping?: (event: StopTypingEvent) => void;
  onEpisodeComplete?: (event: EpisodeCompleteEvent) => void;
  onPlaybackStart?: () => void;
  onPlaybackStop?: () => void;
  speechConfig?: SpeechConfig;
}

export interface SimpleConversationChildProps {
  isReady: boolean;
  start: ConversationType["start"];
  reply: ConversationType["reply"];
  tap: ConversationType["tap"];
  resume: ConversationType["resume"];
}

const createEventHandler = <T extends {}[]>(
  ref: React.MutableRefObject<((...args: T) => void) | undefined>,
) => (...args: T) => {
  if (ref.current) {
    ref.current(...args);
  }
};

export const useSimpleConversation = ({
  conversationId,
  onMessage,
  onStartTyping,
  onStopTyping,
  onEpisodeComplete,
  onPlaybackStart,
  onPlaybackStop,
  speechConfig,
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
  const onEpisodeCompleteRef = useChangeableRef(onEpisodeComplete);
  const onPlaybackStartRef = useChangeableRef(onPlaybackStart);
  const onPlaybackStopRef = useChangeableRef(onPlaybackStop);

  const [isReady, setIsReady] = useState(false);

  const conversationRef = useRef<ConversationType>();

  useEffect(() => {
    if (charisma && conversationId) {
      const conversation = charisma.joinConversation(conversationId);

      conversation.on("message", createEventHandler(onMessageRef));
      conversation.on("start-typing", createEventHandler(onStartTypingRef));
      conversation.on("stop-typing", createEventHandler(onStopTypingRef));
      conversation.on(
        "episode-complete",
        createEventHandler(onEpisodeCompleteRef),
      );
      conversation.on("playback-start", createEventHandler(onPlaybackStartRef));
      conversation.on("playback-stop", createEventHandler(onPlaybackStopRef));

      conversation.setSpeechConfig(speechConfig);

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
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [charisma, conversationId]);

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.setSpeechConfig(speechConfig);
    }
  }, [speechConfig]);

  const returnedValue = useMemo((): SimpleConversationChildProps => {
    return {
      isReady,
      start: (event) => {
        if (conversationRef.current) {
          conversationRef.current.start(event);
        }
      },
      reply: (event) => {
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
