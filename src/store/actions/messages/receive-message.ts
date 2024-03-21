import { createAsyncThunk } from "@reduxjs/toolkit";

export const onMessageReceivedAction = createAsyncThunk(
    "message/receiveMessage",
    async (messageData: any, thunkAPI) => {

        try {

            if (
                messageData?.message?.messageType.toUpperCase() ===
                "IMAGE"
            ) {
                if (
                    // messageData?.message.content.timeTaken + 1000 < timer2 &&
                    messageData?.isOnline
                ) {

                    return {
                        message: messageData?.message,
                        media: { imageUrl: messageData?.message?.media_url },
                    };
                }
            } else if (
                messageData?.message?.messageType.toUpperCase() ===
                "AUDIO"
            ) {

                return {
                    message: messageData?.message,
                    media: { audioUrl: messageData?.message?.media_url },
                };
            } else if (
                messageData?.message?.messageType.toUpperCase() ===
                "VIDEO"
            ) {

                return {
                    message: messageData?.message,
                    media: { videoUrl: messageData?.message?.media_url },
                };
            } else if (
                messageData?.message?.messageType.toUpperCase() ===
                "DOCUMENT" ||
                messageData?.message?.messageType.toUpperCase() ===
                "FILE"
            ) {

                return {
                    message: messageData?.message,
                    media: { fileUrl: messageData?.message?.media_url },
                };
            } else if (
                messageData?.message?.messageType.toUpperCase() ===
                "TEXT"
            ) {
                if (
                    // messageData?.message.content.timeTaken + 1000 < timer2 &&
                    messageData?.isOnline
                ) {
                    return { message: messageData?.message, media: null };
                }
            }

        } catch (error) {
            //@ts-ignore
            return thunkAPI.rejectWithValue(error.message || "Failed to verify otp.");
        }
    }
);
