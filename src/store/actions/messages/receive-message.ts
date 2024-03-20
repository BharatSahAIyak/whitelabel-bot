import { createAsyncThunk } from "@reduxjs/toolkit";

export const onMessageReceivedAction = createAsyncThunk(
    "message/receiveMessage",
    async (messageData: any, thunkAPI) => {

        try {

            if (
                messageData?.message?.content.msg_type.toUpperCase() ===
                "IMAGE"
            ) {
                if (
                    // messageData?.message.content.timeTaken + 1000 < timer2 &&
                    messageData?.isOnline
                ) {

                    return {
                        message: messageData?.message,
                        media: { imageUrl: messageData?.message?.content?.media_url },
                    };
                }
            } else if (
                messageData?.message?.content.msg_type.toUpperCase() ===
                "AUDIO"
            ) {

                return {
                    message: messageData?.message,
                    media: { audioUrl: messageData?.message?.content?.media_url },
                };
            } else if (
                messageData?.message?.content.msg_type.toUpperCase() ===
                "VIDEO"
            ) {

                return {
                    message: messageData?.message,
                    media: { videoUrl: messageData?.message?.content?.media_url },
                };
            } else if (
                messageData?.message?.content.msg_type.toUpperCase() ===
                "DOCUMENT" ||
                messageData?.message?.content.msg_type.toUpperCase() ===
                "FILE"
            ) {

                return {
                    message: messageData?.message,
                    media: { fileUrl: messageData?.message?.content?.media_url },
                };
            } else if (
                messageData?.message?.content.msg_type.toUpperCase() ===
                "TEXT"
            ) {
                if (
                    // messageData?.message.content.timeTaken + 1000 < timer2 &&
                    messageData?.isOnline
                ) {
                    console.log("hola ram: 5")
                    return { message: messageData?.message, media: null };
                }
            }

        } catch (error) {
            //@ts-ignore
            return thunkAPI.rejectWithValue(error.message || "Failed to verify otp.");
        }
    }
);
