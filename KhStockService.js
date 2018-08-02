
// Stock service is responsible for providing
// stock internal API on back-end.
class KhStockService {
  constructor(config) {
    this.config = config;
  }

  start() {
    console.log("stock: service started")
  }
};

module.exports = KhStockService;