import React from "react";
import Message from "./components/Message.jsx";
import contexts from "./contexts.js";
import ContextPreview from "./components/ContextPreview.jsx";
import Header from "./components/Header.jsx";
import { observer } from "mobx-react-lite";
import state from "./contexts/state.js";

const App = () => {
  const { chat } = React.useContext(state);

  const [showForkHistory, setShowForkHistory] = React.useState(false);

  const loadForkHistory = (context) => {
    const forkHistory = [];
    let fork = context.forkOf;
    while (fork) {
      forkHistory.unshift(...fork.state);
      fork = fork.forkOf;
    }
    return forkHistory;
  };

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const goto_chat = urlParams.get("goto_chat");
    if (goto_chat) {
      const context = contexts.find(({ name }) => name === goto_chat);
      if (!context) return;
      const forkHistory = loadForkHistory(context);
      chat.setForkedState(forkHistory);
      chat.setMessages([...forkHistory, ...context.state]);
    }
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Header />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: "1",
            maxWidth: "400px",
          }}
        >
          <h3>Open an existing context</h3>
          {contexts.map((context) => (
            <ContextPreview
              {...context}
              key={context.name}
              onStartChat={(state) => {
                const forkHistory = loadForkHistory(context);
                chat.setForkedState(forkHistory);
                chat.setMessages([...forkHistory, ...state]);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default observer(App);
