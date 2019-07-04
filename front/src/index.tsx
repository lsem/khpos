import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import { offline } from "@redux-offline/redux-offline";
import offlineConfig from "@redux-offline/redux-offline/lib/defaults";
import { Provider } from "react-redux";
import { rootReducer } from "./store/index";
import axios from "axios";

const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(rootReducer, composeEnhancers(
    applyMiddleware(thunk),
    offline({ ...offlineConfig, effect: (effect, _action) => axios(effect), persist: (false as any)})
  )
);

ReactDOM.render(
  <Provider store={store}>
    <App/> 
  </Provider>,
  document.getElementById("root")
);

registerServiceWorker();
