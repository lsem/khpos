const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
let debug = require("debug")("khstorage");
const sampleData = require("./sampleData");
let appErrors = require("./AppErrors");

const STATE_CONNECTED = "state-connected";
const STATE_DISCONNECTED = "state-disconnected";

class KhStorage {
  constructor(config) {
    this.port = config.port;
    this.host = config.host;
    this.reconnect_timeout = config.reconnect_timeout || 3000;
    this.state = STATE_DISCONNECTED;
    debug("storage: mongo %s : %d", this.host, this.port);
  }

  onConnected(cb) {
    this.onConnectedCb = cb;
  }

  onDisconnected(cb) {
    this.onDisconnected = cb;
  }

  start() {
    this._initiateConnect();
  }

  planCollection() {
    return this.db.collection("plan");
  }

  async planItem() {
    return await this.db.collection("plan").insertOne({
      bread: 1
    });
  }

  async insertJob(jobModel) {
    await this.db.collection("plan").insertOne(jobModel);
  }

  async getPlan(dateFrom, dateTo) {
    /*return await this.db
      .collection("plan")
      .find({}, { fields: { _id: 0 } })
      .toArray();*/
    return await sampleData.getPlan(dateFrom, dateTo);
  }

  async getJobs(dateFrom, dateTo) {
    /*return await this.db
      .collection("plan")
      .find({}, { fields: { _id: 0 } })
      .toArray();*/
    return await sampleData.getPlan(dateFrom, dateTo);
  }

  async getJobById(id) {
    return await this.db.collection("plan").findOne({id: id});
  }

  async getTechMaps() {
    return await sampleData.getTechMaps();
  }

  async getStaff() {
    return await sampleData.getStaff();
  }

  _initiateConnect() {
    debug("_initiateConnect");
    // todo: http://mongodb.github.io/node-mongodb-native/3.1/reference/connecting/connection-settings/
    const url = `mongodb://${this.host}:${this.port}`;
    debug("url: %s", url);
    MongoClient.connect(
      url,
      { useNewUrlParser: true }
    )
      .then(client => {
        debug("connected to mongo");
        client.on("close", () => this.handleClose());
        client.on("authenticated", () => this.handleAuthenticated());
        client.on("error", () => this.handleError());
        client.on("reconnect", () => this.handleReconnect());
        client.on("timeout", () => this.handleTimeout());
        this.client = client;
        let db = client.db("mydb");
        if (db) {
          this.db = db;
        }
        this.state = STATE_CONNECTED;
        this.onConnectedCb();
      })
      .catch(err => {
        debug(
          "failed connecting to mongo, reconnect in %d milliseconds",
          this.reconnect_timeout
        );
        setTimeout(() => this._initiateConnect(), this.reconnect_timeout);
      });
  }

  handleClose() {
    debug("connection closed, reconnecting..");
    this.onDisconnected();
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
