import React, {
  useEffect,
  useRef,
  useCallback,
  useReducer,
  useState,
  createContext,
  useContext,
} from "react";
import {
  Conversation as ConversationType,
  MessageEvent,
  StartTypingEvent,
  StopTypingEvent,
  EpisodeCompleteEvent,
  Message,
  StartEvent,
  ReplyEvent,
  SpeechConfig,
  ActionEvent,
  ProblemEvent,
} from "@charisma-ai/sdk";

import { useQueuedConversation } from "./QueuedConversation.js";
import { usePlaythroughContext } from "./Playthrough.js";

export enum ChatMode {
  Tap = "tap",
  Chat = "chat",
}

export type PlayerMessage = {
  type: "player";
  timestamp: number;
  message: {
    text: string;
  };
};

export type StoredMessage = Message | PlayerMessage;

export interface ConversationChildProps {
  inputValue: string;
  isRestarting: boolean;
  isTyping: boolean;
  messages: StoredMessage[];
  mode: ChatMode;
  type: (newInputValue: string) => void;
  start: ConversationType["start"];
  reply: ConversationType["reply"];
  tap: ConversationType["tap"];
  action: ConversationType["action"];
  resume: ConversationType["resume"];
  restart: (eventId: string) => Promise<void>;
}

export interface ConversationState {
  inputValue: string;
  isTyping: boolean;
  messages: StoredMessage[];
  mode: ChatMode;
}

type ConversationAction =
  | {
      type: "MESSAGE_CHARACTER";
      payload: Message;
    }
  | {
      type: "MESSAGE_PLAYER";
      payload: PlayerMessage;
    }
  | {
      type: "START_TYPING";
    }
  | {
      type: "STOP_TYPING";
    }
  | {
      type: "TYPE";
      payload: string;
    }
  | {
      type: "RESET";
    }
  | {
      type: "RESTART";
      payload: string;
    };

const reducer = (prevState: ConversationState, action: ConversationAction) => {
  switch (action.type) {
    case "MESSAGE_CHARACTER": {
      return {
        ...prevState,
        messages: [...prevState.messages, action.payload],
        mode: action.payload.tapToContinue ? ChatMode.Tap : ChatMode.Chat,
      };
    }
    case "MESSAGE_PLAYER": {
      return {
        ...prevState,
        messages: [...prevState.messages, action.payload],
        inputValue: "",
      };
    }
    case "START_TYPING": {
      return {
        ...prevState,
        isTyping: true,
      };
    }
    case "STOP_TYPING": {
      return {
        ...prevState,
        isTyping: false,
      };
    }
    case "TYPE": {
      return {
        ...prevState,
        inputValue: action.payload,
      };
    }
    case "RESET": {
      return {
        ...prevState,
        messages: [],
      };
    }
    case "RESTART": {
      const index = prevState.messages.findIndex((message) =>
        message.type === "character" ||
        message.type === "media" ||
        message.type === "panel"
          ? message.eventId === action.payload
          : false,
      );
      if (index === -1) {
        return prevState;
      }
      return {
        ...prevState,
        messages: prevState.messages.slice(0, index),
      };
    }
    default:
      return prevState;
  }
};

export interface UseConversationOptions {
  conversationUuid?: string;
  onMessage?: (event: MessageEvent) => Promise<void> | void;
  onStartTyping?: (event: StartTypingEvent) => void;
  onStopTyping?: (event: StopTypingEvent) => void;
  onEpisodeComplete?: (event: EpisodeCompleteEvent) => void;
  onProblem?: (event: ProblemEvent) => void;
  onStart?: (event: StartEvent) => void;
  onReply?: (event: ReplyEvent) => void;
  onResume?: () => void;
  onTap?: () => void;
  onAction?: (event: ActionEvent) => void;
  initialState?: ConversationState;
  onStateChange?: (newState: ConversationState) => void;
  shouldResumeOnConnect?: boolean | StartEvent;
  shouldStartOnConnect?: boolean | StartEvent;
  speechConfig?: SpeechConfig;
  sendIntermediateEvents?: boolean;
}

export const useConversation = ({
  conversationUuid,
  onMessage,
  onStartTyping,
  onStopTyping,
  onEpisodeComplete,
  onProblem,
  onStart,
  onReply,
  onResume,
  onTap,
  onAction,
  initialState,
  onStateChange,
  shouldResumeOnConnect,
  shouldStartOnConnect,
  speechConfig,
  sendIntermediateEvents,
}: UseConversationOptions): ConversationChildProps => {
  const [state, dispatch] = useReducer(
    reducer,
    initialState || {
      inputValue: "",
      isTyping: false,
      messages: [],
      mode: ChatMode.Chat,
    },
  );
  const { inputValue, isTyping, messages, mode } = state;
  useEffect(() => {
    if (onStateChange) {
      onStateChange(state);
    }
  }, [onStateChange, state]);

  const handleMessage = useCallback(
    async (event: MessageEvent) => {
      dispatch({ type: "MESSAGE_CHARACTER", payload: event });

      if (onMessage) {
        await onMessage(event);
      }
    },
    [onMessage],
  );

  const handleStartTyping = useCallback(
    (event: StartTypingEvent) => {
      dispatch({ type: "START_TYPING" });
      if (onStartTyping) {
        onStartTyping(event);
      }
    },
    [onStartTyping],
  );

  const handleStopTyping = useCallback(
    (event: StopTypingEvent) => {
      dispatch({ type: "STOP_TYPING" });
      if (onStopTyping) {
        onStopTyping(event);
      }
    },
    [onStopTyping],
  );

  const { start, reply, replyIntermediate, resume, tap, action } =
    useQueuedConversation({
      conversationUuid,
      onMessage: handleMessage,
      onStartTyping: handleStartTyping,
      onStopTyping: handleStopTyping,
      onEpisodeComplete,
      onProblem,
      speechConfig,
    });

  const playthroughContext = usePlaythroughContext();
  const hasHandledMount = useRef(false);

  useEffect(() => {
    if (
      playthroughContext?.connectionStatus === "connected" &&
      !hasHandledMount.current
    ) {
      hasHandledMount.current = true;
      if (shouldResumeOnConnect) {
        resume();
      }
      if (shouldStartOnConnect) {
        const event = shouldStartOnConnect === true ? {} : shouldStartOnConnect;
        start(event);
      }
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [playthroughContext?.connectionStatus]);

  const handleStart = useCallback(
    (event: StartEvent = {}) => {
      dispatch({ type: "RESET" });
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
      dispatch({
        type: "MESSAGE_PLAYER",
        payload: {
          type: "player",
          timestamp: Date.now(),
          message: {
            text: event.text,
          },
        },
      });
      reply(event);
    },
    [onReply, reply],
  );

  const handleTap = useCallback(() => {
    if (onTap) {
      onTap();
    }
    tap();
  }, [onTap, tap]);

  const handleAction = useCallback(
    (event: ActionEvent) => {
      if (onAction) {
        onAction(event);
      }
      action(event);
    },
    [onAction, action],
  );

  const handleResume = useCallback(() => {
    if (onResume) {
      onResume();
    }
    resume();
  }, [onResume, resume]);

  const handleType = useCallback(
    (text: string) => {
      if (sendIntermediateEvents) {
        replyIntermediate({ text, inputType: "keyboard" });
      }
      dispatch({ type: "TYPE", payload: text });
    },
    [replyIntermediate, sendIntermediateEvents],
  );

  const [isRestarting, setIsRestarting] = useState(false);
  const handleRestart = useCallback(
    async (eventId: string) => {
      if (playthroughContext && playthroughContext.playthrough) {
        setIsRestarting(true);
        try {
          await playthroughContext.playthrough.restartFromEventId(eventId);
          dispatch({ type: "RESTART", payload: eventId });
        } finally {
          setIsRestarting(false);
        }
      }
    },
    [playthroughContext],
  );

  return {
    inputValue,
    isRestarting,
    isTyping,
    messages,
    mode,
    type: handleType,
    start: handleStart,
    reply: handleReply,
    tap: handleTap,
    action: handleAction,
    resume: handleResume,
    restart: handleRestart,
  };
};

const ConversationContext = createContext<ConversationChildProps | undefined>(
  undefined,
);

export interface ConversationProps extends UseConversationOptions {
  children: React.ReactNode;
}

export const Conversation = ({ children, ...props }: ConversationProps) => {
  const conversation = useConversation(props);

  return (
    <ConversationContext.Provider value={conversation}>
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversationContext = () => useContext(ConversationContext);
