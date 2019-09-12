export { Charisma, useCharisma, CharismaProps } from "./Charisma";

export {
  Conversation,
  useConversation,
  UseConversationOptions,
  ConversationProps,
  ConversationChildProps,
  ChatMode,
  StoredMessage,
  CharacterMoods,
} from "./Conversation";
export {
  SimpleConversation,
  useSimpleConversation,
  UseSimpleConversationOptions,
  SimpleConversationProps,
  SimpleConversationChildProps,
} from "./SimpleConversation";
export {
  QueuedConversation,
  useQueuedConversation,
  UseQueuedConversationOptions,
  QueuedConversationProps,
  QueuedConversationChildProps,
} from "./QueuedConversation";

export { CharismaContext, CharismaContextType } from "./Context";

export {
  default as useBackgroundAudio,
  BackgroundAudioElementProps,
} from "./useBackgroundAudio";
export {
  default as useBackgroundVideo,
  BackgroundVideoElementProps,
} from "./useBackgroundVideo";

export { useMicrophone, UseMicrophoneOptions } from "./useMicrophone";

export { Message } from "@charisma-ai/sdk";
