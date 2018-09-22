const express = require("express");
const moment = require("moment");
var cors = require("cors");
var morgan = require("morgan");
var debug = require("debug")("khweb");
let appErrors = require("./AppErrors");

class BadRequestError extends Error {
  constructor(message) {
    super(message);
  }
}

class InvalidArgError extends BadRequestError {
  constructor(argName, argValue) {
    let message;
    if (argName && argValue) {
      message = `'${argValue}' is not valid value for argument '${argName}'`;
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
  let iso8601ts = moment(value);
  if (moment(iso8601ts).isValid(iso8601ts)) {
    debug("parsed as iso8601: " + iso8601ts);
    return iso8601ts;
  } else {
    let unixts = new Date(parseInt(value));
    if (unixts.getTime() > 0) {
      debug("parsed as unix timestamp: " + value);
      return unixts;
    }
  }
  return undefined;
}

function errorHandler(err, req, res, next) {
  // https://www.restapitutorial.com/httpstatuscodes.html
  console.error(err.message);
  if (err instanceof BadRequestError) {
    debug("appErrors.BadRequestError");
    res.status(400).send(err.message);
  } else if (err instanceof appErrors.NotImplementedError) {
    debug("appErrors.NotImplementedError");
    res.status(501).send(err.message);
  } else if (err instanceof appErrors.KhApplicationError) {
    debug("appErrors.KhApplicationError");
    res.status(500).send(err.message);
  } else {
    if (!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).send(err.message);
  }
}

class KhPosWebApplication {
  constructor(config, khApp) {
    this.port = config.port;
    this.khApp = khApp;
    this.khApp.onError(what => {
      this.error = what;
    });
    this.app = express();
    this.app.use(cors());
    this.app.use(morgan("tiny"));
    this.app.use(express.json());
    this.app.get("/", this.getStock.bind(this));
    this.app.get("/stock", this.getStock.bind(this));
    this.app.get("/products", this.getProducts.bind(this));
    this.app.get("/plan", this.getPlan.bind(this));
    this.app.post("/plan", this.postPlan.bind(this));
    this.app.patch("/plan", this.patchPlan.bind(this));
    this.app.get("/techmaps", this.getTechMaps.bind(this));
    // Warning: Error handler must go after everything else.
    this.app.use(errorHandler);
  }

  start() {
    this.app.listen(this.port, () => console.log(`web: listening on port ${this.port}!`));
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

  //
  // GET /plan
  //
  getPlan(req, res, next) {
    let fromDate = tryParseTimeStamp(req.query.fromDate);
    if (!fromDate) throw new InvalidArgError("fromDate", req.query.fromDate);
    let toDate = tryParseTimeStamp(req.query.toDate);
    if (!toDate) throw new InvalidArgError("toDate", req.query.toDate);
    this.khApp
      .getPlan(fromDate, toDate)
      .then(data => res.send(data))
      .catch(err => next(err));
  }

  //
  // POST /plan
  //
  postPlan(req, res, next) {
    debug("body: %O", req.body);
    let fromDate = tryParseTimeStamp(req.body.from);
    if (!fromDate) throw new InvalidArgError("from", req.body.from);
    let toDate = tryParseTimeStamp(req.body.to);
    if (!toDate) throw new InvalidArgError("to", req.body.to);
    // todo: validate data (https://gcanti.github.io/2014/09/15/json-api-validation-in-node.html)
    this.khApp
      .setPlan(fromDate, toDate, req.body.data)
      .then(() => res.status(204))
      .catch(err => next(err));
  }

  //
  // PATCH /plan
  //
  patchPlan(req, res, next) {
    debug("body: %O", req.body);
    let fromDate = tryParseTimeStamp(req.body.from);
    if (!fromDate) throw new InvalidArgError("from", req.body.from);
    let toDate = tryParseTimeStamp(req.body.to);
    if (!toDate) throw new InvalidArgError("to", req.body.to);
    // todo: validate data (https://gcanti.github.io/2014/09/15/json-api-validation-in-node.html)
    this.khApp
      .updatePlan(fromDate, toDate, req.body.data)
      .then(() => res.status(204))
      .catch(err => next(err));
  }

  //
  // GET /techmaps
  //
  getTechMaps(req, res, next) {
    this.khApp
      .getTechMaps()
      .then(data => res.send(data))
      .catch(err => next(err));
  }
}
module.exports = KhPosWebApplication;
