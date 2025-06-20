# Changelog

### vNext

### v7.0.0

- Update and add audio volume functions

### v6.0.2

- Improve character speech volume reactivity by setting it prior to each play speech request

### v6.0.1

- Exclude tests from build
- Use vitest instead of jest and update tests to get them running

### v6.0.0

- update js sdk to v6.0.0-alpha.5
- **BREAKING:** convert outputServiceSetVolume to setCharacterSpeechVolume
- add interim transcripts
- prioritise transcript processing
- add characterSpeechVolume
- update js sdk to v6.0.0

### v5.0.7

- recordingStatus will not always become "OFF" when stopListening is called

### v5.0.6

- Add `disconnect` function to audio manager.

### v5.0.5

- Add `timeout` parameter to `startListening` function.

### v5.0.4

- Add `clearTranscript` function to audio manager.

### v5.0.3

- Stop media audio when audio manager provider is unmounted.

### v5.0.2

- Update JS SDK package version to include reconnect attempts timeout.
- Add `setOutputVolume` type to audio context.

### v5.0.1

- Add `setOutputVolume` function to AudioManager.

### v5.0.0

- Add context provider to `Conversation`.
- Create `useAudioManager` hook and context provider.
- Remove `useBackgroundAudio`, `useSpeaker`, `useMicrophone` hooks.
- Remove function returns in Playthrough and Conversation. They are now only context providers.

### v4.0.3

- Update @charisma-ai/sdk to 4.0.5

### v4.0.1

- Expose `Conversation` type as `ConversationType`.

### v4.0.0

- **BREAKING:** This packages now exports ES Module only.
- **BREAKING:** `playthroughId`s and `conversationId`s have been changed from `number` to `string` type everywhere in this SDK, and renamed to `playthroughUuid` and `conversationUuid`.
- **BREAKING:** Upgraded to `@charisma-ai/sdk@4` which has its own set of breaking changes. Please consult its own [CHANGELOG](https://github.com/charisma-ai/charisma-react/blob/main/CHANGELOG.md).
- Added speech recognition support to `Playthrough`.
- Added a React example app in `/test` to demonstrate how to use the SDK.

### v3.5.0

- `Microphone` now has an `onResult` prop to listen for raw microphone events from the `SpeechRecognition` class.

### v3.4.2

- Upgrade `@charisma-ai/sdk` dependency.

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
