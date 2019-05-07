# Charisma for React

[Charisma.ai](https://charisma.ai) chat component for React.

```
yarn add @charisma-ai/react
```

### Usage

```jsx
import { Charisma, Conversation } from "@charisma-ai/react";
import { Charisma as CharismaSDK } from "@charisma-ai/sdk";

const MyChat = () => {
  // If you need to get a playthrough token or conversation id, you may consider
  // doing this as a `useEffect` hook, otherwise skip this:

  const [playthroughToken, setPlaythroughToken] = useState<string>();
  const [conversationId, setConversationId] = useState<string>();
  useEffect(() => {
    async function run() {
      const newToken = await CharismaSDK.createPlaythroughToken({
        storyId,
        version,
        userToken,
      });
      setPlaythroughToken(newToken);

      const newConversationId = await CharismaSDK.createConversation(newToken);
      setConversationId(newConversationId);
    }
    run();
  }, [storyId, version, userToken]);

  return (
    <Charisma playthroughToken={playthroughToken}>
      <Conversation conversationId={conversationId}>
        {({ messages, inputValue, start, reply, type }) => (
          <>
            <button onClick={() => start()}>Start</button>
            {messages.map(({ message: { text } }) => (
              <div>{text}</div>
            ))}
            <input
              onChange={({ currentTarget: { value } }) => type(value)}
              value={inputValue}
              onKeyPress={({ key }) => {
                if (key === "Enter") {
                  reply({ text: inputValue });
                }
              }}
            />
          </>
        )}
      </Conversation>
    </Charisma>
  );
}
```

For a full list of prop types, [see the TypeScript definition file](dist/index.d.ts).

### Breaking Changes

The v1 release of `@charisma-ai/react` has a bunch of breaking changes.

Most notably, multiple conversations can now exist in a single playthrough, hence the addition of the `Conversation` component which references a particular `conversationId`.

`Conversation`s work similarly to how the `Charisma` component used to work, except it does not use speech-to-text (microphone) or text-to-speech (speaker) out the box. These need to be configured using the relevant low-level APIs in `charisma-ai/sdk`: `Microphone` and `Speaker`.
