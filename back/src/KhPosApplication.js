let debug = require("debug")("khapp");
let appErrors = require("./AppErrors");
const joi = require("joi");
const moment = require("moment");
const _ = require("lodash");

//#region Joi Validation Schemas
const uuidRegExp = tag =>
  `^${tag}-[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`;
const jobIdRegExp = new RegExp(uuidRegExp("JOB"), "i");
const techMapIdRegExp = new RegExp(uuidRegExp("TM"), "i");
const stepIdRegExp = new RegExp(uuidRegExp("STP"), "i");
const employeeIdRegExp = new RegExp(uuidRegExp("EMP"), "i");
const ingredientIdRegExp = new RegExp(uuidRegExp("ING"), "i");
const inventoryIdRegExp = new RegExp(uuidRegExp("INV"), "i");

const techMapStepSchema = joi.object().keys({
  id: joi
    .string()
    .regex(stepIdRegExp)
    .required(),
  name: joi.string().required(),
  ingredients: joi.array().required(),
  humanResources: joi.array(),
  timeNorms: joi.object(),
  inventory: joi.array().required(),
  instructions: joi.string()
}).xor("humanResources", "timeNorms");

const techMapSchema = joi.object().keys({
  id: joi
    .string()
    .regex(techMapIdRegExp)
    .required(),
  name: joi.string().required(),
  units: joi.array().required(),
  steps: joi
    .array()
    .items(techMapStepSchema)
    .required(),
  version: joi.number(),
  isHead: joi.boolean()
});

const techMapPointerSchema = joi.object().keys({
  id: joi
    .string()
    .regex(techMapIdRegExp)
    .required(),
  version: joi.number()
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
  techMap: techMapPointerSchema.required(),
  productionQuantity: joi
    .number()
    .integer()
    .min(1)
    .required(),
  employeesQuantity: joi
    .number()
    .integer()
    .min(1)
    .required(),
  stepAssignments: joi.array().items(
    joi.object().keys({
      employeeId: joi
        .string()
        .regex(employeeIdRegExp)
        .required(),
      stepId: joi
        .string()
        .regex(stepIdRegExp)
        .required()
    })
  )
});

const employeeModelSchema = joi.object().keys({
  id: joi
    .string()
    .regex(employeeIdRegExp)
    .required(),
  firstName: joi.string().required(),
  color: joi.string().required()
});

const ingredientSchema = joi.object().keys({
  id: joi
    .string()
    .regex(ingredientIdRegExp)
    .required(),
  name: joi.string().required(),
  units: joi.string().required()
});

const inventorySchema = joi.object().keys({
  id: joi
    .string()
    .regex(inventoryIdRegExp)
    .required(),
  name: joi.string().required(),
  units: joi.string().required()
});
//#endregion

class KhPosApplication {
  //#region Internals
  constructor(deps) {
    if (!deps.storage) throw new Error("No storage");
    if (!deps.posterProxy) throw new Error("No posterProxy");
    this.storage = deps.storage;
    this.posterProxyService = deps.posterProxy;
    this._storageConnected = false;
    this.onErrorCb = err => debug("Default error handler: %o", err);
    this.storage.on("connected", () => this.connectedToStorage());
    this.storage.on("disconnected", () => this.disconnectedFromStorge());
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
  //#endregion

  //#region Products
  async getProducts() {
    return new Promise((resolve, reject) => {
      this.posterProxyService.getProducts(
        null,
        data => resolve(data),
        error => reject(error)
      );
    });
  }
  //#endregion

  //#region Stock
  async getStock() {
    return new Promise((resolve, reject) => {
      this.posterProxyService.getStock(
        null,
        data => resolve(data),
        error => reject(error)
      );
    });
  }
  //#endregion

  //#region Jobs
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
  //#endregion

  //#region Techmaps
  async getTechMapsHeads() {
    const all = await this.storage.getTechMaps();
    const heads = all.map(t => _.last(t.versions));
    return heads;
  }

  async getTechMapAllVersions(id) {
    return (await this.storage.getTechMap(id)).versions;
  }

  async getTechMapHead(id) {
    const tm = await this.storage.getTechMap(id);
    return _.last(tm.versions);
  }

  async getTechMapSpecificVersion(id, version) {
    const tm = await this.storage.getTechMap(id);
    return tm.versions[+version];
  }

  async insertTechMap(techMap) {
    try {
      await joi.validate(techMap, techMapSchema);
    } catch (err) {
      throw new appErrors.InvalidModelError(techMap);
    }
    await this.storage.insertTechMap({
      id: techMap.id,
      versions: [{ ...techMap, version: 0 }]
    });
    return techMap.id;
  }

  async updateTechMap(id, techMap) {
    if (id !== techMap.id) {
      throw new appErrors.BadRequestError(
        `Specified id param (${id}) differs from actual id field (${techMap.id})`
      );
    }

    try {
      await joi.validate(techMap, techMapSchema);
    } catch (err) {
      throw new appErrors.InvalidModelError(techMap);
    }

    await this.storage.updateTechMap(id, tm => {
      const head = _.last(tm.versions);
      if (_.isEqual(techMap, head)) {
        throw new appErrors.UnmodifiedPutError(`attempt to put unmodified techMap ${id}`);
      }
      return {
        ...tm,
        versions: [...tm.versions, { ...techMap, version: head.version + 1 }]
      };
    });
  }
  //#endregion

  //#region Employees
  async getEmployeesCollection() {
    const employees = this.storage.getAllEmployees();
    return new Promise((resolve, reject) => {
      if (employees) {
        resolve(employees);
      } else {
        reject("Failed to retreive employees from database");
      }
    });
  }

  async getEmployee(id) {
    let irOrNull;
    try {
      irOrNull = await joi.validate(
        id,
        joi
          .string()
          .regex(employeeIdRegExp)
          .required()
      );
    } catch (err) {
      throw new appErrors.InvalidArgError("Invalid staff id: " + id);
    }
    return await this.storage.getEmployeeById(irOrNull);
  }

  async insertEmployee(employee) {
    const validatedModel = await joi.validate(employee, employeeModelSchema);
    await this.storage.insertEmployee(validatedModel);
    return validatedModel.id;
  }

  async updateEmployee(id, employee) {
    const validatedModel = await joi.validate(employee, employeeModelSchema);
    await this.storage.updateEmployeeById(id, validatedModel);
  }
  //#endregion

  //#region Ingridients
  async getIngredientsCollection() {
    return await this.storage.getIngredients();
  }

  async getIngredient(id) {
    let idOrNull;
    try {
      idOrNull = await joi.validate(
        id,
        joi
          .string()
          .regex(ingredientIdRegExp)
          .required()
      );
    } catch (err) {
      throw new appErrors.InvalidArgError("Invalid ingredient id: " + id);
    }
    return await this.storage.getIngredient(idOrNull);
  }

  async insertIngredient(ingredient) {
    const validatedModel = await joi.validate(ingredient, ingredientSchema);
    await this.storage.insertIngredient(validatedModel);
    return validatedModel.id;
  }
  //#endregion

  //#region Inventory
  async getInventoryCollection() {
    return await this.storage.getInventory();
  }

  async getDevice(id) {
    let idOrNull;
    try {
      idOrNull = await joi.validate(
        id,
        joi
          .string()
          .regex(inventoryIdRegExp)
          .required()
      );
    } catch (err) {
      throw new appErrors.InvalidArgError("Invalid device id: " + id);
    }
    return await this.storage.getDevice(idOrNull);
  }

  async insertDevice(device) {
    const validatedModel = await joi.validate(device, inventorySchema);
    await this.storage.insertDevice(validatedModel);
    return validatedModel.id;
  }
  //#endregion
}

module.exports = KhPosApplication;
