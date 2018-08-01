class KultHlibaPointOfSaleService {
  constructor(storage) {
    this.storage = storage;
  }

  connectedToStorage() {
    console.log("kh: Connected to Storage");
    (async () => {
      await this.storage.planItem();
      console.log("kh: planned something");
    })();
  }

  start() {}

  async getPlan() {
    console.log("kh: requested plan");
    return await this.storage.getPlan();
  }
}

module.exports = KultHlibaPointOfSaleService;
