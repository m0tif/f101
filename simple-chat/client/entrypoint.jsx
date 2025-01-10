import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Get the root element
const rootElement = document.getElementById("root");

// Check if the root element exists
if (!rootElement) {
  throw new Error("Failed to find the root element");
}

// Create root and render the app
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
