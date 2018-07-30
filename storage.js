const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const STATE_CONNECTED = 'state-connected';
const STATE_DISCONNECTED = 'state-disconnected';

class StorageService {
  constructor(config) {
    this.port = config.port;
    this.state = STATE_DISCONNECTED;
    console.log('storage: mongo port: ' + this.mongoPort)
  }

  start() {
    this._initiateConnect();
  }

  planItem() {
  }

  getPlan() {
  }

  initialize() {
    console.log('storage: Initialized');
  }

  _initiateConnect() {
    console.log('_initiateConnect');
    const url = 'mongodb://localhost:' + this.port + '/myproject';
    const dbName = 'myproject';
    console.log('storage: url: ' + url)
    this.client = MongoClient.connect(url, (err, db) => {
      if (!err && db) {
        console.log('storage: connected to mongo: ' + JSON.stringify(db))
        this.state = STATE_CONNECTED;
      } else {
        console.log('storage: error connection to mongo')
        setTimeout(() => this._initiateConnect(), 1000);
      }
    });
  }
}


module.exports = StorageService;