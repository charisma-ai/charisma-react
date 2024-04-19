import { useState, useCallback } from "react";
import * as React from "react";
import {
  ProblemEvent,
  MessageEvent,
  SpeechConfig,
  SpeechEncoding,
  Playthrough,
} from "@charisma-ai/react";

import Conversation, {
  ConversationWithMicrophoneAndSpeakerProps,
  ConversationWithMicrophoneAndSpeakerChildProps,
} from "./ConversationWithMicrophoneAndSpeaker";
import { ConversationUuidProvider } from "./ConversationUuidContext";

export interface SingleConversationPlaythroughChildProps
  extends ConversationWithMicrophoneAndSpeakerChildProps {
  disabled: boolean;
  problemAlertOpen: boolean;
  setProblemAlertOpen: (problemAlertOpen: boolean) => void;
}

export interface SingleConversationPlaythroughProps
  extends Omit<ConversationWithMicrophoneAndSpeakerProps, "children"> {
  playthroughToken?: string;
  conversationUuid?: string;
  children: (props: SingleConversationPlaythroughChildProps) => React.ReactNode;
}

const SingleConversationPlaythrough = ({
  playthroughToken,
  conversationUuid,
  children,
  ...props
}: SingleConversationPlaythroughProps) => {
  const [disabled, setDisabled] = useState(false);
  const [problemAlertOpen, setProblemAlertOpen] = useState(false);

  const { conversationOptions } = props;

  const onMessage = conversationOptions?.onMessage;
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (onMessage) {
        onMessage(event);
      }

      if (event.endStory) {
        setDisabled(true);
      }
    },
    [onMessage],
  );

  const onProblem = conversationOptions?.onProblem;
  const handleProblem = useCallback(
    (event: ProblemEvent) => {
      if (onProblem) {
        onProblem(event);
      }

      if (event.error) {
        setProblemAlertOpen(true);
      }
    },
    [onProblem],
  );

  const speechConfig = React.useMemo<SpeechConfig>(() => {
    let isSafari = false;
    if (typeof window !== "undefined") {
      isSafari = /Version\/([0-9._]+).*Safari/.test(navigator.userAgent);
    }
    const encoding: SpeechEncoding[] = ["mp3"];
    if (!isSafari) {
      encoding.unshift("ogg");
    }
    encoding.push("wav");
    return {
      encoding,
      output: "buffer",
    };
  }, []);

  return (
    <Playthrough
      playthroughToken={playthroughToken}
      charismaUrl="https://play.charisma.ai"
      autoconnect
    >
      <ConversationUuidProvider value={conversationUuid}>
        <Conversation
          conversationOptions={{
            ...conversationOptions,
            onMessage: handleMessage,
            onProblem: handleProblem,
            conversationUuid,
            speechConfig,
          }}
          microphoneOptions={{ microphoneTimeout: 60000 }}
        >
          {(childProps) =>
            children({
              ...childProps,
              conversation: {
                ...childProps.conversation,
                start: (event) => {
                  setDisabled(false);
                  childProps.conversation.start(event);
                },
              },
              disabled,
              problemAlertOpen,
              setProblemAlertOpen,
            })
          }
        </Conversation>
      </ConversationUuidProvider>
    </Playthrough>
  );
};

export default SingleConversationPlaythrough;
