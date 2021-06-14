import React, { useEffect, useRef, useMemo } from "react";
import {
  Conversation as ConversationType,
  MessageEvent,
  StartTypingEvent,
  StopTypingEvent,
  EpisodeCompleteEvent,
  SpeechConfig,
} from "@charisma-ai/sdk";

import { usePlaythroughContext } from "./PlaythroughContext";
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
  start: ConversationType["start"];
  reply: ConversationType["reply"];
  tap: ConversationType["tap"];
  action: ConversationType["action"];
  resume: ConversationType["resume"];
}

const createEventHandler = <T extends Record<string, any>[]>(
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
  const playthroughContext = usePlaythroughContext();

  if (playthroughContext === undefined) {
    throw new Error(
      `To use \`SimpleConversation\`, you must wrap it within a \`Playthrough\` instance.`,
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
  const speechConfigRef = useChangeableRef(speechConfig);

  const conversationRef = useRef<ConversationType>();

  const { playthrough } = playthroughContext;

  useEffect(() => {
    if (playthrough && conversationId) {
      const conversation = playthrough.joinConversation(conversationId);

      conversation.on("message", createEventHandler(onMessageRef));
      conversation.on("start-typing", createEventHandler(onStartTypingRef));
      conversation.on("stop-typing", createEventHandler(onStopTypingRef));
      conversation.on(
        "episode-complete",
        createEventHandler(onEpisodeCompleteRef),
      );
      conversation.on("playback-start", createEventHandler(onPlaybackStartRef));
      conversation.on("playback-stop", createEventHandler(onPlaybackStopRef));

      conversation.setSpeechConfig(speechConfigRef.current);

      conversationRef.current = conversation;
    }

    return () => {
      if (
        playthrough &&
        conversationId &&
        playthrough.getConversation(conversationId)
      ) {
        playthrough.leaveConversation(conversationId);
        conversationRef.current = undefined;
      }
    };
  }, [
    playthrough,
    conversationId,
    onMessageRef,
    onStartTypingRef,
    onStopTypingRef,
    onEpisodeCompleteRef,
    onPlaybackStartRef,
    onPlaybackStopRef,
    speechConfigRef,
  ]);

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.setSpeechConfig(speechConfig);
    }
  }, [speechConfig]);

  const returnedValue = useMemo((): SimpleConversationChildProps => {
    return {
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
      action: (event) => {
        if (conversationRef.current) {
          conversationRef.current.action(event);
        }
      },
      resume: () => {
        if (conversationRef.current) {
          conversationRef.current.resume();
        }
      },
    };
  }, []);

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
