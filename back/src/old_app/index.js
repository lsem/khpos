const config = require('../../config/index');
let PosterProxyService = require('./posterProxy');
let KhStorage = require('./KhStorage');
let InMemStorage = require('./InMemStorage');
let KhPosApplication = require('./KhPosApplication');
let KhPosWebApplication = require('./KhPosWebApplication');
let KhStock = require('./KhStock')


class KhPosNodeApp {
  constructor(config) {
    this.config = config;
    this.posterProxy = new PosterProxyService();
    this.khStorage = new KhStorage(this.config.storage);
    this.khApp = new KhPosApplication({
      storage: this.khStorage,
      posterProxy: this.posterProxy
    });
    this.inMemStorage = new InMemStorage();
    this.khInMemApp = new KhPosApplication({
      storage: this.inMemStorage,
      posterProxy: this.posterProxy
    });
    this.khWebApp = new KhPosWebApplication(this.config.web, this.khApp, this.khInMemApp);
    this.KhStock = new KhStock(this.config.stock);
  }

  start() {
    this.khApp.start()
    this.khWebApp.start()
    this.khStorage.start()
    this.inMemStorage.start()
    this.KhStock.start();
  }
}

/////////////////////////////////////////////////////////

function parseCommandOrDie(args) {
  if (args.length == 0) {
    return null;
  } else if (args[0] === '--init') {
    return 'init';
  } else {
    console.error('Unrecognized options: %o. Exiting', args);
    process.exit(1)
  }
  return null;
}

switch (parseCommandOrDie(process.argv.slice(2))) {
  case 'init':
    {
      debug('recognized command: init')
      debug('Initialized. Exiting..');
      return;
    }
}

var app = new KhPosNodeApp(config)
app.start()

exports.closeServer = function() {
  app.close();
};
