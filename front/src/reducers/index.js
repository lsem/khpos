import { combineReducers } from 'redux';
import plan from './plan';
import techMaps from './techMaps';

export default combineReducers({
  plan,
  techMaps
})