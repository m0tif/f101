import React from "react";
import App from "./App";
import Game from "./Game";
import { StaticRouter, Routes, Route } from "react-router-dom";

export default () => (
  <Routes>
    {/* <App /> */}
    <Route path="/" element={<App />} />
    <Route path="echoes" element={<Game />} />
  </Routes>
);
