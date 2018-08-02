// https://medium.com/@jinmatt/config-management-for-node-js-based-on-runtime-environment-variables-55b3c6d82f5c

const fs = require("fs");
const path = require("path");
var debug = require('debug')('khconfig');

const NODE_ENV = process.env.NODE_ENV;
let configBuffer = null;

switch (NODE_ENV) {
  case "prod": {
    debug('loading PROD env')
    configBuffer = fs.readFileSync(path.resolve(__dirname, "prod.json"), "utf-8");
    break;
  }
  case "dev": {
    debug('loading DEV env')
    configBuffer = fs.readFileSync(path.resolve(__dirname, "dev.json"), "utf-8");
    break;
  }
  default: {
    debug('loading DEFAULT env')
    configBuffer = fs.readFileSync(path.resolve(__dirname, "default.json"), "utf-8");
    break;
  }
}

function expandEnvVars(config) {
  for (var key in config) {
    if (config.hasOwnProperty(key)) {
      if (typeof config[key] === "string") {
        if (config[key].startsWith("$")) {
          const varName = config[key].slice(1);
          if (process.env[varName]) {
            config[key] = process.env[varName];
          } else {
            throw new Error(`expand: No var for variable: ${varName}`);
          }
        }
      } else if (typeof (config[key] === "object")) {
        expandEnvVars(config[key]);
      }
    }
  }
  return config;
}
// WARNING: do not log config after expaning.
debug("effective config: %O", JSON.parse(configBuffer));

let config = expandEnvVars(JSON.parse(configBuffer));
module.exports = config;
