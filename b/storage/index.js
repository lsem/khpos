const mongo = require("./mongo");
const employeeMethods = require("./methods/employees");

module.exports = {
  async clear() {
    await mongo.db.collection("jobs").deleteMany({});
    await mongo.db.collection("employees").deleteMany({});
    await mongo.db.collection("techMaps").deleteMany({});
    await mongo.db.collection("ingredients").deleteMany({});
    await mongo.db.collection("inventory").deleteMany({});
  },
  async ensureIndexes() {
    await mongo.db
      .collection("techMaps")
      .createIndex({ id: 1 }, { unique: true });
    await mongo.db.collection("jobs").createIndex({ id: 1 }, { unique: true });
    await mongo.db
      .collection("employees")
      .createIndex({ id: 1 }, { unique: true });
    await mongo.db
      .collection("ingredients")
      .createIndex({ id: 1 }, { unique: true });
    await mongo.db
      .collection("inventory")
      .createIndex({ id: 1 }, { unique: true });
  },
  async start() {
    const uri = gConfig.storage.uri;
    await mongo.connect(uri);
    console.log("Connected to mongodb using", uri);
    await this.ensureIndexes();
  },
  async stop() {
    await mongo.client.close();
  },
  ...employeeMethods
};
