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
    this.stopRequested = false;
  }

  close(done) {
    this.stopRequested = true;
    if (this.client) {
      this.client.close((err) => {
        if (err) {
          console.err('khStorage: Close error', err);
        } else {
          done();
        }
      });
    } else {
      // We have not started yet, indicate this to omit processing once it is ready.
      this.client = 'closed';
    }
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

  async insertJob(jobModel) {
    await this.db.collection("jobs").insertOne(jobModel);
  }

  async getJobs(dateFrom, dateTo) {
    return await this.db
      .collection("jobs")
      .find({ startTime: { $gte: dateFrom.toDate(), $lte: dateTo.toDate() } })
      .toArray();
  }

  async getAllJobs() {
    return this.db
      .collection("jobs")
      .find()
      .toArray();
  }

  async updateJobById(id, model) {
    return await this.db.collection("jobs").update({ id: id }, model);
  }

  async getJobById(id) {
    return await this.db.collection("jobs").findOne({ id: id });
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
    const connection = MongoClient.connect(
      url,
      { useNewUrlParser: true }
    )
      .then(client => {
        if (this.client === 'closed') {
          debug('Connected after close requested');
          client.close();
          return;
        }
        debug("connected to mongo", client);
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
    if (this.stopRequested) {
      // Tests scenario.
      return;
    }
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
