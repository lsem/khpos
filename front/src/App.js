// https://code.tutsplus.com/tutorials/introduction-to-api-calls-with-react-and-axios--cms-21027

import React, { Component } from "react";
import { BrowserRouter, Route, Redirect, Switch } from "react-router-dom";
import "./App.css";
import axios from "axios";
import HTML5Backend from "react-dnd-html5-backend";
import { DragDropContext } from "react-dnd";
import TimelineScreen from "./components/PlanScreen";
import moment from "moment";
import "moment/locale/uk";
import ReactSwitch from "react-switch";
import { setApiMode } from "./api";
import { ROUTES } from "./constants/routes";
import TechMapEditor from "./components/TechMapEditor";

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
  constructor(props) {
    super(props);
    moment.locale("uk");
    this.state = { inMem: false };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(checked) {
    setApiMode(checked);
    this.setState({ inMem: checked });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Культ Хліба</h1>
          <ReactSwitch
            onChange={this.handleChange}
            checked={this.state.inMem}
            onHandleColor="#2693e6"
            handleDiameter={20}
            uncheckedIcon={false}
            checkedIcon={false}
            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
            activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
            height={20}
            width={48}
            className="inmem-switch"
            id="material-switch"
          />
        </header>
        <BrowserRouter>
          <div className="AppBody">
            <Switch>
              <Route
                path={ROUTES.PLAN_SCREEN}
                exact
                component={() => (
                  <TimelineScreen
                    pixelsPerMinute={2}
                    // inMem used as a key since whenever it changes,
                    // components receive componentDidMount and can reload
                    // data from new endpoint
                    key={this.state.inMem}
                  />
                )}
              />
              <Route
                path={`${ROUTES.EDIT_TECH_MAP}/:id`}
                exact
                component={TechMapEditor}
              />
              <Redirect from="/" exact to={ROUTES.PLAN_SCREEN} />
              <Route component={() => "NOT FOUND"} />
            </Switch>
          </div>
        </BrowserRouter>
        {/* <ProductList />
        <StockList /> */}
      </div>
    );
  }
}
export default DragDropContext(HTML5Backend)(App);
