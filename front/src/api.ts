let apiEndpoint: string;

function setApiMode(inMem: boolean) {
  if (inMem) {
    apiEndpoint = "http://localhost:5000/inmem";
  } else {
    apiEndpoint = "http://localhost:5000";
  }
}

function getApi(): string {
  return apiEndpoint;
}

setApiMode(false);

export { setApiMode, getApi };
