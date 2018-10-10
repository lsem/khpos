const config = require("./config/index");
let PosterProxyService = require("./posterProxy");
let KhStorage = require("./KhStorage");
let KhPosApplication = require("./KhPosApplication");
let KhPosWebApplication = require("./KhPosWebApplication");
let KhStock = require("./KhStock");
const mongoDbServer = require('mongodb-memory-server');

class KhPosNodeTestApp {

  static async create() {
    // MongoMemoryServer is started automatically upon construction.
    const mongod = new mongoDbServer.MongoMemoryServer();
    const testStorage = new KhStorage({
      uri: await mongod.getUri(),
      keepReconnect: false
    });
    return new KhPosNodeTestApp(require("./config/index"), mongod, testStorage);
  }

  constructor(config, mongod, storage) {
    this.mongod = mongod;
    this.storage = storage;
    this.config = config;
    this.posterProxy = new PosterProxyService();
    this.khApp = new KhPosApplication({storage: this.storage, posterProxy: this.posterProxy});
    this.khWebApp = new KhPosWebApplication(this.config.web, this.khApp, this.khInMemApp);
    this.KhStock = new KhStock(this.config.stock);
    this.onConnectedToStorage = this.onConnectedToStorage.bind(this);
    this.onFailedConnectingToStorage = this.onFailedConnectingToStorage.bind(this);
  }

  onConnectedToStorage() {
    console.log("connected to storage!");
  }

  onFailedConnectingToStorage() {
    console.log("failed connecting to storage!");
  }

  server() {
    return this.khWebApp.getServer();
  }

  async start() {
    await this.storage.start();
    this.khApp.start();
    this.khWebApp.start();
    //this.KhStock.start();
  }

  async stop() {
    // Stop listening
    await this.khWebApp.close();
    // Disconnect app from mongod
    await this.storage.disconnect();
    // Terminate mongod process.
    this.mongod.stop();
  }
}

module.exports = KhPosNodeTestApp;
