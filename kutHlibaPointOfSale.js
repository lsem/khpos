class KultHlibaPointOfSaleService {
  constructor(storage) {
    this.storage = storage;
  }

  connectedToPoster() {
    console.log('kh: Connected to Poster')
  }

  connectedToStorage() {
    console.log('kh: Connected to Storage');
    (async () => {
      await this.storage.planItem();
      console.log('kh: planned something');
    })();
  }

  disconnectedFromPoster() {
    console.log('kh: Disconnected from Poster')
  }

  start() {
  }

}


module.exports = KultHlibaPointOfSaleService;