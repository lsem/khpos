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

  onConnected(cb) {
    this.onConnectedCb = cb;
  }

  start() {
    this._initiateConnect();
  }

  async planItem() {
    return await this.db.collection('plan').insertOne({
      'bread': 1
    });
  }

  async getPlan() {
    return await this.db.collection('plan').find({}, {fields:{_id: 0}}).toArray();
  }

  initialize() {
    console.log('storage: Initialized');
  }

  _initiateConnect() {
    console.log('_initiateConnect');
    // todo: http://mongodb.github.io/node-mongodb-native/3.1/reference/connecting/connection-settings/
    const url = 'mongodb://localhost:' + this.port + '/myproject?connectTimeoutMS=1000';
    console.log('storage: url: ' + url)
    MongoClient.connect(url, (err, client) => {
      if (!err && client) {
        console.log('storage: connected to mongo')
        this.state = STATE_CONNECTED;
        client.on('close', () => this.handleClose());
        client.on('authenticated', () => this.handleAuthenticated());
        client.on('error', () => this.handleError());
        client.on('reconnect', () => this.handleReconnect());
        client.on('timeout', () => this.handleTimeout());
        let db = client.db("mydb");
        if (db) {
          this.db = db;
          this.onConnectedCb();
        }
        this.client = client;
      } else {
        console.log('storage: error connection to mongo')
        setTimeout(() => this._initiateConnect(), 1000);
      }
    });
  }

  handleClose() {
    console.log('storage: connection closed, reconnecting..');
    this._initiateConnect();
  }

  handleAuthenticated() {
    console.log('storage: authenticated');
  }

  handleReconnect() {
    console.log('storage: reconnect');
  }

  handleTimeout() {
    console.log('storage: timeout');
  }
}


module.exports = StorageService;