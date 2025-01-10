import React from "react";

const ContextPreview = ({ name, labels, notes, state, onStartChat }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        border: "1px solid black",
        padding: "3px",
        margin: "2px",
        borderRadius: "5px",
      }}
    >
      <div>
        <h4>{name}</h4>
        <button
          onClick={() => {
            if (!onStartChat) return;
            onStartChat(state);
          }}
        >
          start chat
        </button>
      </div>
      <div style={{ alignSelf: "center" }}>
        {labels.map((v) => (
          <div key={v} style={{ fontSize: "10px" }}>
            {v}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContextPreview;
