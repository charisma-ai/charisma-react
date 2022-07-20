# Changelog

### v3.4.1

- Conversations now have an `onProblem` prop to listen for issues scoped to a conversation.

### v3.4.0

- Support for handling intermediate events from the client.

### v3.3.0

- Support for handling events that are sent from other players, such as other players' messages. These handlers will _not_ be fired for messages sent from the local connected client, only for remote clients.

### v3.2.0

- Support for experimental pause/play functionality and starting from a specific graph by ID or reference ID.

### v3.1.0

- Support for action node/event.

### v3.0.0

There is a new emotion engine in Charisma! As a result...

- `onChangeCharacterMoods` no longer exists.
- `@charisma-ai/sdk@3.0.0` is now used, which [has its own set of breaking changes](https://github.com/charisma-ai/charisma-sdk-js).

### v2.2.0

- `microphone.stopListening()` now accepts an `options` parameter with a single option `waitForLastResult`. If set to `true`, then the `recognise` will be called a final time with the result of the audio captured so far. If `false`, the operation will be aborted, so no additional `recognise` event will occur.

### v2.1.0

- `@charisma-ai/sdk@2.2.0` is now used, which exposes a [track-based API for the speaker](https://github.com/charisma-ai/charisma-sdk-js#speaker). This can help prevent characters speak over each other, but allow different characters to speak in parallel.

### v2.0.0

- `@charisma-ai/sdk@2.0.0` is now used, which [has its own set of breaking changes](https://github.com/charisma-ai/charisma-sdk-js). Under the hood, colyseus.js is now used instead of socket.io.
- The `Charisma` component has been renamed to be `Playthrough` to be more descriptive and consistent with the SDK.
- The internal state of the `Conversation` component and `useConversation` hook has been refactored, and can now be set to an initial state by passing in the `initialState` prop. You can now subscribe to changes in the state by providing an `onStateChange` callback prop.
- Connection events have been removed and replaced by the single `onConnectionStatus` callback prop, which passes in the new connection state as its only argument.
