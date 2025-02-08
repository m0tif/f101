import React from "react";
import Message from "./Message.jsx";
import { observer } from "mobx-react-lite";
import state from "../contexts/state.js";

const MessageHistory = () => {
  const { chat } = React.useContext(state);
  const [showForkHistory, setShowForkHistory] = React.useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: "1",
      }}
    >
      {[...chat.messages]
        .map((message, index) => ({ ...message, index }))
        .slice(showForkHistory ? 0 : chat.forkedState.length)
        .reverse()
        .map((message, index) => {
          return (
            <Message
              key={`${index}-${message}`}
              conversationIndex={message.index}
              onRemove={() => {
                chat.setMessages(
                  chat.messages.filter(
                    (_, i) => i !== chat.messages.length - 1 - index,
                  ),
                );
              }}
              role={message.role}
              text={message.content}
            />
          );
        })}
      {chat.forkedState.length && !showForkHistory ? (
        <button onClick={() => setShowForkHistory(true)}>
          Show fork history
        </button>
      ) : null}
    </div>
  );
};

export default observer(MessageHistory);
