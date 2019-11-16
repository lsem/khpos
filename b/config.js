const _ = require("lodash");

const config = require("./config.json");

function loadConfig() {
  const defaultConfig = config.dev;
  const environment = process.env.NODE_ENV || "dev";
  const environmentConfig = config[environment];
  const mergedConfig = _.merge(defaultConfig, environmentConfig);
  mergedConfig.storage.uri = `mongodb://${mergedConfig.storage.host}:${mergedConfig.storage.port}/${mergedConfig.storage.dbName}`;
  const finalConfig = mergedConfig;

  // by convention global variable names should always begin with g
  global.gConfig = finalConfig;
}

module.exports = loadConfig;
