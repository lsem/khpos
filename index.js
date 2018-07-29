const express = require('express')

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

  tryConnectToPoster() {
    console.log('trying connect to poster ..')
    setTimeout(()=>{
      this.tryConnectToPoster()
    }, RECONNECT_TIMEOUT)
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
  constructor(){
    this.app = express()
    this.app.get('/', this.helloWorld )
    this.app.get('/stock', this.getStock )
    this.app.get('/plan', this.plan)
  }

  start() {
    this.app.listen(3000, () => console.log('Example app listening on port 3000!'))
  }

  helloWorld(req, res) {
    res.send('Hello World!')
  }

  getStock(req, res) {
    res.send({
    })
  }

  plan(req, res) {
    res.send({
    })
  }
}

/////////////////////////////////////////////////////////

class KultHlinaPOSApplicationService {
  constructor() {
    this.posterProxy = new PosterProxyService()
    this.kuktHliba = new KultHlibaPointOfSaleService()
    this.webApp = new KultHlibaWebApp()
    this.posterProxy.onConnectedToPoster(()=> this.kuktHliba.connectedToPoster())
    this.posterProxy.onDisconnectedToPoster(()=> this.kuktHliba.disconnectedToPoster())
  }

  start() {
    this.posterProxy.start()
    this.kuktHliba.start()
    this.webApp.start()
  }
}

var app = new KultHlinaPOSApplicationService()
app.start()


