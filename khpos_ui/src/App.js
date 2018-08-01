import React, { Component } from "react";
import "./App.css";
import axios from "axios";

function ProductListItem(props) {
  return (
    <li className="ProductListItem">
      {props.name} ({props.category_name}) -- {props.cost}₴{" "}
    </li>
  );
}

class Products extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: []
    };
  }

  componentDidMount() {
    axios
      .get("http://localhost:5000/products")
      .then(json =>
        json.data.response.map(result => ({
          id: result.product_id,
          name: result.product_name,
          category_name: result.category_name,
          category_id: result.menu_category_id,
          cost: result.cost
        }))
      )
      .then(products => {
        this.setState({ products: products });
      })
      .catch(err => console.log("failed fetching products: " + err));
  }

  render() {
    const productItems = this.state.products.map(product => (
      <ProductListItem
        name={product.name}
        category_name={product.category_name}
        cost={product.cost}
      />
    ));
    return (
      <div className="Products">
        <p> Продукти ({this.state.products.length} одиниць): </p>
        <ul> {productItems} </ul>
      </div>
    );
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
        <Products />
      </div>
    );
  }
}

export default App;
