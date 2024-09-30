import { useConversationContext } from "@charisma-ai/react";

const Messages = () => {
  const conversation = useConversationContext();

  return (
    <div className="messages">
      {conversation?.messages.map((message) => {
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
    </div>
  );
};

export default Messages;
