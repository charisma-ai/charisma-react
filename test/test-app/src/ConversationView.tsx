import { Conversation, usePlaythroughContext } from "@charisma-ai/react";

type ConversationViewProps = {
  conversationUuid: string | undefined;
  startGraphReferenceId: string | undefined;
};

const ConversationView = ({
  conversationUuid,
  startGraphReferenceId,
}: ConversationViewProps) => {
  const playthrough = usePlaythroughContext();
  const connectionStatus = playthrough?.connectionStatus;
  if (!conversationUuid) {
    return <div>Getting Conversation...</div>;
  }
  if (connectionStatus !== "connected") {
    return <div>Connecting...</div>;
  }
  return (
    <Conversation conversationUuid={conversationUuid}>
      {({ messages, inputValue, start, reply, type }) => (
        <>
          <button onClick={() => start({ startGraphReferenceId })}>
            Start
          </button>
          {messages.map((message) => {
            if (message.type === "player") {
              const text = `YOU: ${message.message.text}`;
              return <div key={text}>{text}</div>;
            }
            if (message.type === "character") {
              const text = `${message.message.character?.name || "???"}: ${
                message.message.text
              }`;
              return <div key={text}>{text}</div>;
            }
            return (
              <div>
                A message was sent that did not have type "player" or
                "character".
              </div>
            );
          })}
          <input
            onChange={({ currentTarget: { value } }) => type(value)}
            value={inputValue}
            onKeyPress={({ key }) => {
              if (key === "Enter") {
                reply({ text: inputValue });
              }
            }}
          />
        </>
      )}
    </Conversation>
  );
};

export default ConversationView;
