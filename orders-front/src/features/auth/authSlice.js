import { createSlice } from "@reduxjs/toolkit";

import api from "../../api";
import { setError } from "../errors/errorSlice";

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    loggedIn: false,
    token: null,
    role: null,
  },
  reducers: {
    apiLogin: () => {},
    setAuth: (state, action) => {
      state.loggedIn = true;
      state.token = action.payload.token;
      state.role = action.payload.role;
    },
    resetAuth: (state) => {
      state.loggedIn = false;
      state.token = null;
      state.role = null;
    },
  },
});

//actions
export const { apiLogin, setAuth, resetAuth } = authSlice.actions;

//thunks
export const thunkApiLogin = (userIDName, password) => async (dispatch) => {
  dispatch(apiLogin());

  try {
    const authInfo = await api
      .post("users/login", { json: { userIDName, password } })
      .json();
    localStorage.setItem(
      "auth-info",
      JSON.stringify({ ...authInfo, userIDName })
    );
    dispatch(setAuth(authInfo));
  } catch (e) {
    if (e.response) {
      dispatch(
        setError(
          `Не вдалося автентифікуватись на сервері: ${await e.response.text()}`
        )
      );
    } else {
      dispatch(
        setError(`Не вдалося автентифікуватись на сервері: ${e.message}`)
      );
    }
  }
};

export const thunkApiSubscribeAuthEvents = () => async (dispatch) => {
  api.on("404", () => {
    dispatch(resetAuth());
  });
};

export default authSlice.reducer;
