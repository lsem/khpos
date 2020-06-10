import { createSlice } from "@reduxjs/toolkit";

import axios from "axios";

export const posSlice = createSlice({
  name: "pos",
  initialState: {
    items: null,
    errorMessage: null,
  },
  reducers: {
    getPosFromApi: (state) => {
      state.items = null;
    },
    setPos: (state, action) => {
      state.items = action.payload.items;
      state.errorMessage = null;
    },
    setPosError: (state, action) => {
      state.items = null;
      state.errorMessage = action.payload;
    },
  },
});

//actions
const { getPosFromApi, setPos, setPosError } = posSlice.actions;

//thunks
export const thunkGetPosFromApi = () => (dispatch) => {
  dispatch(getPosFromApi());

  axios
    .get("/pos")
    .then((response) => {
      dispatch(setPos(response.data));
    })
    .catch((e) => {
      dispatch(
        setPosError(`Не вдалося отримати точки продажу з сервера: ${e}`)
      );
    });
};

export default posSlice.reducer;
