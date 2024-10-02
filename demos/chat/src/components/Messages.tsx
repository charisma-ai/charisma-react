import { useConversationContext } from "@charisma-ai/react";

const Messages = () => {
  const conversation = useConversationContext();

  if (!conversation) return null;

  return (
    <div className="messages">
      {conversation.messages.length > 0 ? (
        <>
          {conversation.messages.map((message) => {
            return (
              <div key={message.message.text}>
                <p>
                  <strong>
                    {message.type === "player"
                      ? "You"
                      : message.message.character?.name}
                  </strong>
                  : {message.message.text}
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
