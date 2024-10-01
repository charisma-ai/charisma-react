interface Props {
  setStoryId: (storyId: number) => void;
  setApiKey: (apiKey: string) => void;
}

const StorySetupForm = ({ setStoryId, setApiKey }: Props) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setStoryId(e.currentTarget.storyId.value);
    setApiKey(e.currentTarget.apiKey.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="storyId">Story ID</label>
      <input
        type="number"
        id="storyId"
        name="storyId"
        onChange={(e) => setStoryId(Number(e.target.value))}
        style={{ margin: "10px", width: "50%", padding: "5px" }}
      />
      <br />
      <label htmlFor="apiKey">Story Key</label>
      <input
        type="text"
        id="apiKey"
        name="apiKey"
        onChange={(e) => setApiKey(e.target.value)}
        style={{ margin: "10px", width: "50%", padding: "5px" }}
      />
      <br />
      <button type="submit">Submit</button>
    </form>
  );
};

export default StorySetupForm;
