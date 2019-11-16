const MongoClient = require("mongodb").MongoClient;

module.exports = {
  db: undefined,
  client: undefined,
  async connect(uri) {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true
    };
    this.client = await MongoClient.connect(uri, options);
    this.db = this.client.db();
  }
};
