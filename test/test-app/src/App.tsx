import { useState } from "react";
import PlaySetup from "./PlaySetup";
import { LOCAL_STORAGE_KEY, PlayParameters } from "./PlayParameters";
import PlayView from "./PlayView";

//
// Add your key here!
//
const apiKey = undefined;
//
//

const emptyParameters: PlayParameters = {
  storyId: 0,
  version: 0,
  startGraphReferenceId: "",
};

const emptyParametersString = JSON.stringify(emptyParameters);

function App() {
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [conversationParameters, setConversationParameters] = useState(
    JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEY) || emptyParametersString,
    ) as PlayParameters,
  );

  const sufficientParameters =
    conversationParameters.storyId && conversationParameters.version;

  return (
    <div className="App" style={{ width: "500px" }}>
      <PlaySetup
        conversationParameters={conversationParameters}
        setConversationParameters={(args) => {
          setConversationParameters(args);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(args));
        }}
        disabled={confirmed}
      />
      <br />
      {!apiKey ? "Please set your API key" : null}
      {sufficientParameters && !confirmed && apiKey ? (
        <button onClick={() => setConfirmed(true)}>Confirm</button>
      ) : null}
      <PlayView
        conversationParameters={conversationParameters}
        confirmed={confirmed}
        apiKey={apiKey}
      />
    </div>
  );
}

export default App;
