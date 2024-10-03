import { useConversationContext } from "@charisma-ai/react";

const Messages = () => {
  const conversation = useConversationContext();

  if (!conversation) return null;

  const filteredMessages = () => {
    return conversation.messages.filter((message) => {
      return message.type === "character" || message.type === "player";
    });
  };

  return (
    <div className="messages">
      {conversation.messages.length > 0 ? (
        <>
          {filteredMessages().map((message) => {
            return message.type === "player" ? (
              <div key={message.message.text}>
                <p>
                  <strong>You</strong>: {message.message.text}
                </p>
              </div>
            ) : (
              <div key={message.eventId}>
                <p>
                  <strong>{message.message.character?.name || "???"}</strong>:{" "}
                  {message.message.text}
                </p>
              </div>
            );
          })}
        </>
      ) : (
        <p style={{ textAlign: "center" }}>No messages yet</p>
      )}
    </div>
  );
};

export default Messages;
