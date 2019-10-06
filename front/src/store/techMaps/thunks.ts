import { ActionCreator } from "redux";
import { techMapsRequestSucceeded, techMapsRequest } from "./actions";
import { ThunkAction } from "redux-thunk";
import { TechMapsActionTypes } from "./types";
import { AppState } from "..";
import TechMap from "../../models/techMaps/techMap";
import { getApi } from "../../api";

const techMapParserReviever: any = (key: string, value: any) => {
  if (typeof value === "object" && value !== null) {
    if (key === "countByUnits") {
      const map = new Map();
      Object.keys(value).forEach(key => {
        map.set(+key, value[key]);
      });
      return map;
    }
  }
  return value;
};

const techMapParserReplacer: any = (key: string, value: any) => {
  if (key === "countByUnits") {
    const o: { [k: string]: any } = {};

    for (let e of value.entries()) o[e[0]] = e[1];

    return o;
  } else {
    return value;
  }
};

export const thunkRequestTechMaps: ActionCreator<
  ThunkAction<
    Promise<void>, // The type of function return
    AppState, // The type of global state
    null, // The type of the thunk parameter
    TechMapsActionTypes // The type of the last action to be dispatched
  >
> = () => {
  return async dispatch => {
    dispatch(techMapsRequest());
    fetch(`${getApi()}/techMaps`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json;charset=UTF-8"
      }
    })
      .then(res => res.text())
      .then(raw => {
        const data = JSON.parse(raw, techMapParserReviever);
        dispatch(techMapsRequestSucceeded(data as Array<TechMap>));
      })
      .catch(error => console.error(error));
  };
};
