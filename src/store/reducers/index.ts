// reducers.ts
import { combineReducers } from '@reduxjs/toolkit';
import userReducer from '../slices/userSlice';
import messageReducer from '../slices/messageSlice';

const rootReducer = combineReducers({
  userSlice :userReducer,
  messageSlice : messageReducer
});

export default rootReducer;
