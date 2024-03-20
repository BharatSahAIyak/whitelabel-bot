import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Create an async thunk for fetching user data
export const verifyOtp = createAsyncThunk('user/verifyOtp', async (userData, thunkAPI) => {
	try {
		const state = thunkAPI.getState();
		console.log('Login User Thunk', { state, userData });
		const response = await axios.post(`${process.env.NEXT_PUBLIC_USER_SERVICE_URL}api/login/otp`, userData);
		console.log({ response });
		localStorage.setItem('user', JSON.stringify(response?.data?.result?.data?.user))
		return response.data;
	} catch (error) {
		//@ts-ignore
		return thunkAPI.rejectWithValue(error.message || 'Failed to verify otp.');
	}
});
