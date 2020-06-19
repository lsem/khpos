import { createSlice } from "@reduxjs/toolkit";

export const errorSlice = createSlice({
  name: "error",
  initialState: {
    message: null,
  },
  reducers: {
    setError: (state, action) => {
      console.error(action.payload);
      state.message = action.payload;
    },
    resetError: (state) => {
      state.message = null;
    },
  },
});

//actions
export const { setError, resetError } = errorSlice.actions;

export default errorSlice.reducer;
