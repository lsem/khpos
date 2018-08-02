const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
let debug = require('debug')('khstorage');

const STATE_CONNECTED = "state-connected";
const STATE_DISCONNECTED = "state-disconnected";

class KhStorage {
  constructor(config) {
    this.port = config.port;
    this.state = STATE_DISCONNECTED;
    debug("storage: mongo port: %d", this.port);
  }

  onConnected(cb) {
    this.onConnectedCb = cb;
  }

  start() {
    this._initiateConnect();
  }

  async planItem() {
    return await this.db.collection("plan").insertOne({
      bread: 1
    });
  }

  async getPlan() {
    return await this.db
      .collection("plan")
      .find({}, { fields: { _id: 0 } })
      .toArray();
  }

  _initiateConnect() {
    debug("_initiateConnect");
    // todo: http://mongodb.github.io/node-mongodb-native/3.1/reference/connecting/connection-settings/
    const url = "mongodb://localhost:" + this.port + "/myproject?connectTimeoutMS=1000";
    debug("url: %s", url);
    MongoClient.connect(
      url,
      (err, client) => {
        if (!err && client) {
          debug("connected to mongo");
          this.state = STATE_CONNECTED;
          client.on("close", () => this.handleClose());
          client.on("authenticated", () => this.handleAuthenticated());
          client.on("error", () => this.handleError());
          client.on("reconnect", () => this.handleReconnect());
          client.on("timeout", () => this.handleTimeout());
          let db = client.db("mydb");
          if (db) {
            this.db = db;
            this.onConnectedCb();
          }
          this.client = client;
        } else {
          debug("error connection to mongo");
          setTimeout(() => this._initiateConnect(), 1000);
        }
      }
    );
  }

  handleClose() {
    debug("connection closed, reconnecting..");
    this._initiateConnect();
  }

  handleAuthenticated() {
    debug("authenticated");
  }

  handleReconnect() {
    debug("reconnect");
  }

  handleTimeout() {
    debug("timeout");
  }
}

module.exports = KhStorage;
