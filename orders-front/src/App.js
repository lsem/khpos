import React from "react";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from '@material-ui/core/CssBaseline';

import ApplicationBar from "./features/ApplicationBar";
import MakeOrder from "./features/MakeOrder";

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
        <ApplicationBar />
        <MakeOrder />
      </ThemeProvider>
  );
}

export default App;
