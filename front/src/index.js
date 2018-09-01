import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
//import Sortable from 'Sortable';

ReactDOM.render(<App />, document.getElementById('root'));
//var el = document.getElementsByClassName('SchedulerTimeline');
// var sortable = Sortable.create(el[0]);
registerServiceWorker();
