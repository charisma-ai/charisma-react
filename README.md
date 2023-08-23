# Charisma for React

[Charisma.ai](https://charisma.ai) chat component for React.

```
pnpm i @charisma-ai/react
```

## Setup in Charisma

After you have signed up at [Charisma.ai](https://charisma.ai), and logged in, make sure you have a valid licence (a free trial licence is available).

Then, on your `My Stories` page, click to `Create a new game story`.

In your story add a subplot, and a few character nodes, and player nodes.

From the story editor left navigation bar, click `...` next to your subplot name, and select `Edit details`. Take note of the reference ID which is a uuid.

On the story overview page scroll down to `Play API Access` and generate and/or copy the API key. This will enable access to start playthroughs of your story.

At the top of the navbar on the left, underneath the title, your version number, or 'draft' will be displayed. You can use `-1` for your most recent draft, or the version number to select a particular version of your story.

Finally the story ID can be found in the url, eg. `https://charisma.ai/stories/12345` gives you ID `12345`.

## Try the Playground App

From the root of this project, run `pnpm install` and `pnpm build` to install dependencies in `node_modules`, and create the `dist` directory with the compiled package respectively.

From the root of this project, navigate to `test/test-app/`. Install dependencies here with `pnpm install` and paste your apiKey into the parameter defined in `test/test-app/src/App.tsx`. You can now start the playground app which has a form to input your story parameters. You can launch the playground app from the root of this project using `pnpm run playground`.

Once the page loads, enter your conversation parameters, and the `Confirm` button will appear. Click it. This opens the chat, where you can click start, and would expect to see the first character nodes from your story start to appear on the page. Type your player responses in the input box.

## Basic Code Example

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
