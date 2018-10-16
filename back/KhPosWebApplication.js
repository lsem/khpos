const express = require("express");
const moment = require("moment");
var cors = require("cors");
var morgan = require("morgan");
var debug = require("debug")("khweb");
let appErrors = require("./AppErrors");
const http = require("http");


function asDate(value) {
  return new Date(value);
}

function tryParseTimeStamp(value) {
  if (!value) {
    return undefined;
  }
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
  // WARNING: Order metters because of how catch works in regards to inheritance.
  //console.log(err)
  if (err instanceof appErrors.NotFoundError) {
    debug("appErrors.NotFoundError: %o", err);
    res.status(404).send(err.message);
  } else if (err instanceof appErrors.InvalidModelError) {
    debug("appErrors.InvalidModelError: %o", err);
    res.status(400).send(err.message);
  } else if (err instanceof appErrors.NotImplementedError) {
    debug("appErrors.NotImplementedError: %o", err);
    res.status(501).send(err.message);
  } else if (err instanceof appErrors.InvalidOperationError) {
    debug("appErrors.InvalidOperationError: %o", err);
    res.status(400).send(err.message);
  } else if (err instanceof appErrors.BadRequestError) {
    debug("appErrors.BadRequestError: %o", err);
    res.status(400).send(err.message);
  } else if (err instanceof appErrors.KhApplicationError) {
    debug("appErrors.KhApplicationError: %o", err);
    res.status(500).send(err.message);
  } else {
    if (!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).send(err.message);
  }
}

class KhPosWebApplication {
  constructor(config, khApp, inMemApp) {
    this.port = config.port;
    this.khApp = khApp;
    this.inMemApp = inMemApp;
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
    this.app.get("/techmaps", this.getTechMaps.bind(this));
    this.app.get("/staff", this.getStaffCollection.bind(this));
    this.app.get("/staff/:id", this.getStaff.bind(this));
    this.app.patch("/staff/:id", this.patchStaff.bind(this));
    this.app.get("/jobs", this.getJobs.bind(this));
    this.app.get("/jobs/:id", this.getJob.bind(this));
    this.app.post("/jobs", this.postJobs.bind(this));
    this.app.patch("/jobs/:id", this.patchJob.bind(this));
    // Warning: Error handler must go after everything else.
    this.app.use(errorHandler);
  }

  getServer() {
    return this.server;
  }

  async close() {
    await this.server.close();
  }

  getApp(req) {
    return req.headers["inmem"] ? this.inMemApp : this.khApp;
  }

  start() {
    //this.server = this.app.listen(this.port, () => console.log(`web: listening on port ${this.port}!`));
    this.server = http.createServer(this.app);
    this.server.listen(this.port, () =>
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

  //
  // GET /jobs
  //
  getJobs(req, res, next) {
    let fromDate = null,
      toDate = null;

    // don't ask: https://stackoverflow.com/questions/4540422/why-is-there-no-logical-xor-in-javascript
    if (!req.query.fromDate !== !req.query.toDate) {
      throw new appErrors.InvalidArgError("Both fromDate and toDate should be specified");
    }

    // Without from and to date return all documents.
    if (req.query.fromDate && req.query.toDate) {
      fromDate = tryParseTimeStamp(req.query.fromDate);
      if (!fromDate) throw new appErrors.InvalidArgError("fromDate", req.query.fromDate);
      toDate = tryParseTimeStamp(req.query.toDate);
      if (!toDate) throw new appErrors.InvalidArgError("toDate", req.query.toDate);
    }
    this.getApp(req)
      .getJobs(fromDate, toDate)
      .then(data => res.send(data))
      .catch(err => next(err));
  }
  //
  // GET /job
  //
  getJob(req, res, next) {
    debug(req.params.id);
    this.getApp(req)
      .getJob(req.params.id)
      .then(data => res.send(data))
      .catch(err => next(err));
  }
  //
  // POST /jobs
  //
  postJobs(req, res, next) {
    debug("body: %O", req.body);
    this.getApp(req)
      .insertJob(req.body)
      .then(id =>
        res
        .status(201)
        .location("/jobs/" + id)
        .send()
      ).catch(err => next(err));
  }

  patchJob(req, res, next) {
    debug(req.params.id);
    this.getApp(req)
      .updateJob(req.params.id, req.body)
      .then(() => res.status(200).send())
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

  //
  // GET /staff
  //
  getStaffCollection(req, res, next) {
    this.khApp
      .getStaffCollection()
      .then(data => res.send(data))
      .catch(err => next(err));
  }

  //
  // PATCH /staff
  //
  patchStaff(req, res, next) {
    debug(req.params.id);
    this.getApp(req)
      .updateStaff(req.params.id, req.body)
      .then(() => res.status(200).send())
      .catch(err => next(err));
  }

  //
  // GET /staff/:id
  //
  getStaff(req, res, next) {
    this.khApp
      .getStaff(req.params.id)
      .then(data => res.send(data))
      .catch(err => next(err));
  }
}
module.exports = KhPosWebApplication;