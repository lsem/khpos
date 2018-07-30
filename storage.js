class StorageService {
  constructor(config) {
    this.mongoPort = config.port
    console.log('storage: mongo port: ' + this.mongoPort)
  }

  start() {
  }

  planItem() {
  }

  getPlan() {
  }

  initialize() {
    console.log('storage: Initialized');
  }
}

module.exports = StorageService;