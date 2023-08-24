import { PlayParameters } from "./PlayParameters";

type PlaySetupProps = {
  conversationParameters: PlayParameters;
  setConversationParameters: (parameters: PlayParameters) => void;
  disabled: boolean;
};

const PlaySetup = ({
  conversationParameters,
  setConversationParameters,
  disabled,
}: PlaySetupProps) => {
  return (
    <form>
      <fieldset>
        <legend>Enter Conversation Parameters</legend>
        <table width={"100%"}>
          <tbody>
            <tr>
              <td>
                <label>storyId </label>
              </td>
              <td width={"300px"}>
                <input
                  type="number"
                  id="storyId"
                  required
                  value={conversationParameters.storyId}
                  style={{ width: "60px" }}
                  onChange={({ currentTarget: { value } }) => {
                    setConversationParameters({
                      ...conversationParameters,
                      storyId: parseInt(value),
                    });
                  }}
                  disabled={disabled}
                />
              </td>
            </tr>
            <tr>
              <td>
                <label>version</label>
              </td>
              <td>
                <input
                  type="number"
                  id="version"
                  value={conversationParameters.version}
                  required
                  style={{ width: "30px" }}
                  onChange={({ currentTarget: { value } }) => {
                    setConversationParameters({
                      ...conversationParameters,
                      version: parseInt(value),
                    });
                  }}
                  disabled={disabled}
                />
              </td>
            </tr>
            <tr>
              <td>
                <label>startGraphReferenceId</label>
              </td>
              <td>
                <input
                  type="string"
                  id="startGraphReferenceId"
                  value={conversationParameters.startGraphReferenceId}
                  style={{ width: "260px" }}
                  onChange={({ currentTarget: { value } }) => {
                    setConversationParameters({
                      ...conversationParameters,
                      startGraphReferenceId: value,
                    });
                  }}
                  disabled={disabled}
                />
              </td>
            </tr>
            <tr>
              <td>
                <label>charismaUrl</label>
              </td>
              <td>
                <input
                  type="string"
                  id="charismaUrl"
                  value={conversationParameters.charismaUrl}
                  style={{ width: "260px" }}
                  onChange={({ currentTarget: { value } }) => {
                    setConversationParameters({
                      ...conversationParameters,
                      charismaUrl: value,
                    });
                  }}
                  disabled={disabled}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </fieldset>
    </form>
  );
};

export default PlaySetup;
