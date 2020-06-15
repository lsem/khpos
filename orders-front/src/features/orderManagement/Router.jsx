import React from "react";
import { orderManagementRoutes } from "../../constants/routes";
import { BrowserRouter as Router, Switch, Route, useRouteMatch } from "react-router-dom";
import OrderManagement from "./OrderManagement";
import ItemLog from "./ItemLog";

export default function OrderManagementRouter() {
  const { path } = useRouteMatch();

  return (
    <Router>
      <Switch>
        <Route path={`${path}`} exact>
          <OrderManagement />
        </Route>
        <Route path={`${path}/${orderManagementRoutes.itemLog}`} exact>
          <ItemLog />
        </Route>
      </Switch>
    </Router>
  );
}
