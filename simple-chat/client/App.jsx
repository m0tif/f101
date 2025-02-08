import React from "react";
import MessageHistory from "./components/MessageHistory.jsx";
import contexts from "./contexts.js";
import ContextPreview from "./components/ContextPreview.jsx";
import Header from "./components/Header.jsx";
import { observer } from "mobx-react-lite";
import state from "./contexts/state.js";

const App = () => {
  const { chat } = React.useContext(state);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Header />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <MessageHistory />
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
                const forkHistory = chat.loadForkHistory(context);
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
