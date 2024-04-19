import { useRef, useEffect, useCallback, useState } from "react";
import * as React from "react";
import {
  ChatMode,
  useConversation,
  UseConversationOptions,
  useSpeaker,
} from "@charisma-ai/react";
import type { MessageEvent, ReplyEvent } from "@charisma-ai/react";

import useMicrophone from "./useMicrophone";

export interface UseConversationWithMicrophoneAndSpeakerOptions {
  conversationOptions: UseConversationOptions & {
    onStartSpeaking?: (event: MessageEvent) => void;
    onStopSpeaking?: (event: MessageEvent) => void;
  };
  microphoneOptions?: { microphoneTimeout?: number };
}

export const useConversationWithMicrophoneAndSpeaker = ({
  conversationOptions,
  microphoneOptions = {},
}: UseConversationWithMicrophoneAndSpeakerOptions) => {
  const [isMicrophoneActive, setIsMicrophoneActive] = useState(false);
  const [isSpeakerActive, setIsSpeakerActive] = useState(false);

  const typeRef = useRef<(text: string) => void>();
  const replyRef = useRef<(event: ReplyEvent) => void>();

  const handleRecognise = useCallback((text: string) => {
    if (typeRef.current) {
      typeRef.current(text);
    }
    if (replyRef.current) {
      replyRef.current({ text });
    }
  }, []);

  const handleRecogniseInterim = useCallback((text: string) => {
    if (typeRef.current) {
      typeRef.current(text);
    }
  }, []);

  const handleTimeout = useCallback(() => {
    setIsMicrophoneActive(false);
  }, []);

  const speaker = useSpeaker();
  const microphone = useMicrophone({
    ...microphoneOptions,
    onRecognise: handleRecognise,
    onRecogniseInterim: handleRecogniseInterim,
    onTimeout: handleTimeout,
  });

  const { microphoneTimeout } = microphoneOptions;

  const handleMessage = (event: MessageEvent) => {
    if (conversationOptions.onMessage) {
      conversationOptions.onMessage(event);
    }

    if (event.endStory) {
      setIsMicrophoneActive(false);
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
    } else if (microphoneTimeout) {
      microphone.resetTimeout(microphoneTimeout);
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

  useEffect(() => {
    if (isMicrophoneActive && !isSpeaking && mode === ChatMode.Chat) {
      microphone.startListening({ timeout: microphoneTimeout });
    } else {
      microphone.stopListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMicrophoneActive, isSpeaking, microphoneTimeout, mode]);

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
    microphone: {
      isActive: isMicrophoneActive,
      isPaused: isMicrophoneActive && (isSpeaking || mode === ChatMode.Tap),
      changeIsActive: setIsMicrophoneActive,
    },
    speaker: {
      isActive: isSpeakerActive,
      changeIsActive: handleChangeIsSpeakerActive,
    },
  };
};

export type ConversationWithMicrophoneAndSpeakerChildProps = ReturnType<
  typeof useConversationWithMicrophoneAndSpeaker
>;

export interface ConversationWithMicrophoneAndSpeakerProps
  extends UseConversationWithMicrophoneAndSpeakerOptions {
  children: (
    props: ConversationWithMicrophoneAndSpeakerChildProps,
  ) => React.ReactNode;
}

const ConversationWithMicrophoneAndSpeaker = ({
  children,
  conversationOptions,
  microphoneOptions,
}: ConversationWithMicrophoneAndSpeakerProps) => {
  const childProps = useConversationWithMicrophoneAndSpeaker({
    conversationOptions,
    microphoneOptions,
  });
  return <>{children(childProps)}</>;
};

export default ConversationWithMicrophoneAndSpeaker;
