import { StoryParams } from "../App";

interface Props {
  setStoryParams: (storyParams: StoryParams) => void;
}

const StorySetupForm = ({ setStoryParams }: Props) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setStoryParams({
      storyId: Number(e.currentTarget.storyId.value),
      apiKey: e.currentTarget.apiKey.value,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="storyId">Story ID</label>
      <input
        type="number"
        id="storyId"
        name="storyId"
        style={{ margin: "10px", width: "50%", padding: "5px" }}
      />
      <br />
      <label htmlFor="apiKey">Story API Key</label>
      <input
        type="text"
        id="apiKey"
        name="apiKey"
        style={{ margin: "10px", width: "50%", padding: "5px" }}
      />
      <br />
      <button type="submit">Submit</button>
    </form>
  );
};

export default StorySetupForm;
