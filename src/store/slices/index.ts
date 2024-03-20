// someSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { verifyOtp } from '../actions/user/verify-otp';
import produce from 'immer';
interface SomeState {
  // Define your state interface here
}

const initialState: SomeState = {
  // Define initial state here
};




const someSlice = createSlice({
  name: 'some',
  initialState,
  reducers: {
    someAction(state, action: PayloadAction<any>) {
      // Define how state changes in response to this action
    },
  },
 
});

export const { someAction } = someSlice.actions;
export default someSlice.reducer;
