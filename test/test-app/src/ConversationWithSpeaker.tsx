import { useRef, useEffect, useCallback, useState } from "react";
import * as React from "react";
import {
  useConversation,
  UseConversationOptions,
  useSpeaker,
} from "@charisma-ai/react";
import type { MessageEvent, ReplyEvent } from "@charisma-ai/react";

export interface UseConversationWithSpeakerOptions {
  conversationOptions: UseConversationOptions & {
    onStartSpeaking?: (event: MessageEvent) => void;
    onStopSpeaking?: (event: MessageEvent) => void;
  };
}

export const useConversationWithSpeaker = ({
  conversationOptions,
}: UseConversationWithSpeakerOptions) => {
  const [isSpeakerActive, setIsSpeakerActive] = useState(false);

  const typeRef = useRef<(text: string) => void>();
  const replyRef = useRef<(event: ReplyEvent) => void>();

  const speaker = useSpeaker();

  const handleMessage = (event: MessageEvent) => {
    if (conversationOptions.onMessage) {
      conversationOptions.onMessage(event);
    }

    if (
      isSpeakerActive &&
      event.type === "character" &&
      event.message.speech &&
      typeof event.message.speech.audio !== "string"
    ) {
      if (conversationOptions.onStartSpeaking) {
        conversationOptions.onStartSpeaking(event);
      }
      speaker.play(event.message.speech.audio, {
        trackId: event.message.character?.id.toString(),
        interrupt: "track",
      });

      if (conversationOptions.onStopSpeaking) {
        conversationOptions.onStopSpeaking(event);
      }
    }
  };

  const conversation = useConversation({
    ...conversationOptions,
    onMessage: handleMessage,
    speechConfig: isSpeakerActive
      ? conversationOptions.speechConfig
      : undefined,
  });

  const { type, reply, mode } = conversation;
  useEffect(() => {
    typeRef.current = type;
  }, [type]);
  useEffect(() => {
    replyRef.current = reply;
  }, [reply]);

  const { isSpeaking, makeAvailable } = speaker;

  const handleChangeIsSpeakerActive = useCallback(
    (isActive: boolean) => {
      if (isActive) {
        makeAvailable();
      }
      setIsSpeakerActive(isActive);
    },
    [makeAvailable],
  );

  return {
    conversation,
    speaker: {
      isActive: isSpeakerActive,
      changeIsActive: handleChangeIsSpeakerActive,
    },
  };
};

export type ConversationWithSpeakerChildProps = ReturnType<
  typeof useConversationWithSpeaker
>;

export interface ConversationWithSpeakerProps
  extends UseConversationWithSpeakerOptions {
  children: (props: ConversationWithSpeakerChildProps) => React.ReactNode;
}

const ConversationWithSpeaker = ({
  children,
  conversationOptions,
}: ConversationWithSpeakerProps) => {
  const childProps = useConversationWithSpeaker({
    conversationOptions,
  });
  return <>{children(childProps)}</>;
};

export default ConversationWithSpeaker;
