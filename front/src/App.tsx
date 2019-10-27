import HTML5Backend from "react-dnd-html5-backend";
import moment from "moment";
import PageNotFound from "./components/PageNotFound";
import PopulateSampleDataButton from "./components/PopulateSampleDataButton";
import React from "react";
import ReactSwitch from "react-switch";
import TechMapEditor from "./components/techMaps/TechMapEditor";
import TimelineScreen from "./components/PlanScreen";
import {
  BrowserRouter,
  Redirect,
  Route,
  RouteComponentProps,
  Switch
  } from "react-router-dom";
import { DragDropContext } from "react-dnd";
import { ROUTES } from "./constants/routes";
import { setApiMode } from "./api";
import "./App.css";
import "moment/locale/uk";

class App extends React.Component<{}, { inMem: boolean }> {
  state = {
    inMem: false
  };

  handleChange = (checked: boolean) => {
    setApiMode(checked);
    this.setState({ inMem: checked });
  };

  componentDidMount() {
    moment.locale("uk");
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
          <PopulateSampleDataButton />
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
                component={(props: RouteComponentProps<{ id: string }>) => (
                  <TechMapEditor
                    techMapId={props.match.params.id}
                    goBack={props.history.goBack}
                    goToRoute={(r: string) => props.history.push(r)}
                  />
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
