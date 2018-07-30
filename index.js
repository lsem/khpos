const express = require('express');

const config = require('./config/index.js');

STATE_CONNECTED = 'connected';
STATE_NOTCONNECTED = 'not-connected';
RECONNECT_TIMEOUT = 5000

//////////////////////////////////////////////////////////////////

class PosterProxyService {
  constructor() {
    this.onDisconnectedToPosterCb = null
    this.onConnectedToPosterCb = null
    this.connectionState = STATE_NOTCONNECTED
    this.reconnectRetries = 0
  }

  onConnectedToPoster(cb) {
    this.onConnectedToPosterCb = cb
  }

  onDisconnectedToPoster(cb) {
    this.onDisconnectedToPosterCb = cb
  }

  initiateConnect() {
  }

  scheduleConnectIfNeeded() {
    console.log('posproxy: reconnect')
    setTimeout(() => {
      this.initiateConnect()
      this.reconnectRetries += 1
      if (this.reconnectRetries === 5) {
        this.onConnectedToPosterCb()
        this.reconnectRetries = 0
      } else {
        this.scheduleConnectIfNeeded()
      }
    }, 1000)
  }

  start() {
    this.scheduleConnectIfNeeded()
  }
}

//////////////////////////////////////////////////////////////////

class KultHlibaPointOfSaleService {
  constructor() {
    var expressHttp = express()
  }

  connectedToPoster() {
    console.log('kh: Connected to Poster')
  }

  disconnectedFromPoster() {
    console.log('kh: Disconnected from Poster')
  }

  start() {
  }

}

/////////////////////////////////////////////////////////

class KultHlibaWebApp {
  constructor(config) {
    this.listeningPort = config.server.port
    this.app = express()
    this.app.get('/', this.getStock)
    this.app.get('/stock', this.getStock)
    this.app.get('/plan', this.getPlan)
  }

  start() {
    this.app.listen(this.listeningPort, () => console.log('Example app listening on port 3000!'))
  }

  getStock(req, res) {
    res.send({
    })
  }

  getPlan(req, res) {
    res.send({
    })
  }
}

/////////////////////////////////////////////////////////

class StorageService {
  constructor() {
  }

  start() {
  }

  planItem() {
  }

  getPlan() {
  }
}

/////////////////////////////////////////////////////////

class KultHlinaPOSApplicationService {
  constructor(config) {
    this.config = config
    this.posterProxy = new PosterProxyService()
    this.kuktHliba = new KultHlibaPointOfSaleService()
    this.webApp = new KultHlibaWebApp(this.config)
    this.storage = new StorageService()
    this.posterProxy.onConnectedToPoster(() => this.kuktHliba.connectedToPoster())
    this.posterProxy.onDisconnectedToPoster(() => this.kuktHliba.disconnectedToPoster())
  }

  start() {
    this.posterProxy.start()
    this.kuktHliba.start()
    this.webApp.start()
    this.storage.start()
  }
}

/////////////////////////////////////////////////////////

var app = new KultHlinaPOSApplicationService(config)
app.start()


