let debug = require('debug')('khstock');

// Stock service is responsible for providing
// stock internal API on back-end.
class KhStock {
  constructor(config) {
    this.config = config;
  }

  start() {
    debug("service started")
  }
};

module.exports = KhStock;