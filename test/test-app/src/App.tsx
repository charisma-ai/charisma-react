import { useState } from "react";
import PlaySetup from "./PlaySetup";
import { LOCAL_STORAGE_KEY, PlayParameters } from "./PlayParameters";
import MyChat from "./MyChat";

const emptyParameters: PlayParameters = {
  storyId: 28169,
  apiKey: "",
  version: -1,
  startGraphReferenceId: "",
  charismaUrl: "https://play.charisma.ai",
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
    conversationParameters.storyId && conversationParameters.apiKey;

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
      <div
        style={{
          border: "2px groove rgb(192, 192, 192)",
          padding: "12px",
          margin: "2px",
        }}
      >
        {sufficientParameters && !confirmed ? (
          <button onClick={() => setConfirmed(true)}>Confirm</button>
        ) : null}
        {confirmed ? (
          <MyChat conversationParameters={conversationParameters} />
        ) : null}
      </div>
    </div>
  );
}

export default App;
