const config = require('./config/index.js');
let StorageService = require('./storage.js');
let PosterProxyService = require('./posterProxy.js');
let KultHlibaPointOfSaleService = require('./kutHlibaPointOfSale.js');
let KultHlibaWebApp = require('./kultHlibaWebApp.js');

class KultHlinaPOSApplicationService {
  constructor(config) {
    this.config = config
    this.posterProxy = new PosterProxyService()
    this.kuktHliba = new KultHlibaPointOfSaleService()
    this.webApp = new KultHlibaWebApp(this.config.web)
    this.storage = new StorageService(this.config.storage)
    this.posterProxy.onConnectedToPoster(() => this.kuktHliba.connectedToPoster())
    this.posterProxy.onDisconnectedToPoster(() => this.kuktHliba.disconnectedToPoster())
  }

  initialize() {
    this.storage.initialize()
  }

  start() {
    this.posterProxy.start()
    this.kuktHliba.start()
    this.webApp.start()
    this.storage.start()
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
