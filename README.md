# Charisma for React

[Charisma.ai](https://charisma.ai) chat component for React.

```
pnpm i @charisma-ai/react
```

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

Install dependencies here with `pnpm run demo:setup` from the root of this project. You can now start the demo app which has a form to input your story parameters. You can launch the demo app from the root of this project using `pnpm run demo`.

In your browser, go to `localhost:3000`. Once the page loads, enter your conversation parameters, and click the `Submit` button. This opens the chat, where you can click start, and would expect to see the first character nodes from your story start to appear on the page.
