interface Props {
  setStoryId: (storyId: string) => void;
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
        type="text"
        id="storyId"
        name="storyId"
        value="31943"
        onChange={(e) => setStoryId(e.target.value)}
        style={{ margin: "10px", width: "50%", padding: "5px" }}
      />
      <br />
      <label htmlFor="storyKey">Story Key</label>
      <input
        type="text"
        id="storyKey"
        name="storyKey"
        value="854ed3aa-b5a9-4f6c-88c5-3c9c12dea4ac"
        onChange={(e) => setStoryKey(e.target.value)}
        style={{ margin: "10px", width: "50%", padding: "5px" }}
      />
      <br />
      <button type="submit">Submit</button>
    </form>
  );
};

export default StorySetupForm;
