export {
  Playthrough,
  usePlaythrough,
  usePlaythroughContext,
  type PlaythroughProps,
} from "./Playthrough.js";

export {
  Conversation,
  useConversation,
  ChatMode,
  useConversationContext,
  type UseConversationOptions,
  type ConversationProps,
  type ConversationChildProps,
  type ConversationState,
  type Conversation as ConversationType,
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

export { useAudioManager, AudioManagerProvider } from "./useAudioManager.js";
export type {
  ModifiedAudioManagerOptions as AudioManagerOptions,
  RecordingStatus,
} from "./useAudioManager.js";

export { prefetchMedia } from "./fetchMedia.js";

export * from "@charisma-ai/sdk";
