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
    this.db.collection("ingredients").remove();
    this.db.collection("inventory").remove();
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

  async ensureIndexes() {
    await this.db.collection("techMaps").ensureIndex({ id: 1 }, { unique: true });
    await this.db.collection("jobs").ensureIndex({ id: 1 }, { unique: true });
    await this.db.collection("employees").ensureIndex({ id: 1 }, { unique: true });
    await this.db.collection("ingredients").ensureIndex({ id: 1 }, { unique: true });
    await this.db.collection("inventory").ensureIndex({ id: 1 }, { unique: true });
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
    await this.ensureIndexes();
  }

  //////////////////////////////////////////////////////////////////////////////////////////

  async insertJob(jobModel) {
    try {
      await this.db.collection("jobs").insertOne(jobModel);
    } catch (e) {
      if (e.code === 11000) {
        throw new appErrors.AlreadyExistsError(jobModel.id);
      } else {
        throw e;
      }
    }
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
    try {
      await this.db.collection("employees").insertOne(employee);
    } catch (e) {
      if (e.code === 11000) {
        throw new appErrors.AlreadyExistsError(employee.id);
      } else {
        throw e;
      }
    }
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

  async getTechMaps() {
    return await this.db
      .collection("techMaps")
      .find()
      .toArray();
  }

  async getTechMap(id) {
    const res = await this.db.collection("techMaps").findOne({ id });
    if (!res) {
      throw new appErrors.NotFoundError(`techMap: ${id}`);
    }
    return res;
  }

  async insertTechMap(techMap) {
    try {
      await this.db.collection("techMaps").insertOne({ ...techMap });
    } catch (e) {
      if (e.code === 11000) {
        throw new appErrors.AlreadyExistsError(techMap.id);
      } else {
        throw e;
      }
    }
  }

  async updateTechMap(id, updateCB) {
    const updated = updateCB(await this.getTechMap(id));
    await this.db.collection("techMaps").replaceOne({ id }, { ...updated });
  }

  /////////////////////////////////////////////////////////////////////////////

  async getIngredients() {
    return await this.db
      .collection("ingredients")
      .find()
      .toArray();
  }

  async getIngredient(id) {
    const res = await this.db.collection("ingredients").findOne({ id });
    if (!res) {
      throw new appErrors.NotFoundError(`ingredient: ${id}`);
    }
    return res;
  }

  async insertIngredient(ingredient) {
    try {
      await this.db.collection("ingredients").insertOne({ ...ingredient });
    } catch (e) {
      if (e.code === 11000) {
        throw new appErrors.AlreadyExistsError(ingredient.id);
      } else {
        throw e;
      }
    }
  }

  /////////////////////////////////////////////////////////////////////////////

  async getInventory() {
    return await this.db
      .collection("inventory")
      .find()
      .toArray();
  }

  async getDevice(id) {
    const res = await this.db.collection("inventory").findOne({ id });
    if (!res) {
      throw new appErrors.NotFoundError(`device: ${id}`);
    }
    return res;
  }

  async insertDevice(inventory) {
    try {
      await this.db.collection("inventory").insertOne({ ...inventory });
    } catch (e) {
      if (e.code === 11000) {
        throw new appErrors.AlreadyExistsError(inventory.id);
      } else {
        throw e;
      }
    }
  }
}

module.exports = KhStorage;
