import { createContext } from "react";
import { makeAutoObservable } from "mobx";

export default class Echoes {
  url = "";
  gameLoopActive = false;

  constructor(state, requestUrl) {
    this.state = state;
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
    const prompt_url = urlParams.get("echoes_url");
    if (prompt_url) {
      this.url = prompt_url;
    } else {
      this.url = "http://localhost:5000";
    }
  }

  async stopGameLoop() {
    this.gameLoopActive = false;
  }

  async startGameLoop(chat) {
    if (this.gameLoopActive) return;
    this.gameLoopActive = true;
    for (;;) {
      if (!this.gameLoopActive) break;
      const latestMessage = chat.messages[chat.messages.length - 1].content;
      const regex = /\[ACTION:\s*([^\]]+)\]/;
      const matches = latestMessage.match(regex);
      if (!matches) {
        console.log("no action in message");
        this.gameLoopActive = false;
        break;
      }
      const [, action] = matches;
      if (action === "human") {
        this.gameLoopActive = false;
        alert("ai requested human help!");
        break;
      }
      const gameResponse = await this.doAction(action);
      await new Promise((r) => setTimeout(r, 1500));
      chat.setCurrentMessage(gameResponse);
      await chat.sendMessage();
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  async loadPrompt() {
    const r = await fetch(this.url, {});
    return r.text();
  }

  async doAction(action) {
    const r = await fetch(new URL("/action", this.url), {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        action,
      }),
    });
    return r.text();
  }
}
