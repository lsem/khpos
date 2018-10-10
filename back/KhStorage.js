const EventEmitter = require("events");
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
let debug = require("debug")("khstorage");
const sampleData = require("./sampleData");
let appErrors = require("./AppErrors");

const STATE_CONNECTED = "STATE_CONNECTED";
const STATE_DISCONNECTED = "STATE_DISCONNECTED";

class KhStorage extends EventEmitter {
  constructor(config) {
    super();
    this.uri = config.uri;
    this.keepReconnect = config.keepReconnect || false;
    this.reconnect_timeout = config.reconnect_timeout || 3000;
    this.stopRequested = false;
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
    }
  }

  async clear() {
    this.db.collection("jobs").remove();
  }

  async connectToMongoDb() {
    // todo: http://mongodb.github.io/node-mongodb-native/3.1/reference/connecting/connection-settings/
    try {
      const options = {
        useNewUrlParser: true
      };
      this.client = await MongoClient.connect(
        this.uri,
        options
      );
      this.client.on("close", () => this.handleClose());
      this.client.on("authenticated", () => this.handleAuthenticated());
      this.client.on("error", () => this.handleError());
      this.client.on("reconnect", () => this.handleReconnect());
      this.client.on("timeout", () => this.handleTimeout());
      this.db = this.client.db();
      this.emit("connected");
    } catch (err) {
      console.error("Failed connecting to mongo: ", err);
      this.reconnectIfNeeded();
    }
  }

  reconnectIfNeeded() {
    if (this.keepReconnect) {
      setTimeout(() => this.connectToMongoDb(), this.reconnect_timeout);
    }
  }

  handleClose() {
    this.emit("disconnected");
    this.reconnectIfNeeded();
  }

  handleAuthenticated() {
    debug("authenticated");
  }

  handleReconnect() {
    debug("reconnect");
    this.emit("connected");
  }

  handleTimeout() {
    debug("timeout");
    this.reconnectIfNeeded();
  }

  async start() {
    // Server can start in two modes:
    //  1) for testing
    //    start returns promise which is resolved as soon as storage connected
    //  2) for live/production
    //    start returns immidiately resolved promise
    if (this.keepReconnect) {
      setTimeout(() => this.connectToMongoDb(), this.reconnect_timeout);
    } else {
      await this.connectToMongoDb();
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////

  async insertJob(jobModel) {
    await this.db.collection("jobs").insertOne(jobModel);
  }

  async getJobs(dateFrom, dateTo) {
    return await this.db
      .collection("jobs")
      .find({
        startTime: {
          $gte: dateFrom.toDate(),
          $lte: dateTo.toDate()
        }
      })
      .toArray();
  }

  async getAllJobs() {
    return await this.db
      .collection("jobs")
      .find()
      .toArray();
  }

  async updateJobById(id, model) {
    return await this.db.collection("jobs").update({
        id: id
      },
      model
    );
  }

  async getJobById(id) {
    return await this.db.collection("jobs").findOne({
      id: id
    });
  }

  async getTechMaps() {
    return await sampleData.getTechMaps();
  }

  async getStaff() {
    return await sampleData.getStaff();
  }
}

module.exports = KhStorage;