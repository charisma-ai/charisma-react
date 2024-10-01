interface Props {
  setStoryId: (storyId: number) => void;
  setStoryKey: (storyKey: string) => void;
}

const StorySetupForm = ({ setStoryId, setStoryKey }: Props) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setStoryId(e.currentTarget.storyId.value);
    setStoryKey(e.currentTarget.storyKey.value);
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
      <label htmlFor="storyKey">Story Key</label>
      <input
        type="text"
        id="storyKey"
        name="storyKey"
        onChange={(e) => setStoryKey(e.target.value)}
        style={{ margin: "10px", width: "50%", padding: "5px" }}
      />
      <br />
      <button type="submit">Submit</button>
    </form>
  );
};

export default StorySetupForm;
