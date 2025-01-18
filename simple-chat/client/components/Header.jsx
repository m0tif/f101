import React from "react";
import { observer } from "mobx-react-lite";
import state from "../contexts/state.js";

const Header = () => {
  const { chat } = React.useContext(state);

  const inputFieldRef = React.useRef(null);
  const loadConversationRef = React.useRef(null);

  const focusInput = () => {
    if (!chat.awaitingResponse && inputFieldRef.current) {
      inputFieldRef.current.focus();
    }
  };

  // Focus effect when awaitingResponse changes to false
  React.useEffect(focusInput, [chat.awaitingResponse, chat.messages]);

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <input
          ref={loadConversationRef}
          onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const text = await file.text();
            const history = JSON.parse(text);
            if (!Array.isArray(history)) {
              alert("Error: conversation history is not an array");
              return;
            }
            for (const v of history) {
              if (typeof v !== "object") {
                alert("Error: conversation history element is not an object");
                return;
              }
              if (!v.role || !v.content) {
                alert(
                  "Error: conversation history element does not have role and content",
                );
                return;
              }
            }
            const last = history[history.length - 1];
            if (last.role === "user") {
              chat.setCurrentMessage(last.content);
              chat.setMessages(history.slice(0, -1));
            } else {
              chat.setMessages(history);
            }
          }}
          type="file"
          accept=".json"
          style={{ display: "none" }}
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <input
              style={{ marginRight: "4px" }}
              type="text"
              placeholder="http://server:port/prompt"
              value={chat.url}
              onChange={(e) => chat.setUrl(e.target.value)}
            />
            <span>AI server</span>
          </div>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <input
              style={{ marginRight: "4px" }}
              type="text"
              value={chat.maxNewTokens}
              onChange={(e) => {
                if (/^[0-9]*$/.test(e.target.value)) {
                  chat.setMaxNewTokens(e.target.value);
                }
              }}
            />
            <span>Max response length</span>
          </div>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <input
              style={{ marginRight: "4px" }}
              type="text"
              placeholder="0.7"
              value={chat.temperature}
              onChange={(e) => {
                if (
                  /^[0-9]*\.?[0-9]*$/.test(e.target.value) ||
                  e.target.value === ""
                ) {
                  chat.setTemperature(e.target.value);
                }
              }}
            />
            <span>Temperature</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <button onClick={() => loadConversationRef.current.click()}>
            Load conversation
          </button>
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(chat.messages, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "conversation.json";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
          >
            Save conversation
          </button>
        </div>
      </div>
      <textarea
        style={{ marginTop: "8px" }}
        ref={inputFieldRef}
        placeholder="type a message and press enter"
        disabled={chat.awaitingResponse}
        value={chat.currentMessage}
        onChange={(e) => chat.setCurrentMessage(e.target.value)}
        onKeyDown={async (e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            chat.sendMessage();
          }
        }}
      />
    </>
  );
};

export default observer(Header);
