import { createContext } from "react";
import { configure } from "mobx";
import Interface from "./interface";
import Chat from "./chat";
configure({
  enforceActions: "never",
});

export const buildState = (requestUrl) => {
  const state = {};

  const ui = new Interface(state, requestUrl);
  const chat = new Chat(state, requestUrl);

  Object.assign(state, {
    ui,
    chat,
  });
  state.loadPromise = Promise.all([ui.loadPromise, chat.loadPromise]);
  return state;
};

export default createContext(buildState());
