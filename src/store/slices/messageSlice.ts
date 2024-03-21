import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { produce } from "immer";
import { cloneDeep } from "lodash";
import { sendMessageAction } from "../actions/messages/send-message";
import { v4 as uuidv4 } from "uuid";
import { normalizeMsgs } from "../normalization/normalize-chats";
import { onMessageReceivedAction } from "../actions/messages/receive-message";
import { checkIsServerDown } from "../actions/messages/check-is-down";

interface MessageState {
  messages: Array<Record<string, any>>;
  isFetching: boolean;
}

const initialState: any = {
  messages: [],
  isMessageReceiving: false,
  isFetching: false,
  conversationId: null,
  startTime: Date.now(),
  endTime: Date.now(),
  isDown: false,
  isChatDownloading: false,
  isChatSharing: false,
  lastMsgId: null
};

function sendMessagePending(state: any, { payload, meta }: any): void {
  state.isMessageReceiving = true;
  state.isFetching = true;
  state.startTime = Date.now();
  return state;
}
function sendMessageFullfilled(state: any, { payload, meta }: any): void {
  console.log("_debug fullfilled state:", {
    payload,
    meta,
    state: cloneDeep(state),
  });
  state.isFetching = true;
  state.isMessageReceiving = true;
  if (!sessionStorage.getItem("conversationId")) {
    const cId = uuidv4();
    sessionStorage.setItem("conversationId", cId);
    state.conversationId = cId;
  } else sessionStorage.setItem("conversationId", payload.conversationId || "");
  state.messages = [
    ...state.messages.map((prevMsg: any) => ({ ...prevMsg, disabled: true })),
    {
      text: payload.text,
      position: "right",
      payload: { text: payload.text },
      time: Date.now(),
      disabled: true,
      messageId: uuidv4(),
      repliedTimestamp: Date.now(),
    },
  ];
  state.startTime = Date.now();
  sessionStorage.removeItem("asrId");
  return state;
}

function checkIsServerDownFulfilled(state: any, { payload, meta }: any): void {
  state.isDown = payload.status === 'OK';
  return state;
}
function messageReceivedFulfilled(state: any, { payload, meta }: any): void {
  const { message, media } = payload;
  if (
    message?.payload?.text &&
    message?.messageId?.Id &&
    message?.messageId?.channelMessageId
  ) {
    if (
      sessionStorage.getItem('conversationId') ===
      message.messageId.channelMessageId
    ) {
      const word = message.payload.text;
      const prev = [...state.messages];
      const updatedMessages = [...prev];
      const existingMsgIndex = updatedMessages.findIndex(
        (m: any) => m.messageId === message.messageId.Id
      );

      if (existingMsgIndex !== -1) {
        // Update the existing message with the new word
        if (word.endsWith('<end/>')) {
          updatedMessages[existingMsgIndex].isEnd = true;
        }
        updatedMessages[existingMsgIndex].text +=
          word.replace('<end/>', '') + ' ';
      } else {
        // If the message doesn't exist, create a new one
        const newMsg = {
          text: word.replace('<end/>', '') + ' ',
          isEnd: word.endsWith('<end/>') ? true : false,
          choices: message?.payload?.buttonChoices,
          position: 'left',
          reaction: 0,
          messageId: message?.messageId.Id,
          conversationId: message.messageId.channelMessageId,
          sentTimestamp: Date.now(),
          // btns: msg?.payload?.buttonChoices,
          // audio_url: msg?.content?.audio_url,
          // metaData: msg.payload?.metaData
          //     ? JSON.parse(msg.payload?.metaData)
          //     : null,
          ...media,
        };
        updatedMessages.push(newMsg);
      }

      state.messages = updatedMessages;


      if (message?.content?.title?.endsWith('<end/>')) {
        // syncChatHistory(
        //   msg?.messageId,
        //   msg?.content?.title.replace('<end/>', '')
        // );

        state.lastMsgId = message?.messageId;
        state.endTime = Date.now()
      }
      state.isMessageReceiving = false;
      state.isFetching = false;
    }
  }
  return state;
}
const messageSlice = createSlice({
  name: "messageSlice",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<any>) {
      state.isFetching = action.payload;
      return state;
    },
    setIsMsgReceiving(state, action: PayloadAction<any>) {
      state.isMessageReceiving = action.payload;
      return state;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(sendMessageAction.pending, produce(sendMessagePending));
    builder.addCase(
      sendMessageAction.fulfilled,
      produce(sendMessageFullfilled)
    );
    builder.addCase(onMessageReceivedAction.fulfilled, produce(messageReceivedFulfilled));
    builder.addCase(checkIsServerDown.fulfilled, produce(checkIsServerDownFulfilled));
  },
});

export const { setLoading, setIsMsgReceiving } = messageSlice.actions;
export default messageSlice.reducer;

export const selectMessageFetching = (state: any): boolean =>
  state.messageSlice.isFetching;

export const selectIsMessageReceiving = (state: any): boolean => state.messageSlice.isMessageReceiving;
export const selectConversationId = (state: any): boolean =>
  state.messageSlice.conversationId;

export const selectMessages = (state: any): boolean =>
  state.messageSlice.messages;

export const selectStartTime = (state: any): boolean => state.messageSlice.startTime;
export const selectEndTime = (state: any): boolean => state.messageSlice.endTime;
export const selectLastMsgId = (state: any): boolean => state.messageSlice.lastMsgId;
export const selectIsDown = (state: any): boolean => state.messageSlice.isDown;
export const selectMessagesToRender = (state: any): any => {
  const normalizedMsgs = normalizeMsgs(state.messageSlice.messages);
  const isMessageReceiving = state.messageSlice.isMessageReceiving;
  return isMessageReceiving
    ? [
      ...normalizedMsgs,
      {
        type: 'loader',
        position: 'left',
        botUuid: '1',
      },
    ]
    : normalizedMsgs;
}


