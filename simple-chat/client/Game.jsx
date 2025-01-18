import React from "react";
import Header from "./components/Header.jsx";
import { observer } from "mobx-react-lite";
import state from "./contexts/state.js";

const Game = () => {
  const { chat } = React.useContext(state);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Header />
      <div>Soon!</div>
    </div>
  );
};

export default observer(Game);
