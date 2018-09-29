let apiEndpoint;

function setApiMode(inMem) {
  if (inMem) {
    apiEndpoint = "http://localhost:5000/inmem";
  } else {
    apiEndpoint = "http://localhost:5000";
  }
}

function getApi() {
  return apiEndpoint;
}

setApiMode(false);

export { setApiMode, getApi };
