let debug = require("debug")("khapp");
let appErrors = require("./AppErrors");
const joi = require("joi");
const moment = require('moment');

const uuidRegExp = tag =>
  `^${tag}-[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`;
const jobIdRegExp = new RegExp(uuidRegExp("JOB"), "i");
const techMapIdRegExp = new RegExp(uuidRegExp("TM"), "i");
const taskIdRegExp = new RegExp(uuidRegExp("TASK"), "i");
const assigneeIdRegExp = new RegExp(uuidRegExp("ASS"), "i");

////////////////////////////////////////////////////////////////////////////////////
const techMapTaskSchema = joi.object().keys({
  id: joi
    .string()
    .regex(taskIdRegExp)
    .required(),
  name: joi.string().required(),
  durationMins: joi
    .number()
    .min(1)
    .max(24 * 60)
    .required(),
  bgColor: joi.string().required() //.regex(/^#[A-Fa-f0-9]{6}/),
});

const techMapSchema = joi.object().keys({
  id: joi
    .string()
    .regex(techMapIdRegExp)
    .required(),
  name: joi.string().required(),
  tintColor: joi.string().required(), //.regex(/^#[A-Fa-f0-9]{6}/),
  tasks: joi
    .array()
    .items(techMapTaskSchema)
    .required()
});

const jobModelSchema = joi.object().keys({
  id: joi
    .string()
    .regex(jobIdRegExp)
    .required(),
  startTime: [
    joi
      .date()
      .iso()
      .required(),
    joi
      .date()
      .timestamp()
      .required()
  ],
  column: joi
    .number()
    .integer()
    .min(0)
    .max(100)
    .required(),
  techMap: techMapSchema.required()
});

////////////////////////////////////////////////////////////////////////////////////

class KhPosApplication {
  constructor(storage, posterProxyService) {
    this.storage = storage;
    this.posterProxyService = posterProxyService;
    this._storageConnected = false;
    this.onErrorCb = (err) => debug('Default error handler: %o', err);
  }

  connectedToStorage() {
    debug("Connected to Storage");
    this._storageConnected = true;
    this.onErrorCb(null);
  }

  disconnectedFromStorge() {
    debug("Disconnected to Storage");
    this._storageConnected = false;
    this.onErrorCb("No storage");
  }

  onError(cb) {
    this.onErrorCb = cb;
  }

  start() {}

  async getProducts() {
    return new Promise((resolve, reject) => {
      this.posterProxyService.getProducts(
        null,
        data => resolve(data),
        error => reject(error)
      );
    });
  }

  async getStock() {
    return new Promise((resolve, reject) => {
      this.posterProxyService.getStock(
        null,
        data => resolve(data),
        error => reject(error)
      );
    });
  }

  validatePlan(plan) {
    return plan.one === 1;
  }
  async getPlan(fromDate, toDate) {
    const plan = this.storage.getPlan(fromDate, toDate);
    return new Promise((resolve, reject) => {
      if (plan) {
        resolve(plan);
      } else {
        reject("Failed to retreive plan from database");
      }
    });
  }

  async getJobs(fromDate, toDate) {
    if (!fromDate || !toDate) {
      return await this.storage.getAllJobs();
    }
    return await this.storage.getJobs(fromDate, toDate);
  }

  async insertJob(jobModel) {
    const model = await joi.validate(jobModel, jobModelSchema);
    await this.storage.insertJob(model);
    return model.id;
  }

  async updateJob(id, jobModel) {
    const model = await joi.validate(jobModel, jobModelSchema);
    await this.storage.updateJobById(id, model);
  }

  async getJob(jobId) {
    // todo: consider move to web app this validation
    // todo: handle errors.
    const id = await joi.validate(
      jobId,
      joi
        .string()
        .regex(jobIdRegExp)
        .required()
    );
    return await this.storage.getJobById(id);
  }

  async setPlan(fromDate, toDate, plan) {
    debug("fromDate: %o, toDate: %o, plan: %O", fromDate, toDate, plan);
    if (!this._storageConnected) {
      throw new appErrors.KhApplicationError("Storage error");
    }
    throw new appErrors.NotImplementedError("setPlan");
  }

  async updatePlan(fromDate, toDate, partialPlan) {
    throw new appErrors.NotImplementedError("updatePlan");
  }

  async getTechMaps() {
    const techMaps = this.storage.getTechMaps();
    return new Promise((resolve, reject) => {
      if (techMaps) {
        resolve(techMaps);
      } else {
        reject("Failed to retreive techMaps from database");
      }
    });
  }

  async getStaff() {
    const staff = this.storage.getStaff();
    return new Promise((resolve, reject) => {
      if (staff) {
        resolve(staff);
      } else {
        reject("Failed to retreive staff from database");
      }
    });
  }
}

module.exports = KhPosApplication;
