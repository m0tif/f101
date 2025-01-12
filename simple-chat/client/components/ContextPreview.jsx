import React from "react";

const ContextPreview = ({
  name,
  labels,
  notes,
  forkOf,
  state,
  onStartChat,
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        border: "1px solid black",
        padding: "10px",
        margin: "2px",
        borderRadius: "5px",
      }}
    >
      <div>
        <div style={{ fontWeight: "bold" }}>{name}</div>
        <div style={{ height: "4px" }} />
        {forkOf ? (
          <div>
            Fork of <span style={{ fontWeight: "bold" }}>{forkOf.name}</span>
          </div>
        ) : null}
        <div style={{ height: "4px" }} />
        <button
          onClick={() => {
            if (!onStartChat) return;
            onStartChat(state);
          }}
        >
          start chat
        </button>
      </div>
      <div style={{ alignSelf: "right" }}>
        {(labels || []).map((v) => (
          <div key={v} style={{ fontSize: "10px", textAlign: "right" }}>
            {v}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContextPreview;
