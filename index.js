const config = require('./config/index');
let StorageService = require('./storage');
let PosterProxyService = require('./posterProxy');
let KultHlibaPointOfSaleService = require('./kutHlibaPointOfSale');
let KultHlibaWebApp = require('./kultHlibaWebApp');
let StockService = require('./StockService')

class KultHlinaPOSApplicationService {
  constructor(config) {
    this.config = config
    this.posterProxy = new PosterProxyService();
    this.storage = new StorageService(this.config.storage);
    this.kultHliba = new KultHlibaPointOfSaleService(this.storage, this.posterProxy);
    this.webApp = new KultHlibaWebApp(this.config.web, this.kultHliba);
    this.stockService = new StockService(this.config.stock);
    this.storage.onConnected(() => this.kultHliba.connectedToStorage())
  }

  initialize() {
    this.storage.initialize()
  }

  start() {
    this.kultHliba.start()
    this.webApp.start()
    this.storage.start()
    this.stockService.start();
  }
}

/////////////////////////////////////////////////////////

function parseCommandOrDie(args) {
  if (args.length == 0) {
    return null;
  } else if (args[0] === '--init') {
    return 'init';
  } else {
    console.log('Unrecognized options: ' + JSON.stringify(args) + '. Exitting.')
    process.exit(1)
  }
  return null;
}

switch (parseCommandOrDie(process.argv.slice(2))) {
  case 'init': {
    console.log('recognized command: init')
    var app = new KultHlinaPOSApplicationService(config)
    app.initialize()
    console.log('Initialized. Exiting..')
    return;
  }
}

var app = new KultHlinaPOSApplicationService(config)
app.start()
