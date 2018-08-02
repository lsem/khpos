const express = require("express");
var cors = require("cors");

class KultHlibaWebApp {
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
      console.log(`Example app listening on port ${this.port}!`)
    );
  }

  getStock(req, res) {
    this.khApp
      .getStock()
      .then(data => res.send(data))
      .catch(err => {
        console.log("caught error: " + err);
        res.status(501);
        res.send(error);
      });
  }

  async getProducts(req, res) {
    this.khApp
      .getProducts()
      .then(data => res.send(data))
      .catch(err => {
        console.log("caught error: " + err);
        res.status(501);
        res.send(error);
      });
  }

  getPlan(req, res) {
    console.log("web: getting plan");
    res.status(501);
    res.send({})
  }
}
module.exports = KultHlibaWebApp;
