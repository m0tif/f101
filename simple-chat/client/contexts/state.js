import { createContext } from "react";
import { configure } from "mobx";
import Interface from "./interface";
import Chat from "./chat";
import Echoes from "./echoes";
configure({
  enforceActions: "never",
});

export const buildState = (requestUrl) => {
  const state = {};

  const ui = new Interface(state, requestUrl);
  const chat = new Chat(state, requestUrl);
  const echoes = new Echoes(state, requestUrl);

  Object.assign(state, {
    ui,
    chat,
    echoes,
  });
  state.loadPromise = Promise.all([
    ui.loadPromise,
    chat.loadPromise,
    echoes.loadPromise,
  ]);
  return state;
};

export default createContext(buildState());
