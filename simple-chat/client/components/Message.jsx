import React from "react";
import { marked } from "marked";

function copyToClipboard(str) {
  // Create a new textarea element
  const textarea = document.createElement("textarea");
  // Set the text content of the textarea to the string you want to copy
  textarea.value = str;
  // Make the textarea readonly and set it to be 1x1 pixel in size
  textarea.setAttribute("readonly", "readonly");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  // Add the textarea to the page
  document.body.appendChild(textarea);
  // Focus and select the text
  textarea.focus();
  textarea.select();
  // Use the browser's clipboard API to execute the copy command
  try {
    const successful = document.execCommand("copy");
    if (successful) {
      console.log("Text copied to clipboard!");
    } else {
      console.log("Failed to copy text to clipboard!");
    }
  } catch (err) {
    console.error("Unable to copy text to clipboard:", err);
  }
  // Remove the textarea
  document.body.removeChild(textarea);
}

const humanIdentifiers = [
  ["👩", 20],
  ["🙂", 10],
  ["👨", 5],
];

const selectIdentifier = () => {
  let range = 0;
  const adjustedIdentifiers = humanIdentifiers.map(([char, odds]) => {
    const out = [char, range, range + odds];
    range += odds;
    return out;
  });
  const v = Math.floor(Math.random() * range);
  return adjustedIdentifiers.find(([, start, end]) => {
    return v >= start && v < end;
  })[0];
};

const Message = ({ text, role, onRemove }) => {
  const renderMarkdown = (content) => {
    const html = marked.parse(content || "");
    return { __html: html };
  };

  return (
    <div style={{ display: "flex" }}>
      <div>{role === "user" ? selectIdentifier() : "🤖"}</div>
      <div
        style={{
          border: "1px solid black",
          padding: "3px",
          margin: "2px",
          borderRadius: "5px",
          maxWidth: "800px",
        }}
      >
        <button onClick={onRemove}>Remove</button>
        <button onClick={() => copyToClipboard(text)}>Copy</button>
        <div
          style={{ overflow: "scroll" }}
          dangerouslySetInnerHTML={renderMarkdown(text)}
        />
      </div>
    </div>
  );
};

export default Message;
