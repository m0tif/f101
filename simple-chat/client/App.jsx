import React from "react";
import Message from "./components/Message.jsx";
import contexts from "./contexts.js";
import ContextPreview from "./components/ContextPreview.jsx";

const App = () => {
  const [messages, setMessages] = React.useState([]);
  const [currentMessage, setCurrentMessage] = React.useState("");
  const [serverUrl, setServerUrl] = React.useState(
    "https://worker-inference.jchancehud.workers.dev/prompt",
  );
  const [temperature, setTemperature] = React.useState("0.7");
  const [maxNewTokens, setMaxNewTokens] = React.useState("1000");
  const [awaitingResponse, setAwaitingResponse] = React.useState(false);

  const inputFieldRef = React.useRef(null);
  const loadConversationRef = React.useRef(null);

  const focusInput = () => {
    if (!awaitingResponse && inputFieldRef.current) {
      inputFieldRef.current.focus();
    }
  };

  // Focus effect when awaitingResponse changes to false
  React.useEffect(focusInput, [awaitingResponse]);

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const v = urlParams.get("prompt_url");
    if (v) {
      setServerUrl(v);
    }
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
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
              setCurrentMessage(last.content);
              setMessages(history.slice(0, -1));
            } else {
              setMessages(history);
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
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
            />
            <span>AI server</span>
          </div>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <input
              style={{ marginRight: "4px" }}
              type="text"
              value={maxNewTokens}
              onChange={(e) => {
                if (/^[0-9]*$/.test(e.target.value)) {
                  setMaxNewTokens(e.target.value);
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
              value={temperature}
              onChange={(e) => {
                if (
                  /^[0-9]*\.?[0-9]*$/.test(e.target.value) ||
                  e.target.value === ""
                ) {
                  setTemperature(e.target.value);
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
              const blob = new Blob([JSON.stringify(messages, null, 2)], {
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
        disabled={awaitingResponse}
        value={currentMessage}
        onChange={(e) => setCurrentMessage(e.target.value)}
        onKeyDown={async (e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            try {
              setAwaitingResponse(true);
              const msg = currentMessage;
              setCurrentMessage("");
              const history = [...messages];
              setMessages([...messages, { role: "user", content: msg }]);
              const r = await fetch(serverUrl, {
                method: "POST",
                headers: {
                  "content-type": "application/json",
                },
                body: JSON.stringify({
                  history,
                  text: msg,
                  temperature,
                  max_new_tokens: maxNewTokens,
                }),
              });
              if (!r.ok) {
                setMessages((old) => {
                  old.pop();
                  old;
                });
                const err = await r.text();
                alert(`error: ${err}`);
                setAwaitingResponse(false);
                return;
              }
              const { text } = await r.json();
              setMessages((old) => [
                ...old,
                { role: "interaction_partner", content: text },
              ]);
              setAwaitingResponse(false);
            } catch (e) {
              console.log(e);
              setAwaitingResponse(false);
            }
          }
        }}
      />
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
          {[...messages].reverse().map((message, index) => {
            return (
              <Message
                key={`${index}-${message}`}
                onRemove={() => {
                  setMessages((old) =>
                    old.filter((_, i) => i !== messages.length - 1 - index),
                  );
                }}
                role={message.role}
                text={message.content}
              />
            );
          })}
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
          {contexts.map(({ name, labels, notes, state }) => (
            <ContextPreview
              key={name}
              name={name}
              labels={labels}
              notes={notes}
              state={state}
              onStartChat={(state) => {
                setMessages(() => state);
                focusInput();
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
