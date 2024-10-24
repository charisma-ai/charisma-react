# Charisma for React

[Charisma.ai](https://charisma.ai) chat component for React.

```
pnpm i @charisma-ai/react
```

This package is a react wrapper for the Charisma AI Javascript SDK. It provides a simple way to embed a chat in your React app along with accessing conversation data. It also handles audio playback and speech to text.

## Setup in Charisma

After you have signed up at [Charisma.ai](https://charisma.ai), and logged in, make sure you have a valid licence (a free trial licence is available).

Then, on your `My Stories` page, click to `Create a new game story`.

In your story add a subplot, and a few character nodes, and player nodes.

If using a Pro story, you will need the startGraphReferenceId which is a uuid. From the story editor left navigation bar, click `...` next to your subplot name, select `Edit details, and copy the reference id. If you are using a Web comic story, the story will start at the first scene automatically.

On the story overview page scroll down to `Play API Access` and generate and/or copy the API key. This will enable access to start playthroughs of your story.

At the top of the navbar on the left, underneath the title, your version number, or 'draft' will be displayed. You can use `-1` for your most recent draft, undefined for the promoted (usually most recent) version release, or the version number for an exact version of your story.

Finally the story ID can be found in the url, eg. `https://charisma.ai/stories/12345` gives you ID `12345`.

## Try the Demo App

From the root of this project, run `pnpm install` and `pnpm build` to install dependencies in `node_modules`, and create the `dist` directory with the compiled package respectively.

Navigate to `./demos/chat` and run `pnpm install` to install the demos dependencies. You can now start the demo app which has a form to input your story parameters. You can launch the demo app by running `pnpm run dev`.

In your browser, go to `localhost:3000`. Once the page loads, enter your conversation parameters, and click the `Submit` button. This opens the chat, where you can click start, and would expect to see the first character nodes from your story start to appear on the page.

## SDK Documentation

The best way to get started with this SDK is to use the demo project located in demos/chat.

### Playthrough

The `<Playthrough>` component handles the connection to charisma.ai. This component is a context provider so anything inside has access to the `usePlaythroughContext` hook.

#### Props

| Prop                 | Type                                                | Description                                                                   |
| -------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------- |
| `playthroughToken`   | string or undefined                                 | If your story is not published, this is required.                             |
| `autoconnect`        | boolean                                             | If true, the component will automatically connect to charisma.ai              |
| `onConnectionStatus` | `(connectionStatus: ConnectionStatus) => void`      | If provided, this function will be called when the connection status changes. |
| `onError`            | `(error: any) => void`                              | If provided, this function will be called when an error occurs.               |
| `onProblem`          | `(problem: { code: string, error: string}) => void` | If provided, this function will be called when a problem occurs.              |

### usePlaythroughContext

Hook that provides access to the Playthrough context.

```
const { connectionStatus, playthrough, playthroughToken, playerSessionId } = usePlaythroughContext();
```

### Conversation

The `<Conversation>` component handles the conversation. This component is a context provider so anything inside has access to the `useConversationContext` hook.

#### Props

| Prop                    | Type                                    | Description                                                                                                           |
| ----------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `conversationUuid`      | string or undefined                     | References the current conversation. This is returned from `createConversation` function.                             |
| `onMessage`             | `(event: MessageEvent) => Promise<void> | void`                                                                                                                 | If provided, this function will be called when a message is received. |
| `onStartTyping`         | `(event: StartTypingEvent) => void`     | If provided, this function will be called when the character starts typing.                                           |
| `onStopTyping`          | `(event: StopTypingEvent) => void`      | If provided, this function will be called when the character stops typing.                                            |
| `onProblem`             | `(event: ProblemEvent) => void`         | If provided, this function will be called when a problem occurs.                                                      |
| `onStart`               | `(event: StartEvent) => void`           | If provided, this function will be called when the conversation starts.                                               |
| `onReply`               | `(event: ReplyEvent) => void`           | If provided, this function will be called when a reply is received from the player.                                   |
| `onResume`              | `() => void`                            | If provided, this function will be called when the conversation resumes.                                              |
| `onTap`                 | `() => void`                            | If provided, this function will be called when the player taps to continue the conversation.                          |
| `onAction`              | `(event: ActionEvent) => void`          | If provided, this function will be called when an action node is executed.                                            |
| `initialState`          | ConversationState                       | If provided, this will be used as the initial state of the conversation.                                              |
| `onStateChange`         | `(newState: ConversationState) => void` | If provided, this function will be called when the conversation state changes.                                        |
| `shouldResumeOnConnect` | boolean                                 | If true, when the conversation reconnects from a disconnection event, it will resume automatically.                   |
| `shouldStartOnConnect`  | boolean                                 | If true, when the conversation reconnects from a disconnection event, it will start from the beginning automatically. |
| `speechConfig`          | SpeechConfig                            | Defines the parameters for character speech. Required if you want character speech audio.                             |

### useConversationContext

Hook that provides access to the Conversation context.

```
const {isRestarting, isTyping, messages, mode, start, reply, tap, action, resume, restart} = useConversationContext()
```

#### Values

| Value          | Type                                 | Description                                             |
| -------------- | ------------------------------------ | ------------------------------------------------------- |
| `isRestarting` | boolean                              | Is true when `restart` is called.                       |
| `isTyping`     | boolean                              | Is true when the character is typing.                   |
| `messages`     | StoredMessage[]                      | Contains all the messages for the current conversation. |
| `mode`         | ChatMode                             | Defines the current chat mode.                          |
| `start`        | `(event?: StartEvent) => void`       | Starts the conversation                                 |
| `reply`        | `(event: ReplyEvent) => void`        | Sends a reply to the conversation from the player.      |
| `tap`          | `() => void`                         | Taps to continue the conversation.                      |
| `action`       | `(event: ActionEvent) => void`       | Executes an action node.                                |
| `resume`       | `() => void`                         | Resumes the conversation.                               |
| `restart`      | `(eventId: string) => Promise<void>` | Restarts the conversation from the specified event.     |

### AudioManagerProvider

Provides audio. This component is a context provider and must wrap `<Playthrough>` and `<Conversation>` on order to be setup correctly. See the chat demo for a suggested structure.

```
<AudioManagerProvider options={options}>
...
</AudioManagerProvider>
```

#### Options

| Option              | Type                               | Default                  | Description                                                                                                                             |
| ------------------- | ---------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `duckVolumeLevel`   | `number`                           | 0                        | Volume level when ducking (0 to 1)                                                                                                      |
| `normalVolumeLevel` | `number`                           | 1                        | Regular volume level (0 to 1)                                                                                                           |
| `sttService`        | `"charisma/deepgram" or "browser"` | `"charisma/deepgram"`    | Speech-to-text service to use (see below).                                                                                              |
| `streamTimeslice`   | `number`                           | 100                      | The number of milliseconds to record into each Blob. See https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/start#timeslice |
| `handleError`       | `(error: string) => void`          | `console.error(error)`   | Callback to handle errors.                                                                                                              |
| `handleDisconnect`  | `(message: string) => void`        | `console.error(message)` | Callback to handle when the transcription service disconnects.                                                                          |
| `handleConnect`     | `(message: string) => void`        | `console.log(message)`   | Callback to handle when the transcription service connects.                                                                             |

### useAudioManager

Hook that provides access to the AudioManagerProvider context.

#### Values

| Value                | Type                                                                                              | Description                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `isListening`        | boolean                                                                                           | Is true when microphone is listening for STT.                                                                                       |
| `isBrowserSupported` | boolean                                                                                           | Is true when the current browser supports local STT.                                                                                |
| `initialise`         | `() => void`                                                                                      | Initialises the AudioManager. This must be called via a user interaction, such as a button click. See the chat demo for an example. |
| `transcript`         | string                                                                                            | The current transcript from STT.                                                                                                    |
| `recordingStatus`    | RecordingStatus                                                                                   | The current recording status. Can be "OFF", "STARTING" or "RECORDING".                                                              |
| `startListening`     | `() => void`                                                                                      | Starts listening for STT.                                                                                                           |
| `stopListening`      | `() => void`                                                                                      | Stops listening for STT.                                                                                                            |
| `connect`            | `(token: string, playerSessionId: string) => void`                                                | Connects to the AudioManager. See `StartButton.tsx` in the chat demo for an example.                                                |
| `resetTimeout`       | `(timeout: number) => void`                                                                       | Resets the STT timeout before the microphone automatically stops listening for STT.                                                 |
| `playOutput`         | `(audio: ArrayBuffer, playOptions: AudioOutputsServicePlayOptions) => Promise<void> or undefined` | Plays character speech from a MessageEvent.                                                                                         |
| `setOutputVolume`    | `(volume: number) => void`                                                                        | Sets the volume of character speech. Must be between 0 and 1.                                                                       |
| `playMediaAudio`     | `(audioTracks: AudioTrack[]) => void`                                                             | Plays media audio from a MessageEvent. This is used for playing background music.                                                   |
| `setMediaVolume`     | `(volume: number) => void`                                                                        | Sets the volume of media audio. Must be between 0 and 1.                                                                            |
| `toggleMediaMute`    | `() => void`                                                                                      | Toggles the mute state of media audio.                                                                                              |
| `stopAllMedia`       | `() => void`                                                                                      | Stops all media audio.                                                                                                              |

### createPlaythroughToken

Use this to set up a new playthrough.

- `storyId` (`number`): The `id` of the story that you want to create a new playthrough for. The story must be published, unless a Charisma.ai user token has been passed and the user matches the owner of the story.
- `version` (`number`, optional): The `version` of the story that you want to create a new playthrough for. If omitted, it will default to the most recent published version. To get the draft version of a story, pass `-1` and an `apiKey`.
- `apiKey` (`string`, optional): To access draft, test or unpublished versions of your story, pass an `apiKey`. The API key can be found on the story overview page.
- `languageCode` (`string`, optional): To play a story in a language other than English (`en`, the default), pass a BCP-47 `languageCode`. For example, to play in Italian, use `it`.

Returns a promise that resolves with the token.

```js
const { token } = await createPlaythroughToken({
  storyId: 12,
  version: 4,
  apiKey: '...',
  languageCode: 'en',
});
```

### createConversation

A playthrough can have many simultaneous conversations. In order to start interacting, a conversation needs to be created, which can then be joined.

- `playthroughToken` (`string`): The token generated with `createPlaythroughToken`.

---

Note: The `@charisma-ai/sdk` package is a peer dependency of `@charisma-ai/react` all of its exports are re-exported in this package. View the [SDK documentation](https://github.com/charisma-ai/charisma-sdk-js) for more information.
