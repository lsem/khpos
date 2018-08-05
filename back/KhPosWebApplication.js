const express = require("express");
var cors = require("cors");
var morgan = require("morgan");
var debug = require("debug")("khweb");
let appErrors = require('./AppErrors')

class BadRequestError extends Error {
  constructor(message) {
    super(message);
  }
}

function asDate(value) {
  return new Date(value);
}

function tryParseTimeStamp(value) {
  let iso8601ts = new Date(value);
  if (!isNaN(iso8601ts.getTime())) {
    console.log("parsed as iso8601: " + value);
    return iso8601ts;
  } else {
    let unixts = new Date(parseInt(value));
    if (unixts.getTime() > 0) {
      console.log("parsed as unix timestamp: " + value);
      return unixts;
    }
  }
}

function errorHandler(err, req, res, next) {
  // https://www.restapitutorial.com/httpstatuscodes.html
  console.error(err.message); // Log error message in our server's console
  if (err instanceof BadRequestError) {
    res.status(400).send(err.message);
  } else if ( err instanceof appErrors.NotImplementedError) {
    res.status(501).send(err.message);
  } else if ( err instanceof appErrors.InconsistentPlanDateError) {
    res.status(501).send(err.message);
  } else {
    if (!err.statusCode) err.statusCode = 500; // If err has no specified error code, set error code to 'Internal Server Error (500)'
    res.status(err.statusCode).send(err.message); // All HTTP requests must have a response, so let's send back an error with its status code and message
  }
}

class KhPosWebApplication {
  constructor(config, khApp) {
    this.port = config.port;
    this.khApp = khApp;
    this.express = express();
    this.express.use(cors());
    this.express.use(morgan("tiny"));
    this.express.get("/", this.getStock.bind(this));
    this.express.get("/stock", this.getStock.bind(this));
    this.express.get("/products", this.getProducts.bind(this));
    this.express.get("/plan", this.getPlan.bind(this));
    // Warning: Error handler must go after everything else.
    this.express.use(errorHandler);
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
        res.send({ error: err });
      });
  }

  async getProducts(req, res) {
    debug("getting products");
    this.khApp
      .getProducts()
      .then(data => res.send(data))
      .catch(err => {
        res.status(500);
        res.send({ error: err.message });
      });
  }

  getPlan(req, res, next) {
    let fromDate = tryParseTimeStamp(req.query.fromDate);
    if (!fromDate) {
      throw new BadRequestError(`fromDate '${req.query.fromDate}' is not valid date`);
    }
    let toDate = tryParseTimeStamp(req.query.toDate);
    if (!toDate) {
      throw new BadRequestError(`toDate '${req.query.toDate}' is not valid date`);
    }
    this.khApp
      .getPlan(fromDate, toDate)
      .then(data => res.send(data))
      .catch(err => next(err));
  }
}
module.exports = KhPosWebApplication;
