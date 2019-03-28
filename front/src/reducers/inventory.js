import * as actionTypes from "../actions/types";

const initialState = [];

export default function inventoryReducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.INVENTORY_REQUEST_SUCCEEDED: {
      return action.payload;
    }
    default: return state;
  }
}