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
      startGraphReferenceId:
        e.currentTarget.startGraphReferenceId.value || undefined,
      storyVersion: Number(e.currentTarget.storyVersion.value) || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="storyId">Story ID</label>
      </div>
      <input
        type="number"
        id="storyId"
        name="storyId"
        style={{ margin: "10px", width: "50%", padding: "5px" }}
      />
      <div>
        <label htmlFor="apiKey">Story API Key</label>{" "}
        <span style={{ color: "#aaaaaa" }}>
          (Only needed for draft or unpublished versions )
        </span>
      </div>
      <input
        type="text"
        id="apiKey"
        name="apiKey"
        style={{ margin: "10px", width: "50%", padding: "5px" }}
      />
      <div>
        <label htmlFor="startGraphReferenceId">Start Graph Reference Id</label>{" "}
        <span style={{ color: "#aaaaaa" }}>(Required for pro stories)</span>
      </div>
      <input
        type="text"
        id="startGraphReferenceId"
        name="startGraphReferenceId"
        style={{ margin: "10px", width: "50%", padding: "5px" }}
      />
      <div>
        <label htmlFor="storyVersion">Story Version</label>{" "}
        <span style={{ color: "#aaaaaa" }}>
          (Use -1 for draft, or leave undefined for most recent published)
        </span>
      </div>
      <input
        type="text"
        id="storyVersion"
        name="storyVersion"
        style={{ margin: "10px", width: "50%", padding: "5px" }}
      />
      <br />
      <button type="submit">Submit</button>
    </form>
  );
};

export default StorySetupForm;
