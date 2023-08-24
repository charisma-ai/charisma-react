import { StoredMessage } from "@charisma-ai/react";

type MessageViewProps = {
  messages: StoredMessage[];
};

const MessagesView = ({ messages }: MessageViewProps) => {
  return (
    <>
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
            A message was sent that did not have type "player" or "character".
          </div>
        );
      })}
    </>
  );
};

export default MessagesView;
