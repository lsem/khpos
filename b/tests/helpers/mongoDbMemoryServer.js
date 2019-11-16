const mongoDbServer = require("mongodb-memory-server");

module.exports = {
  server: undefined,
  start() {
    this.server = new mongoDbServer.MongoMemoryServer({
      instance: { port: gConfig.storage.port }
    });
  },
  stop() {
    this.server.stop();
  }
};
