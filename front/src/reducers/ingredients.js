import * as actionTypes from "../actions/types";

const initialState = [];

export default function ingredientsReducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.INGREDIENTS_REQUEST_SUCCEEDED: {
      return action.payload;
    }
    default: return state;
  }
}