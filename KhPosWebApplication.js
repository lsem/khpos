const express = require("express");
var cors = require("cors");

class KhPosWebApplication {
  constructor(config, khApp) {
    this.port = config.port;
    this.khApp = khApp;
    this.express = express();
    this.express.use(cors());
    this.express.get("/", this.getStock.bind(this));
    this.express.get("/stock", this.getStock.bind(this));
    this.express.get("/products", this.getProducts.bind(this));
    this.express.get("/plan", this.getPlan.bind(this));
  }

  start() {
    this.express.listen(this.port, () =>
      console.log(`web: listening on port ${this.port}!`)
    );
  }

  getStock(req, res) {
    this.khApp
      .getStock()
      .then(data => res.send(data))
      .catch(err => {
        res.status(500);
        res.send({error: err});
      });
  }

  async getProducts(req, res) {
    this.khApp
      .getProducts()
      .then(data => res.send(data))
      .catch(err => {
        res.status(500);
        res.send({error: err});
      });
  }

  getPlan(req, res) {
    res.status(501);
    res.send({})
  }
}
module.exports = KhPosWebApplication;
