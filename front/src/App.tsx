import React from "react";
import { BrowserRouter, Route, Redirect, Switch } from "react-router-dom";
import "./App.css";
import HTML5Backend from "react-dnd-html5-backend";
import { DragDropContext } from "react-dnd";
import TimelineScreen from "./components/PlanScreen";
import moment from "moment";
import "moment/locale/uk";
import ReactSwitch from "react-switch";
import { setApiMode } from "./api";
import { ROUTES } from "./constants/routes";
import TechMapEditor from "./components/techMaps/TechMapEditor";
import PageNotFound from "./components/PageNotFound";

class App extends React.Component<{}, {inMem: boolean}> {
  constructor() {
    super({});

    this.state = {
      inMem: false
    }

    moment.locale("uk");
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(checked: boolean) {
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
                component={(props: any) => (
                  <TechMapEditor id={props.match.params.id}/>
                )}
              />
              <Redirect from="/" exact to={ROUTES.PLAN_SCREEN} />
              <Route component={PageNotFound} />
            </Switch>
          </div>
        </BrowserRouter>
      </div>
    );
  }
}
export default DragDropContext(HTML5Backend)(App);
