
"use client";
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { produce } from 'immer';
import { verifyOtp } from '../actions/user/verify-otp';
import {cloneDeep} from 'lodash';
interface SomeState {
  user : Record<string,any>,
  isFetching : boolean
}

const initialState: SomeState = {
  user: { },
  isFetching: false,
};


function verifyOtpPending(state: any, { payload, meta }: any): void {
  console.log("pending:",{payload,meta,state:cloneDeep(state)});
  state.isFetching = true;
  return state;
	// if (meta?.arg?.types === 'conversation') {
	// 	state.searchRequestStatus = meta.requestStatus;
	// }
}
function verifyOtpFullfilled(state: any, { payload, meta }: any): void {
  console.log("payload:",{payload,state:cloneDeep(state)});
	state.isFetching =false ;
  state.user = payload?.result?.data?.user;

  return state;
}
const userSlice = createSlice({
  name: 'userSlice',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<any>) {
        console.log("hola:",{action})
      state.isFetching = action.payload;
      return state;
    },
  },
  extraReducers: (builder) => {
		builder.addCase(verifyOtp.pending, produce(verifyOtpPending));
		builder.addCase(verifyOtp.fulfilled, produce(verifyOtpFullfilled));
		
	}
});

export const { setLoading } = userSlice.actions;
export default userSlice.reducer;

export const selectUserFetching = (state: any): boolean =>{
  
  return state.userSlice.isFetching;
}
	