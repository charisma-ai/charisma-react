import React, { useRef, useCallback } from "react";
import Queue from "p-queue";
import { ReplyEvent, MessageEvent } from "@charisma-ai/sdk";

import {
  useSimpleConversation,
  UseSimpleConversationOptions,
  SimpleConversationChildProps,
} from "./SimpleConversation";

export type UseQueuedConversationOptions = UseSimpleConversationOptions;
export type QueuedConversationChildProps = SimpleConversationChildProps;

export const useQueuedConversation = (props: UseSimpleConversationOptions) => {
  const messageQueue = useRef(new Queue({ concurrency: 1 }));

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      // eslint-disable-next-line prefer-destructuring
      const onMessage = props.onMessage;
      if (onMessage) {
        messageQueue.current.add(() => onMessage(event));
      }
    },
    [props.onMessage],
  );

  const { reply, ...childProps } = useSimpleConversation({
    ...props,
    onMessage: handleMessage,
  });

  const handleReply = useCallback(
    (event: ReplyEvent) => {
      // Replying interrupts any pending events (likely none, unless slow connection)
      messageQueue.current.clear();
      messageQueue.current = new Queue({ concurrency: 1 });
      reply(event);
    },
    [reply],
  );

  return {
    ...childProps,
    reply: handleReply,
  };
};

export interface QueuedConversationProps extends UseQueuedConversationOptions {
  children: (conversation: SimpleConversationChildProps) => React.ReactNode;
}

export const QueuedConversation = ({
  children,
  ...props
}: QueuedConversationProps) => {
  const conversation = useQueuedConversation(props);

  return <>{children(conversation)}</>;
};
