import React from "react";
import Header from "./components/Header.jsx";
import { observer } from "mobx-react-lite";
import MessageHistory from "./components/MessageHistory.jsx";
import state from "./contexts/state.js";

const Game = () => {
  const { chat, echoes } = React.useContext(state);
  const [manualMessage, setManualMessage] = React.useState("");

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
            padding: "8px",
            border: "1px solid black",
            marginTop: "8px",
          }}
        >
          <div>Game info</div>
          <div>Player name: mote</div>
          <div style={{ display: "flex" }}>
            <input
              style={{ marginRight: "4px", width: "200px" }}
              type="text"
              placeholder="http://server:port/prompt"
              value={echoes.url}
              onChange={(e) => echoes.setUrl(e.target.value)}
            />
            <span>game server</span>
          </div>
          <textarea
            value={manualMessage}
            onChange={(e) => setManualMessage(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                console.log(await echoes.doAction(manualMessage));
              }
            }}
          />
          <button
            onClick={async () => {
              chat.setCurrentMessage(await echoes.loadPrompt());
            }}
          >
            load prompt
          </button>
          <button onClick={() => echoes.startGameLoop(chat)}>start</button>
          <button onClick={() => echoes.stopGameLoop()}>stop</button>
        </div>
      </div>
    </div>
  );
};

export default observer(Game);
