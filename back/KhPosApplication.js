let debug = require('debug')('khapp');
let appErrors = require('./AppErrors')

class KhPosApplication {
  constructor(storage, posterProxyService) {
    this.storage = storage;
    this.posterProxyService = posterProxyService;
  }

  connectedToStorage() {
    debug("Connected to Storage");
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

  async getPlan(fromDate, toDate) {
    throw new appErrors.NotImplementedError('getPlan');
    return await this.storage.getPlan();
  }
  async setPlan(fromDate, toDate, plan) {
    debug("fromDate: %o, toDate: %o, plan: %O", fromDate, toDate, plan);
    throw new appErrors.NotImplementedError('setPlan');
  }
  async updatePlan(fromDate, toDate, partialPlan) {
    throw new appErrors.NotImplementedError('updatePlan');
  }
}

module.exports = KhPosApplication;
