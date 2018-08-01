import React, { Component } from 'react';
import './App.css';
import axios from 'axios';

class Products extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: []
    };
  }

  componentDidMount() {
    axios.get('http://localhost:5000/products')
    .then(json => json.data.response.map(result => (
      {
        name: result.product_name
      })))
    .then(products => {
      this.setState({products: products})
    })
    .catch(err => console.log('failed fetching products: ' + err));
  }

  render() {
    const productItems = this.state.products.map((product) =>
      <li> {product.name} </li>
    );
    return (
      <div className="Products">
        <p> Products rendered here ({this.state.products.length} items) </p>
        <ul> {productItems} </ul>
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
