const loadConfig = require("./config");
const storage = require("./storage");
const server = require("./webserver");

(async () => {
  try {
    loadConfig();

    await storage.start();
    await server.start();
  } catch (e) {
    console.error("Failed to start application:");
    console.error(e);
  }
})();
