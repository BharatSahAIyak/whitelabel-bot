import { createAsyncThunk } from '@reduxjs/toolkit';


// Create an async thunk for fetching user data
export const sendMessageAction = createAsyncThunk('message/sendMessage', async (messageData, thunkAPI) => {
	console.log("chakshu sendMsg:", messageData);
  try {
    //TODO: Add proper types
	//@ts-ignore
        messageData?.socket?.sendMessage({
          	//@ts-ignore
            text: messageData?.text,
            to: localStorage.getItem('userID'),
            payload: {
              from: localStorage.getItem('phoneNumber'),
              appId: 'AKAI_App_Id',
              channel: 'AKAI',
              latitude: sessionStorage.getItem('latitude'),
              longitude: sessionStorage.getItem('longitude'),
              city: sessionStorage.getItem('city'),
              state: sessionStorage.getItem('state'),
              ip: sessionStorage.getItem('ip'),
              asrId: sessionStorage.getItem('asrId'),
              userId: localStorage.getItem('userID'),
              conversationId: sessionStorage.getItem('conversationId'),
              botId: process.env.NEXT_PUBLIC_BOT_ID || ''
            }
          });

        return messageData
	} catch (error) {
        //@ts-ignore
		return thunkAPI.rejectWithValue(error.message || 'Failed to verify otp.');
	}
});
