import { useState } from "react";
import PlaySetup from "./PlaySetup";
import { LOCAL_STORAGE_KEY, PlayParameters } from "./PlayParameters";
import MyChat from "./MyChat";
import withEasyPeasy from "./withEasyPeasy";

//
// Add your key here!
//
const apiKey = "1e0abfa8-5f39-498a-95c4-df3acac5e4c5";
//
//

const emptyParameters: PlayParameters = {
  storyId: 28169,
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

  const sufficientParameters = conversationParameters.storyId;

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
        {!apiKey ? "Please set your API key" : null}
        {sufficientParameters && !confirmed && apiKey ? (
          <button onClick={() => setConfirmed(true)}>Confirm</button>
        ) : null}
        {confirmed ? (
          <MyChat
            conversationParameters={conversationParameters}
            apiKey={apiKey}
          />
        ) : null}
      </div>
    </div>
  );
}

export default withEasyPeasy(App);
