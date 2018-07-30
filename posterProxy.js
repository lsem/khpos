const STATE_CONNECTED = "connected";
const STATE_NOTCONNECTED = "not-connected";
const RECONNECT_TIMEOUT = 5000;

class PosterProxyService {
  constructor() {
    this.onDisconnectedToPosterCb = null;
    this.onConnectedToPosterCb = null;
    this.connectionState = STATE_NOTCONNECTED;
    this.reconnectRetries = 0;
  }

  onConnectedToPoster(cb) {
    this.onConnectedToPosterCb = cb;
  }

  onDisconnectedToPoster(cb) {
    this.onDisconnectedToPosterCb = cb;
  }

  initiateConnect() {}

  scheduleConnectIfNeeded() {
    console.log("posproxy: reconnect");
    setTimeout(() => {
      this.initiateConnect();
      this.reconnectRetries += 1;
      if (this.reconnectRetries === 5) {
        this.onConnectedToPosterCb();
        this.reconnectRetries = 0;
      } else {
        this.scheduleConnectIfNeeded();
      }
    }, 1000);
  }

  start() {
    this.scheduleConnectIfNeeded();
  }
}

module.exports = PosterProxyService;
