// https://code.tutsplus.com/tutorials/introduction-to-api-calls-with-react-and-axios--cms-21027

import React, { Component } from "react";
import "./App.css";
import axios from "axios";
import autoLayout from "./layout";

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
      .then(
        json => json.data.response.map(result => console.log(result))
        // json.data.response.map(result => ({
        //   id: result.product_id,
        //   name: result.product_name,
        //   category_name: result.category_name,
        //   category_id: result.menu_category_id,
        //   cost: result.cost
        // }))
      )
      .then(products => dataCb(products))
      .catch(err => errCb(err));
  }
}

class StockList extends Component {
  constructor(props) {
    super(props);
  }

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

class TechMapView extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const techMapStyle = {
      width: this.props.width + "px",
      height: this.props.height + "px",
      backgroundColor: this.props.tintColor,
      left: this.props.left + "px",
      top: this.props.top + "px"
    };
    return (
      <div className="TechMapView" style={techMapStyle}>
        {this.props.title}
      </div>
    );
  }
}

class SchedulerTimeline extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jobs: [
        {
          title: "1",
          tintColor: "rgb(216, 216, 216)",
          durationHours: 2.5,
          startTime: Date.parse("01 Jan 1970 00:00:00 GMT")
        },
        {
          title: "2",
          tintColor: "rgb(216, 216, 216)",
          durationHours: 1.5,
          startTime: Date.parse("01 Jan 1970 02:00:00 GMT")
        },
        {
          title: "3",
          tintColor: "rgb(216, 216, 216)",
          durationHours: 3.5,
          startTime: Date.parse("01 Jan 1970 01:00:00 GMT")
        },
        {
          title: "4",
          tintColor: "rgb(216, 216, 216)",
          durationHours: 0.7,
          startTime: Date.parse("01 Jan 1970 1:30:00 GMT")
        },
        {
          title: "5",
          tintColor: "rgb(216, 216, 216)",
          durationHours: 0.7,
          startTime: Date.parse("01 Jan 1970 6:30:00 GMT")
        }
      ]
    };
  }

  render() {
    const heightFor = j => {
      return j.durationHours * this.props.durationScalingFator;
    };

    const items = [
      {
        vOffset: 100,// (starts at 100)
        vHeight: 900 // (ends at 1000)
      },
      {
        vOffset: 400,// (starts at 400)
        vHeight: 300 // (ends at 700)
      },
      {
        vOffset: 200,// (starts at 200)
        vHeight: 300 // (ends at 500)
      },
      {
        vOffset: 510,// (starts at 510)
        vHeight: 300 // (ends at 810)
      },
      {
        vOffset: 1500,// (starts at 1500)
        vHeight: 100  // (ends at 1600)
      }
    ];
    const layout = autoLayout(items, {
      vbegin: x => x.vOffset,
      vend: x => x.vHeight + x.vOffset
    });
    console.log("layout: ", layout);

    const columnNumberFor = (j, index) => {
      // Primitive layout, currently is not taking into account
      // previously allocated ones.
      for (let idx = 0; idx < this.state.jobs.length; ++idx) {
        const thisJob = this.state.jobs[idx];
        const thisJobEndTime =
          thisJob.startTime + thisJob.durationHours * 60 * 60 * 1000;
        if (j.startTime > thisJobEndTime) {
          // slot is free
          return idx;
        }
      }
      // all occupied
      return index;
    };

    const horizontalOffsetFor = (j, index) => {
      return (
        columnNumberFor(j, index) *
        (this.props.jobWidth + this.props.horizontalPadding)
      );
    };

    const topFor = j => {
      // j.startTime contains a number of milliseconds from epoch start
      const pixelsOfMs = ms => {
        const hours = ms / (1000 * 60 * 60);
        const PIXELS_IN_HOUR = 50;
        return hours * PIXELS_IN_HOUR;
      };
      const offsetMs = j.startTime - this.props.beginTime;
      return pixelsOfMs(offsetMs);
    };

    const techMaps = this.state.jobs.map((job, idx) => (
      <TechMapView
        title={job.title}
        tintColor={job.tintColor}
        height={heightFor(job)}
        left={horizontalOffsetFor(job, idx)}
        width={this.props.jobWidth}
        top={topFor(job)}
      />
    ));

    // Style ovverides
    const style = {
      // position: 'relative'
    };

    return (
      <div className="SchedulerTimeline" style={style}>
        {techMaps}
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
          <ProductList />
          <StockList />

          <h1> SchedulerTimeline Demo </h1>
          <div className="SchedulerTimeline_Container">
            <SchedulerTimeline
              durationScalingFator={100}
              jobWidth={100}
              horizontalPadding={15}
              beginTime={Date.parse("01 Jan 1970 00:00:00 GMT")}
              endTime={Date.parse("03 Jan 1970 00:00:00 GMT")}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
