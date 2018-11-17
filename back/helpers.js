const uuid = require('uuid');

module.exports = {
  generatePrefixedId: (prefix) => {
    return `${prefix}-${uuid.v4()}`
  }
}