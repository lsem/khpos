const PosterAPI = require("./PosterAPI");
const axios     = require("axios");
var debug = require('debug')('khposterproxy');

class PosterProxyService {
  constructor() {
    this.posterAPI = new PosterAPI();
  }

  getStock(params, res, err) {
    axios.get(this.posterAPI.getStorageLeftoversRequest(params))
    .then(response => {
      debug("stock data: %o", response.data);
      res(response.data);
    })
    .catch(error => {
      err(error);
    });
  }

  getProducts(params, res, err) {
    axios.get(this.posterAPI.getProductsRequest(params))
    .then(response => {
      debug("products data: %o", response.data);
      res(response.data);
    })
    .catch(error => {
      err(error);
    });
  }
}

module.exports = PosterProxyService;
