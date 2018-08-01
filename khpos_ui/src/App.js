import React, { Component } from 'react';
import './App.css';
import axios from 'axios';

class Products extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    axios.get('http://localhost:5000/products')
    .then(json => console.log(json))
    .catch(err => console.log('failed fetching products: ' + err));
  }

  render() {
    return (
      <div className="Products">
        <p> Products rendered here </p>
      </div>
    )
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          {/* <img src={logo} className="App-logo" alt="logo" /> */}
          <h1 className="App-title">Welcome to KH POS</h1>
        </header>
        <Products/>
      </div>
    );
  }
}

export default App;
