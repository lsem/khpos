import { createSlice } from "@reduxjs/toolkit";

import api from "../../api";
import { setError } from "../errors/errorSlice";

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: null,
    authenticated: false,
  },
  reducers: {
    apiLogin: () => {},
    apiLogout: () => {},
    setAuth: (state, action) => {
      state.authenticated = action.payload.authenticated;
      state.token = action.payload.token;
    },
  },
});

//actions
const { apiLogin, apiLogout, setAuth } = authSlice.actions;

//thunks
export const thunkApiLogin = (email, pass) => async (dispatch) => {
  dispatch(apiLogin());

  try {
    dispatch(setAuth(await (await api.post("auth", { email, pass })).json()));
  } catch (e) {
    dispatch(
      setError(
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
    dispatch(setError(`${await e.response.text()}`));
  }
};

export default authSlice.reducer;
