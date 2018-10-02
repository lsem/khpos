import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { offline } from "@redux-offline/redux-offline";
import offlineConfig from "@redux-offline/redux-offline/lib/defaults";
import { Provider } from "react-redux";
import { composeWithDevTools } from "redux-devtools-extension/developmentOnly";
import reducer from "./reducers/index";
import axios from "axios";
import multi from "redux-multi";

const store = createStore(
  reducer,
  composeWithDevTools(
    applyMiddleware(thunk, multi),
    offline({ ...offlineConfig, effect: (effect, _action) => axios(effect), persist: false })
  )
);

ReactDOM.render(
  <Provider store={store}>
    <App/> 
  </Provider>,
  document.getElementById("root")
);

registerServiceWorker();
