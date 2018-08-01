const PosterAPI = require("./PosterAPI");
const axios     = require("axios");

class PosterProxyService {
  constructor() {
    this.posterAPI = new PosterAPI();
  }

  getStock(params, res, err) {
    axios.get(this.posterAPI.getStorageLeftoversRequest(params))
    .then(response => {
      res(response.data);
    })
    .catch(error => {
      err(error);
    });
  }

  getProducts(params, res, err) {
    axios.get(this.posterAPI.getProductsRequest(params))
    .then(response => {
      res(response.data);
    })
    .catch(error => {
      err(error);
    });
  }
}

module.exports = PosterProxyService;
