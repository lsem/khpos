let debug = require("debug")("khapp");
let appErrors = require("./AppErrors");
const joi = require("joi");
const moment = require("moment");

const uuidRegExp = tag =>
  `^${tag}-[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`;
const jobIdRegExp = new RegExp(uuidRegExp("JOB"), "i");
const techMapIdRegExp = new RegExp(uuidRegExp("TM"), "i");
const taskIdRegExp = new RegExp(uuidRegExp("TASK"), "i");
const assigneeIdRegExp = new RegExp(uuidRegExp("ASS"), "i");

////////////////////////////////////////////////////////////////////////////////////

const taskAssigneeSchema = joi.object().keys({
  id: joi.string().regex(assigneeIdRegExp).required(),
  firstName: joi.string().required(),
  color: joi.string().required()
});


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
  bgColor: joi.string().required(), //.regex(/^#[A-Fa-f0-9]{6}/),
  assigned: joi.array().items(taskAssigneeSchema).required()
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

const staffModelSchema = joi.object().keys({
  id: joi
    .string()
    .regex(assigneeIdRegExp)
    .required(),
  firstName: joi.string().required(),
  color: joi.string().required()
});

////////////////////////////////////////////////////////////////////////////////////

class KhPosApplication {
  constructor(deps) {
    if (!deps.storage) throw new Error("No storage");
    if (!deps.posterProxy) throw new Error("No posterProxy");
    this.storage = deps.storage;
    this.posterProxyService = deps.posterProxy;
    this._storageConnected = false;
    this.onErrorCb = err => debug("Default error handler: %o", err);
    this.storage.on('connected', () => this.connectedToStorage());
    this.storage.on('disconnected', () => this.disconnectedFromStorge());
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

  async clearStorage() {
    await this.storage.clear();
  }

  async getProducts() {
    return new Promise((resolve, reject) => {
      this.posterProxyService.getProducts(
        null,
        data => resolve(data),
        error => reject(error)
      );
    });
  }

  ///////////////////////////////////////////////////////////////////////////

  async getStock() {
    return new Promise((resolve, reject) => {
      this.posterProxyService.getStock(
        null,
        data => resolve(data),
        error => reject(error)
      );
    });
  }

  ///////////////////////////////////////////////////////////////////////////

  async getJobs(fromDate, toDate) {
    if (!fromDate || !toDate) {
      return await this.storage.getAllJobs();
    }
    return await this.storage.getJobs(fromDate, toDate);
  }

  async insertJob(jobModel) {
    let modelOrNull;
    try {
      modelOrNull = await joi.validate(jobModel, jobModelSchema);
    } catch (err) {
      throw new appErrors.InvalidModelError(jobModel);
    }
    await this.storage.insertJob(modelOrNull);
    return modelOrNull.id;
  }

  async updateJob(id, jobModel) {
    const model = await joi.validate(jobModel, jobModelSchema);
    await this.storage.updateJobById(id, model);
  }

  async getJob(jobId) {
    // todo: consider move to web app this validation
    let irOrNull;
    try {
      irOrNull = await joi.validate(
        jobId,
        joi
        .string()
        .regex(jobIdRegExp)
        .required()
      );
    } catch (err) {
      throw new appErrors.InvalidArgError("Invalid job id: " + jobId);
    }
    return await this.storage.getJobById(irOrNull);
  }

  ///////////////////////////////////////////////////////////////////////////

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

  ///////////////////////////////////////////////////////////////////////////

  async getStaffCollection() {
    const staff = this.storage.getStaff();
    return new Promise((resolve, reject) => {
      if (staff) {
        resolve(staff);
      } else {
        reject("Failed to retreive staff from database");
      }
    });
  }

  async getStaff(id) {
    let irOrNull;
    try {
      irOrNull = await joi.validate(
        id,
        joi
        .string()
        .regex(assigneeIdRegExp)
        .required()
      );
    } catch (err) {
      throw new appErrors.InvalidArgError("Invalid staff id: " + id);
    }
    return await this.storage.getStaffById(irOrNull);
  }

  async insertStaff(model) {
    const validatedModel = await joi.validate(model, staffModelSchema);
    await this.storage.insertStaff(validatedModel)
    return validatedModel.id;
  }

  async updateStaff(id, staffModel) {
    const model = await joi.validate(staffModel, staffModelSchema);
    await this.storage.updateStaffById(id, model);
  }

}

module.exports = KhPosApplication;