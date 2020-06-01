import { createSlice } from "@reduxjs/toolkit";

import sellPointsSample from "../../samples/sellPoints.json";

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
      state.items = action.payload;
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
  new Promise((resolve) => {
    setTimeout(resolve, 1000);
  })
    .then(() => {
      dispatch(setPos(sellPointsSample));
    })
    .catch((e) => {
      dispatch(
        setPosError(`Не вдалося отримати точки продажу з сервера: ${e}`)
      );
    });
};

export default posSlice.reducer;
