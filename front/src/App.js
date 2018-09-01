// https://code.tutsplus.com/tutorials/introduction-to-api-calls-with-react-and-axios--cms-21027

import React, { Component } from "react";
import "./App.css";
import axios from "axios";
import { autoLayout, autoLayout_dumb } from "./layout";
import _ from "lodash";

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

function getSampleJobs() {
  return [
    {
      title: "1",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 2.5,
      startTime: Date.parse("01 Jan 1970 00:00:00 GMT"),
      id: "1"
    },
    {
      title: "2",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 1.5,
      startTime: Date.parse("01 Jan 1970 02:00:00 GMT"),
      id: "2"
    },
    {
      title: "3",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 3.5,
      startTime: Date.parse("01 Jan 1970 01:00:00 GMT"),
      id: "3"
    },
    {
      title: "4",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 0.7,
      startTime: Date.parse("01 Jan 1970 1:30:00 GMT"),
      id: "4"
    },
    {
      title: "5",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 0.7,
      startTime: Date.parse("01 Jan 1970 6:30:00 GMT"),
      id: "5"
    },
    {
      title: "6",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 0.4,
      startTime: Date.parse("01 Jan 1970 7:00:00 GMT"),
      id: "6"
    },
    {
      title: "7",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 1.2,
      startTime: Date.parse("01 Jan 1970 7:35:00 GMT"),
      id: "7"
    },
    {
      title: "8",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 1.2,
      startTime: Date.parse("01 Jan 1970 6:30:00 GMT"),
      id: "8"
    },
    {
      title: "9",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 1.2,
      startTime: Date.parse("01 Jan 1970 7:00:00 GMT"),
      id: "9"
    },
    {
      title: "10",
      tintColor: "rgb(216, 216, 216)",
      durationHours: 1.2,
      startTime: Date.parse("01 Jan 1970 7:30:00 GMT"),
      id: "10"
    }
  ];
}

class TechMapView extends React.Component {
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

class SchedulerTimeline2 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jobs: getSampleJobs()
    };
  }

  render() {
    const msToHours = ms => ms / (1000 * 60 * 60);
    const pixelsOfMs = ms => msToHours(ms) * this.props.durationScalingFator;
    const jobHeight = j => j.durationHours * this.props.durationScalingFator;
    const jobTop = j => pixelsOfMs(j.startTime - this.props.beginTime);

    const jobLayoutMapper = {
      vbegin: x => x.startTime,
      vend: x => x.startTime + x.durationHours * 60 * 60 * 1000,
      identity: x => x.title
    };
    const layout = autoLayout(this.state.jobs, jobLayoutMapper);
    //const layout = autoLayout_dumb(this.state.jobs, jobLayoutMapper);

    const groupedByCols = _.groupBy(layout, x => x.col);
    const columnViews = _.keys(groupedByCols).map((x, x_idx) => {
      const columnJobIds = _.map(groupedByCols[x], x => x.item.id);
      const columnJobs = _.filter(this.state.jobs, x =>
        _.includes(columnJobIds, x.id)
      );
      const columnTechMaps = columnJobs.map((job, idx) => (
        <TechMapView
          title={job.title}
          tintColor={job.tintColor}
          height={jobHeight(job)}
          left={0}
          width={this.props.jobWidth}
          top={jobTop(job)}
          key={job.id}
        />
      ));
      const style = {
        left: x_idx * (this.props.jobWidth + 10),
        width: this.props.jobWidth,
        height: pixelsOfMs(this.props.endTime)
      };
      return (
        <div className="SchedulerTimelineColumn" style={style}>
          <div className="SchedulerTimelineColumn_Inner">{columnTechMaps}</div>
        </div>
      );
    });
    // Style ovverides
    const style = {
      left: this.props.left,
      height: this.props.height
    };

    return (
      <div className="SchedulerTimeline2" style={style}>
        {columnViews}
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
          startTime: Date.parse("01 Jan 1970 00:00:00 GMT"),
          id: "1"
        },
        {
          title: "2",
          tintColor: "rgb(216, 216, 216)",
          durationHours: 1.5,
          startTime: Date.parse("01 Jan 1970 02:00:00 GMT"),
          id: "2"
        },
        {
          title: "3",
          tintColor: "rgb(216, 216, 216)",
          durationHours: 3.5,
          startTime: Date.parse("01 Jan 1970 01:00:00 GMT"),
          id: "3"
        },
        {
          title: "4",
          tintColor: "rgb(216, 216, 216)",
          durationHours: 0.7,
          startTime: Date.parse("01 Jan 1970 1:30:00 GMT"),
          id: "4"
        },
        {
          title: "5",
          tintColor: "rgb(216, 216, 216)",
          durationHours: 0.7,
          startTime: Date.parse("01 Jan 1970 6:30:00 GMT"),
          id: "5"
        },
        {
          title: "6",
          tintColor: "rgb(216, 216, 216)",
          durationHours: 0.4,
          startTime: Date.parse("01 Jan 1970 7:00:00 GMT"),
          id: "6"
        },
        {
          title: "7",
          tintColor: "rgb(216, 216, 216)",
          durationHours: 1.2,
          startTime: Date.parse("01 Jan 1970 7:35:00 GMT"),
          id: "7"
        },
        {
          title: "8",
          tintColor: "rgb(216, 216, 216)",
          durationHours: 1.2,
          startTime: Date.parse("01 Jan 1970 6:30:00 GMT"),
          id: "8"
        },
        {
          title: "9",
          tintColor: "rgb(216, 216, 216)",
          durationHours: 1.2,
          startTime: Date.parse("01 Jan 1970 7:00:00 GMT"),
          id: "9"
        },
        {
          title: "10",
          tintColor: "rgb(216, 216, 216)",
          durationHours: 1.2,
          startTime: Date.parse("01 Jan 1970 7:30:00 GMT"),
          id: "10"
        }
      ]
    };
  }

  render() {
    const heightFor = j => {
      return j.durationHours * this.props.durationScalingFator;
    };
    // allows autoLayout to know start jobs dimensions.
    const jobLayoutMapper = {
      vbegin: x => x.startTime,
      vend: x => x.startTime + x.durationHours * 60 * 60 * 1000,
      identity: x => x.title
    };
    const layout = autoLayout(this.state.jobs, jobLayoutMapper);
    //const layout = autoLayout_dumb(this.state.jobs, jobLayoutMapper);

    const columnNumberFor = (j, index) => {
      const job_layout = _.find(layout, x => x.item.id === j.id);
      if (job_layout) {
        return job_layout.col;
      } else {
        console.assert(false);
      }
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
        return hours * this.props.durationScalingFator;
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
        key={job.id}
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
          <p> Please note it is scrollable </p>
          <div className="SchedulerTimeline_Container">
            {/* <SchedulerTimeline
              durationScalingFator={100}
              jobWidth={100}
              horizontalPadding={15}
              beginTime={Date.parse("01 Jan 1970 00:00:00 GMT")}
              endTime={Date.parse("03 Jan 1970 00:00:00 GMT")}
            /> */}

            <div className="ColumnBasedTimeline_Container">
              <h1> Column aware SchedulerTimeline Demo </h1>
              <SchedulerTimeline2
                height={500}
                durationScalingFator={100}
                jobWidth={150}
                horizontalPadding={15}
                beginTime={Date.parse("01 Jan 1970 00:00:00 GMT")}
                endTime={Date.parse("02 Jan 1970 00:00:00 GMT")}
                // endTime={Date.parse("03 Jan 1970 00:00:00 GMT")}
                left={0}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
