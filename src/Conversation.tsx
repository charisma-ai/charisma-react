import { useContext, useEffect, useRef } from "react";
import {
  Conversation as ConversationType,
  MessageEvent,
  StartTypingEvent,
  StopTypingEvent,
  SceneCompletedEvent
} from "@charisma-ai/sdk";

import { CharismaContext } from "./Context";

interface UseConversationOptions {
  conversationId: string;
  onMessage?: (event: MessageEvent) => void;
  onStartTyping?: (event: StartTypingEvent) => void;
  onStopTyping?: (event: StopTypingEvent) => void;
  onSceneCompleted?: (event: SceneCompletedEvent) => void;
}

export const useConversation = ({
  conversationId,
  onMessage,
  onStartTyping,
  onStopTyping,
  onSceneCompleted
}: UseConversationOptions) => {
  const charisma = useContext(CharismaContext);

  if (!charisma) {
    throw new Error(
      `To use \`Conversation\`, you must wrap it within a \`Charisma\` instance.`
    );
  }

  // These need to be refs, so we don't have to keep attaching and deattaching
  // the conversation `on` handlers. We can refer to the ref instead.
  const onMessageRef = useRef(onMessage);
  const onStartTypingRef = useRef(onStartTyping);
  const onStopTypingRef = useRef(onStopTyping);
  const onSceneCompletedRef = useRef(onSceneCompleted);
  useEffect(() => {
    onMessageRef.current = onMessage;
    onStartTypingRef.current = onStartTyping;
    onStopTypingRef.current = onStopTyping;
    onSceneCompletedRef.current = onSceneCompleted;
  }, [onMessage, onStartTyping, onStopTyping, onSceneCompleted]);

  const conversationRef = useRef<ConversationType>();

  useEffect(() => {
    (async function run() {
      const conversation = await charisma.joinConversation(conversationId);
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
      conversation.on("scene-completed", event => {
        if (onSceneCompletedRef.current) {
          onSceneCompletedRef.current(event);
        }
      });
      conversationRef.current = conversation;
      return () => {
        charisma.leaveConversation(conversationId);
        conversationRef.current = undefined;
      };
    })();
  }, [charisma, conversationId]);

  return conversationRef.current;
};

interface ConversationProps extends UseConversationOptions {
  children: (conversation: ConversationType | undefined) => React.ReactNode;
}

export const Conversation = ({ children, ...props }: ConversationProps) => {
  const conversation = useConversation(props);

  return children(conversation);
};
