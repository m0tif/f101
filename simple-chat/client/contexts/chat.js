import { createContext } from "react";
import { makeAutoObservable } from "mobx";
import contexts from "../contexts";

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

export default class Chat {
  url = "";
  maxNewTokens = "1000";
  temperature = "0.7";
  // we'll slice this array in the render function but leave it as
  // is here so that exports/imports work as expected
  messages = [];
  forkedState = [];
  currentMessage = "";
  awaitingResponse = false;
  humanIdentifier = selectIdentifier();

  constructor(state, requestUrl) {
    makeAutoObservable(this);
    if (typeof window !== "undefined") {
      this.load();
    } else {
      this.loadSSR(requestUrl);
    }
  }

  async loadSSR(requestUrl) {
    // const url = new URL(requestUrl);
    // this.url = url;
  }

  // must be called in browser, not in SSR
  load() {
    const urlParams = new URLSearchParams(window.location.search);
    const prompt_url = urlParams.get("prompt_url");
    const goto_chat = urlParams.get("goto_chat");
    if (prompt_url) {
      this.url = prompt_url;
    } else {
      this.url = "https://worker-inference.jchancehud.workers.dev/prompt";
    }
    if (goto_chat) {
      const context = contexts.find(({ name }) => name === goto_chat);
      if (!context) return;
      const forkHistory = this.loadForkHistory(context);
      this.setForkedState(forkHistory);
      this.setMessages([...forkHistory, ...context.state]);
    }
  }

  async sendMessage() {
    this.awaitingResponse = true;
    try {
      const msg = this.currentMessage;
      this.currentMessage = "";
      const history = [...this.messages];
      this.setMessages([...this.messages, { role: "user", content: msg }]);
      const r = await fetch(this.url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          text: msg,
          history,
          temperature: this.temperature,
          max_new_tokens: this.maxNewTokens,
        }),
      });
      if (!r.ok) {
        this.setMessages(history);
        const err = await r.text();
        alert(`error: ${err}`);
        this.setAwaitingResponse(false);
        return;
      }
      const { text } = await r.json();
      this.setMessages([
        ...this.messages,
        { role: "interaction_partner", content: text },
      ]);
      this.setAwaitingResponse(false);
    } catch (err) {
      console.log(e);
      this.setAwaitingResponse(false);
    }
  }

  loadForkHistory(context) {
    const forkHistory = [];
    let fork = context.forkOf;
    while (fork) {
      forkHistory.unshift(...fork.state);
      fork = fork.forkOf;
    }
    return forkHistory;
  }

  setUrl(prompt_url) {
    this.url = prompt_url;
  }

  setMaxNewTokens(count) {
    this.maxNewTokens = count;
  }

  setTemperature(temp) {
    this.temperature = temp;
  }

  setForkedState(msgs) {
    if (!Array.isArray(msgs)) {
      throw new Error("expected message array in chat setForkedState");
    }
    this.forkedState = msgs;
  }

  setMessages(msgs) {
    if (!Array.isArray(msgs)) {
      throw new Error("expected message array in chat setMessages");
    }
    this.messages = msgs;
  }

  setAwaitingResponse(v) {
    this.awaitingResponse = !!v;
  }

  setCurrentMessage(msg) {
    this.currentMessage = msg;
  }
}
