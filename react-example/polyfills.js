// polyfills.js
class MessagePort {
  constructor() {
    this.onmessage = null;
  }

  postMessage(data) {
    if (this.onmessage) {
      Promise.resolve().then(() => {
        this.onmessage({ data });
      });
    }
  }

  start() {}
  close() {}
}

class MessageChannel {
  constructor() {
    this.port1 = new MessagePort();
    this.port2 = new MessagePort();

    // Connect the ports
    const port1 = this.port1;
    const port2 = this.port2;
    this.port1.postMessage = (data) => port2.onmessage?.({ data });
    this.port2.postMessage = (data) => port1.onmessage?.({ data });
  }
}

// Add to global scope
globalThis.MessageChannel = MessageChannel;
globalThis.MessagePort = MessagePort;
