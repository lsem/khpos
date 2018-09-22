import { STAFF_REQUEST_SUCCEEDED } from "../actions/types";

const initialState = [];


export default function staff(state = initialState, action) {
  switch (action.type) {
    case STAFF_REQUEST_SUCCEEDED: return action.staff;
    default:
      return state
  }
}
