import * as actionTypes from "../actions/types";

const initialState = [];

export default function techMapsReducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.TECHMAPS_REQUEST_SUCCEEDED:
      return action.payload;

    default: return state;
  }
}
