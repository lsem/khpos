import { combineReducers } from 'redux';
import techMapsTimeLine from './techMapsTimeLine';
import techMapTasks from './techMapTasks';

export default combineReducers({
  techMapsTimeLine,
  techMapTasks
})