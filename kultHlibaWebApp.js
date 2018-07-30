const express = require("express");

class KultHlibaWebApp {
  constructor(config, khApp) {
    this.port = config.port;
    this.khApp = khApp;
    this.express = express();
    this.express.get("/", this.getStock.bind(this));
    this.express.get("/stock", this.getStock.bind(this));
    this.express.get("/plan", this.getPlan.bind(this));
  }

  start() {
    this.express.listen(this.port, () =>
      console.log("Example app listening on port 3000!")
    );
  }

  async getStock(req, res) {
    res.send({});
  }

  async getPlan(req, res) {
    console.log("web: getting plan");
    var plan = await this.khApp.getPlan();
    res.send(plan);
  }
}
module.exports = KultHlibaWebApp;
