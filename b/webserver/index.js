const expressApp = require("./server");

module.exports = {
  async start() {
    process.nextTick(() => {
      const webServerPort = gConfig.server.port;
      expressApp.listen(webServerPort);
      console.log(`Server listening at port: ${webServerPort}`);
    });
  }
};
