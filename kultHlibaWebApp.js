const express = require('express');

class KultHlibaWebApp {
  constructor(config) {
    this.port = config.port
    this.app = express()
    this.app.get('/', this.getStock)
    this.app.get('/stock', this.getStock)
    this.app.get('/plan', this.getPlan)
  }

  start() {
    this.app.listen(this.port, () => console.log('Example app listening on port 3000!'))
  }

  getStock(req, res) {
    res.send({
    })
  }

  getPlan(req, res) {
    res.send({
    })
  }
}
module.exports = KultHlibaWebApp;
