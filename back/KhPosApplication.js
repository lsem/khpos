let debug = require('debug')('khapp');
let appErrors = require('./AppErrors')

class KhPosApplication {
  constructor(storage, posterProxyService) {
    this.storage = storage;
    this.posterProxyService = posterProxyService;
    this._storageConnected = false;
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

  async setPlan(fromDate, toDate, plan) {
    debug("fromDate: %o, toDate: %o, plan: %O", fromDate, toDate, plan);
    if (!this._storageConnected) {
      throw new appErrors.KhApplicationError("Storage error");
    }
    throw new appErrors.NotImplementedError('setPlan');
  }

  async updatePlan(fromDate, toDate, partialPlan) {
    throw new appErrors.NotImplementedError('updatePlan');
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
