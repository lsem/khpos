
// Stock service is responsible for providing
// stock internal API on back-end.
class KhStock {
  constructor(config) {
    this.config = config;
  }

  start() {
    console.log("stock: service started")
  }
};

module.exports = KhStock;