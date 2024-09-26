export {
  Playthrough,
  usePlaythrough,
  type PlaythroughProps,
} from "./Playthrough.js";
export {
  PlaythroughConsumer,
  PlaythroughContext,
  type PlaythroughContextType,
  PlaythroughProvider,
  usePlaythroughContext,
} from "./PlaythroughContext.js";

export {
  Conversation,
  useConversation,
  type UseConversationOptions,
  type ConversationProps,
  type ConversationChildProps,
  type ConversationState,
  type Conversation as ConversationType,
  ChatMode,
  type StoredMessage,
  type PlayerMessage,
} from "./Conversation.js";
export {
  SimpleConversation,
  useSimpleConversation,
  type UseSimpleConversationOptions,
  type SimpleConversationProps,
  type SimpleConversationChildProps,
} from "./SimpleConversation.js";
export {
  QueuedConversation,
  useQueuedConversation,
  type UseQueuedConversationOptions,
  type QueuedConversationProps,
  type QueuedConversationChildProps,
} from "./QueuedConversation.js";

export {
  default as useBackgroundVideo,
  type BackgroundVideoElementProps,
} from "./useBackgroundVideo.js";

export {
  useAudioManager,
  AudioManagerProvider,
  RecordingStatus,
} from "./useAudioManager.js";
export type { ModifiedAudioManagerOptions as AudioManagerOptions } from "./useAudioManager.js";

export { prefetchMedia } from "./fetchMedia.js";

export * from "@charisma-ai/sdk";
