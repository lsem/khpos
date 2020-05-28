import React from "react";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from '@material-ui/core/CssBaseline';

import ApplicationBar from "./features/ApplicationBar";
import OrderManagement from "./features/orderManagement/OrderManagement";

function App() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? "dark" : "light",
        },
      }),
    [prefersDarkMode]
  );

  return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div id="header">
          <ApplicationBar />
        </div>
        <div id="main">
          <OrderManagement />
        </div>
        <div id="footer">
        </div>
      </ThemeProvider>
  );
}

export default App;
