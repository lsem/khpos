// https://code.tutsplus.com/tutorials/introduction-to-api-calls-with-react-and-axios--cms-21027

import React, { Component } from "react";
import "./App.css";
import axios from "axios";
import HTML5Backend from "react-dnd-html5-backend";
import { DragDropContext } from "react-dnd";
import TimelineScreen from './components/TimeLineScreen';

function ProductListItem(props) {
  return (
    <li className="ProductListItem">
      {props.name} ({props.category_name}) -- {props.cost}₴{" "}
    </li>
  );
}

class ProductList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: []
    };
  }

  fetchProducts() {
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
      .then(products => this.setState({ products: products }))
      .catch(err => console.log("failed fetching products: " + err));
  }

  refreshProductsAfter(after) {
    setTimeout(() => {
      this.fetchProducts();
      this.refreshProductsAfter(after);
    }, after);
  }

  componentDidMount() {
    this.fetchProducts();
    this.refreshProductsAfter(5000);
  }

  render() {
    const productItems = this.state.products.map(product => (
      <ProductListItem
        name={product.name}
        category_name={product.category_name}
        cost={product.cost}
        key={product.id}
      />
    ));
    return (
      <div className="ProductList">
        <h1>Продукти</h1>
        <ul> {productItems} </ul>
      </div>
    );
  }
}

class Api {
  getStock(dataCb, errCb) {
    axios
      .get("http://localhost:5000/stock")
      // .then(
      //   json => json.data.response.map(result => console.log(result))
      //   // json.data.response.map(result => ({
      //   //   id: result.product_id,
      //   //   name: result.product_name,
      //   //   category_name: result.category_name,
      //   //   category_id: result.menu_category_id,
      //   //   cost: result.cost
      //   // }))
      // )
      .then(products => dataCb(products))
      .catch(err => errCb(err));
  }
}

class StockList extends Component {
  componentDidMount() {
    new Api().getStock(
      data => {
        console.log("Got stock");
      },
      err => {
        console.log("Cannot get stock");
      }
    );
  }

  render() {
    return (
      <div className="StockList">
        <h1>Наявність</h1>
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Культ Хліба</h1>
        </header>
        <div className="AppBody">
          {/* <ProductList />
          <StockList /> */}
          <h1 className="TimelineH1"> Timeline </h1>
          <TimelineScreen />
        </div>
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(App);
