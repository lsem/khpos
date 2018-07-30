// https://medium.com/@jinmatt/config-management-for-node-js-based-on-runtime-environment-variables-55b3c6d82f5c

const fs = require('fs');
const path = require('path');
const NODE_ENV = process.env.NODE_ENV;
let configBuffer = null;

switch (NODE_ENV) {
  case 'prod': {
    configBuffer = fs.readFileSync(path.resolve(__dirname, 'prod.json'), 'utf-8');
    break;
  }
  case 'dev': {
    configBuffer = fs.readFileSync(path.resolve(__dirname, 'dev.json'), 'utf-8');
    break;
  }
  default: {
    configBuffer = fs.readFileSync(path.resolve(__dirname, 'default.json'), 'utf-8');
    break;
  }
}

let config = JSON.parse(configBuffer);
module.exports = config;

