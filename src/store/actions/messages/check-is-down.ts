import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const checkIsServerDown = createAsyncThunk('message/checkIsServerDown', async (flags, thunkAPI) => {
    try {
        //	const state = thunkAPI.getState();
        const response = await axios.get(
            //@ts-ignore
            `${process.env.NEXT_PUBLIC_BFF_API_URL}/health/${flags?.health_check_time?.value}`
        );;

        return response.data.status;
    } catch (error) {
        //@ts-ignore
        return thunkAPI.rejectWithValue(error.message || 'Failed to verify otp.');
    }
});
