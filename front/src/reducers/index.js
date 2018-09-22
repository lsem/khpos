import { combineReducers } from 'redux';
import plan from './plan';
import techMaps from './techMaps';
import staff from './staff';

export default combineReducers({
  plan,
  techMaps,
  staff
})