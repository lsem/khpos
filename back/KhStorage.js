const EventEmitter = require("events");
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
let debug = require("debug")("khstorage");
const sampleData = require("./sampleData");
let appErrors = require("./AppErrors");

const STATE_CONNECTED = "STATE_CONNECTED";
const STATE_DISCONNECTED = "STATE_DISCONNECTED";
const EXCLUDE_MONGO_ID = { projection: { _id: 0 } };

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
    this.db.collection("employees").remove();
    this.db.collection("techMaps").remove();
  }

  async connectToMongoDb() {
    // todo: http://mongodb.github.io/node-mongodb-native/3.1/reference/connecting/connection-settings/
    try {
      const options = {
        useNewUrlParser: true
      };
      this.client = await MongoClient.connect(this.uri, options);
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
      .find(
        {
          startTime: {
            $gte: dateFrom.toDate(),
            $lte: dateTo.toDate()
          }
        },
        {
          projection: {
            _id: false
          }
        }
      )
      .toArray();
  }

  async getAllJobs() {
    return await this.db
      .collection("jobs")
      .find(
        {},
        {
          projection: {
            _id: false
          }
        }
      )
      .toArray();
  }

  async updateJobById(id, model) {
    const existingModel = await this.db.collection("jobs").findOne({
      id: id
    });
    if (!existingModel) {
      throw new appErrors.NotFoundError(`Job ${id}`);
    }
    if (existingModel.id !== model.id) {
      throw new appErrors.InvalidOperationError(
        `Job modification is not allowed: ${existingModel.id} != ${model.id}`
      );
    }
    return await this.db.collection("jobs").update(
      {
        id: id
      },
      model
    );
  }

  async getJobById(id) {
    const job = await this.db.collection("jobs").findOne(
      {
        id: id
      },
      {
        projection: {
          _id: false
        }
      }
    );
    if (!job) {
      throw new appErrors.NotFoundError(`Job ${id}`);
    }
    return job;
  }

  /////////////////////////////////////////////////////////////////////////////

  async getAllEmployees() {
    //return sampleData.getStaff();
    return await this.db
      .collection("employees")
      .find(
        {},
        {
          projection: {
            _id: false
          }
        }
      )
      .toArray();
  }

  async insertEmployee(employee) {
    await this.db.collection("employees").insertOne(employee);
  }

  async getEmployeeById(id) {
    const staffEntry = await this.db.collection("employees").findOne(
      {
        id: id
      },
      {
        projection: {
          _id: false
        }
      }
    );
    if (!staffEntry) {
      throw new appErrors.NotFoundError(`Employee ${id}`);
    }
    return staffEntry;
  }

  async updateEmployeeById(id, model) {
    const existingModel = await this.db.collection("employees").findOne({
      id: id
    });
    if (!existingModel) {
      throw new appErrors.NotFoundError(`Employee ${id}`);
    }
    if (existingModel.id !== model.id) {
      throw new appErrors.InvalidOperationError(
        `Employee modification is not allowed: ${existingModel.id} != ${model.id}`
      );
    }
    return await this.db.collection("employees").update(
      {
        id: id
      },
      model
    );
  }

  /////////////////////////////////////////////////////////////////////////////

  async getTechMapsHeads() {
    return await this.db
      .collection("techMaps")
      .find({ isHead: true }, EXCLUDE_MONGO_ID)
      .toArray();
  }

  async getTechMapAllVersions(id) {
    return await this.db
      .collection("techMaps")
      .find({ id }, EXCLUDE_MONGO_ID)
      .toArray();
  }

  async getTechMapHead(id) {
    return await this.db
      .collection("techMaps")
      .findOne({ id, isHead: true }, EXCLUDE_MONGO_ID);
  }

  async getTechMapSpecificVersion(id, version) {
    return await this.db
      .collection("techMaps")
      .findOne({ id, version }, EXCLUDE_MONGO_ID);
  }

  async insertTechMap(techMap) {
    await this.db.collection("techMaps").insertOne({ ...techMap });
    //explicit copying because mongodb modifies passed object by adding _id prop
  }

  async updateTechMap(filter, patch) {
    await this.db.collection("techMaps").updateOne(filter, { $set: patch });
  }
}

module.exports = KhStorage;
