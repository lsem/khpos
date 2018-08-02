const config = require('./config/index');
let PosterProxyService = require('./posterProxy');
let KhStorage = require('./KhStorage');
let KhPosApplication = require('./KhPosApplication');
let KhPosWebApplication = require('./KhPosWebApplication');
let KhStock = require('./KhStock')

class KhPosNodeApp {
  constructor(config) {
    this.config = config;
    this.posterProxy = new PosterProxyService();
    this.khStorage = new KhStorage(this.config.storage);
    this.khApp = new KhPosApplication(this.khStorage, this.posterProxy);
    this.khWebApp = new KhPosWebApplication(this.config.web, this.khApp);
    this.KhStock = new KhStock(this.config.stock);
    this.khStorage.onConnected(() => this.khApp.connectedToStorage())
  }

  initialize() {
    this.storage.initialize()
  }

  start() {
    this.khApp.start()
    this.khWebApp.start()
    this.khStorage.start()
    this.KhStockService.start();
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

var app = new KhPosNodeApp(config)
app.start()
