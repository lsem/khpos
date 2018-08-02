const config = require("./config/index.js");

class PosterAPI {
  getStorageLeftoversRequest(params) {
    let result = `${config.poster.apiLink}/storage.getStorageLeftovers?token=${
      config.poster.securityToken
    }`;
    if (params) {
      if (params.storageId) result += `&storage_id=${params.storageId}`;
      if (params.pTypeId) result += `&type=${params.pTypeId}`;
      if (params.categoryId) result += `&category_id=${params.categoryId}`;
      if (params.zeroLeftowers) result += `&zero_leftovers=${params.zeroLeftowers}`;
    }
    return result;
  }

  getProductsRequest(params) {
    let result = `${config.poster.apiLink}/menu.getProducts?token=${
      config.poster.securityToken
    }`;

    if (params) {
      if (params.pTypeId) result += `&type=${params.pTypeId}`;
      if (params.categoryId) result += `&category_id=${params.categoryId}`;
    }

    return result;
  }
}
module.exports = PosterAPI;
