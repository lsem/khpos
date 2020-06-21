import ky from "ky";

const eventHandlers = {};

const emit = (event, data) => {
  eventHandlers[event] && eventHandlers[event].forEach((cb) => cb(data));
};

const api = ky.extend({
  prefixUrl: "http://localhost:5500",
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  },
  hooks: {
    beforeRequest: [
      (request) => {
        const url = new URL(request.url);
        if (url.pathname !== "/users/login") {
          const authInfo = JSON.parse(localStorage.getItem("auth-info"));
          if (authInfo) {
            request.headers.set("Authorization", authInfo.token);
          }
        }
      },
    ],
    afterResponse: [
      (_request, _options, response) => {
        if (response.status === 401) {
          emit("401", response);
        }
        return response;
      },
    ],
  },
});

api.on = (event, cb) => {
  if (!eventHandlers[event]) eventHandlers[event] = [];
  eventHandlers[event].push(cb);
};

export default api;
