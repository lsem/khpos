import { combineReducers } from 'redux';
import techMapsTimeLine from './techMapsTimeLine';
import techMapRegistry from './techMapRegistry';

export default combineReducers({
  techMapsTimeLine,
  techMapRegistry
})