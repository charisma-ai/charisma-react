# Charisma for React

[Charisma.ai](https://charisma.ai) chat component for React.

```
pnpm i @charisma-ai/react
```

## Setup in Charisma

After you have signed up at [Charisma.ai](https://charisma.ai), and logged in, make sure you have a valid licence (a free trial licence is available).

Then, on your `My Stories` page, click to `Create a new game story`.

In your story add a subplot, and a few character nodes, and player nodes.

If using a Pro story, you will need the startGraphReferenceId which is a uuid. From the story editor left navigation bar, click `...` next to your subplot name, select `Edit details, and copy the reference id. If you are using a Web comic story, the story will start at the first scene automatically, and you can set `startGraphReferenceId={undefined}` in the jsx of [test/test-app/src/MyChat.tsx, line 45](https://github.com/charisma-ai/charisma-react/blob/main/test/test-app/src/MyChat.tsx#L45).

On the story overview page scroll down to `Play API Access` and generate and/or copy the API key. This will enable access to start playthroughs of your story.

At the top of the navbar on the left, underneath the title, your version number, or 'draft' will be displayed. You can use `-1` for your most recent draft, undefined for the promoted (usually most recent) version release, or the version number for an exact version of your story.

Finally the story ID can be found in the url, eg. `https://charisma.ai/stories/12345` gives you ID `12345`.

## Try the Playground App

From the root of this project, run `pnpm install` and `pnpm build` to install dependencies in `node_modules`, and create the `dist` directory with the compiled package respectively.

Install dependencies here with `pnpm run playground:setup` from the root of this project. You can now start the playground app which has a form to input your story parameters. You can launch the playground app from the root of this project using `pnpm run playground`.

Once the page loads, enter your conversation parameters, and the `Confirm` button will appear. Click it. This opens the chat, where you can click start, and would expect to see the first character nodes from your story start to appear on the page.

In this test app player input will not be offered by default. It will be offered when a metadata tag "set-player-speak" equal to true is provided on the character node immediately prior to the player input. We've found this helps indicate to a user when they are expected to contribute to the conversation. To set this up, in the graph go the character node before a player node and click the Metadata Manager symbol, second from the left. Add "set-player-speak" with value "true". This will trigger the input to appear in the test app. You can change the code to remove this depending on the desired behaviour for your experience.

## Types

For a full list of prop types, [see the TypeScript definition file](dist/index.d.ts).
