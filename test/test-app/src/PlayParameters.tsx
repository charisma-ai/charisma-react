export type PlayParameters = {
  storyId: number;
  apiKey: string;
  version: number | undefined;
  startGraphReferenceId: string;
  charismaUrl: string;
};

export const LOCAL_STORAGE_KEY = "charisma-react-test-conversation-parameters";
