# Charisma for React

[Charisma.ai](https://charisma.ai) chat component for React.

```
pnpm i @charisma-ai/react
```

### Usage

```jsx
import { Playthrough, Conversation } from "@charisma-ai/react";
import { createPlaythroughToken, createConversation } from "@charisma-ai/sdk";

const MyChat = () => {
  // If you need to get a playthrough token or conversation id, you may consider
  // doing this as a `useEffect` hook, otherwise skip this:

  const [playthroughToken, setPlaythroughToken] = useState<string>();
  const [conversationUuid, setConversationUuid] = useState<string>();
  useEffect(() => {
    async function run() {
      const tokenResult = await createPlaythroughToken({
        storyId,
        version,
        userToken,
      });
      const conversationResult = await createConversation(newToken);

      setPlaythroughToken(tokenResult.token);
      setConversationUuid(conversationResult.conversationUuid);
    }
    run();
  }, [storyId, version, userToken]);

  return (
    <Playthrough playthroughToken={playthroughToken}>
      <Conversation conversationUuid={conversationUuid}>
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
    </Playthrough>
  );
}
```

For a full list of prop types, [see the TypeScript definition file](dist/index.d.ts).
