import { createSlice } from "@reduxjs/toolkit";

import api from "../../api";

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
export const thunkGetPosFromApi = () => async (dispatch) => {
  dispatch(getPosFromApi());

  try {
    dispatch(setPos(await api.get("pos").json()));
  } catch (e) {
    dispatch(
      setPosError(
        `Не вдалося отримати точки продажу з сервера: ${await e.response.text()}`
      )
    );
  }
};

export default posSlice.reducer;
