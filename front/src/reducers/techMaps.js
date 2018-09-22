import { TECHMAPS_REQUEST_SUCCEEDED } from "../actions/types";

const initialState = [];


export default function techMaps(state = initialState, action) {
  switch (action.type) {
    case TECHMAPS_REQUEST_SUCCEEDED: return action.techMaps;
    default:
      return state
  }
}
