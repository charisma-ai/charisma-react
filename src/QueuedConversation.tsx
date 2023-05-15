import React, { useRef, useCallback } from "react";
import Queue from "p-queue";
import { ReplyEvent, MessageEvent } from "@charisma-ai/sdk";

import {
  useSimpleConversation,
  UseSimpleConversationOptions,
  SimpleConversationChildProps,
} from "./SimpleConversation.js";

export type UseQueuedConversationOptions = Omit<
  UseSimpleConversationOptions,
  "onMessage"
> & {
  onMessage?: (event: MessageEvent) => Promise<void> | void;
};
export type QueuedConversationChildProps = SimpleConversationChildProps;

export const useQueuedConversation = (props: UseQueuedConversationOptions) => {
  const messageQueue = useRef(new Queue({ concurrency: 1 }));

  const { onMessage } = props;

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (onMessage) {
        messageQueue.current.add(() => onMessage(event));
      }
    },
    [onMessage],
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
