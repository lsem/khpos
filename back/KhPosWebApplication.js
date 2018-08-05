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

class InvalidArgumentError extends BadRequestError {
  constructor(argName, argValue) {
    let message;
    if (argName && argValue) {
      message = `${argName}=${argValue} is not valid argument `;
    } else if (argName) {
      message = `${argName} argument value is not valid`;
    } else {
      message = `argument is invalid`;
    }
    super(message);
  }
}


function asDate(value) {
  return new Date(value);
}

function tryParseTimeStamp(value) {
  let iso8601ts = new Date(value);
  if (!isNaN(iso8601ts.getTime())) {
    debug("parsed as iso8601: " + value);
    return iso8601ts;
  } else {
    let unixts = new Date(parseInt(value));
    if (unixts.getTime() > 0) {
      debug("parsed as unix timestamp: " + value);
      return unixts;
    }
  }
}

function errorHandler(err, req, res, next) {
  // https://www.restapitutorial.com/httpstatuscodes.html
  console.error(err.message); // Log error message in our server's console
  if (err instanceof BadRequestError) {
    debug("appErrors.BadRequestError")
    res.status(400).send(err.message);
  } else if ( err instanceof appErrors.NotImplementedError) {
    debug("appErrors.NotImplementedError")
    res.status(501).send(err.message);
  } else {
    if (!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).send(err.message);
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

  getStock(req, res, next) {
    this.khApp
      .getStock()
      .then(data => res.send(data))
      .catch(err => next(err));
  }

  getProducts(req, res, next) {
    debug("getting products");
    this.khApp
      .getProducts()
      .then(data => res.send(data))
      .catch(err => next(err));
  }

  getPlan(req, res, next) {
    let fromDate = tryParseTimeStamp(req.query.fromDate);
    if (!fromDate) {
      throw new InvalidArgumentError('fromDate', req.query.fromDate);
    }
    let toDate = tryParseTimeStamp(req.query.toDate);
    if (!toDate) {
      throw new InvalidArgumentError('toDate', req.query.toDate);
    }
    this.khApp
      .getPlan(fromDate, toDate)
      .then(data => res.send(data))
      .catch(err => next(err));
  }
}
module.exports = KhPosWebApplication;
