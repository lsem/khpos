import { createSlice } from "@reduxjs/toolkit";

import api from "../../api";

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: null,
    authenticated: false,
    errorMessage: null,
  },
  reducers: {
    apiLogin: () => {},
    apiLogout: () => {},
    setAuth: (state, action) => {
      state.authenticated = action.payload.authenticated;
      state.token = action.payload.token;
      state.errorMessage = null;
    },
    setAuthError: (state, action) => {
      state.authenticated = false;
      state.token = null;
      state.errorMessage = action.payload;
    },
  },
});

//actions
const { apiLogin, apiLogout, setAuth, setAuthError } = authSlice.actions;

//thunks
export const thunkApiLogin = (email, pass) => async (dispatch) => {
  dispatch(apiLogin());

  try {
    dispatch(setAuth(await (await api.post("auth", { email, pass })).json()));
  } catch (e) {
    dispatch(
      setAuthError(
        `Не вдалося автентифікуватись на сервері: ${await e.response.text()}`
      )
    );
  }
};

export const thunkApiLogout = () => async (dispatch) => {
  dispatch(apiLogout());

  try {
    dispatch(setAuth(await (await api.post("auth")).json()));
  } catch (e) {
    dispatch(setAuthError(`${await e.response.text()}`));
  }
};

export default authSlice.reducer;
