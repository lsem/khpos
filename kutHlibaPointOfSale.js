

class KultHlibaPointOfSaleService {
  constructor(storage, posterProxyService) {
    this.storage = storage;
    this.posterProxyService = posterProxyService;
  }

  connectedToStorage() {
    console.log("kh: Connected to Storage");
    (async () => {
      await this.storage.planItem();
      console.log("kh: planned something");
    })();
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

  async getPlan() {
    return await this.storage.getPlan();
  }
}

module.exports = KultHlibaPointOfSaleService;
