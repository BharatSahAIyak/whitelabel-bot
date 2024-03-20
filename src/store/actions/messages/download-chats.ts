import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";


export const downloadChat = async (type: string) => {
  
      const url = `${process.env.NEXT_PUBLIC_BFF_API_URL
        }/user/chathistory/generate-pdf/${sessionStorage.getItem(
          'conversationId'
        )}`;
    
      return axios.post(url, null, {
        headers: {
          authorization: `Bearer ${localStorage.getItem('auth')}`,
        },
      });
          
  };
