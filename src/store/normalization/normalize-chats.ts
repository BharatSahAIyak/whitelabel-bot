import { map } from "lodash";
import { v4 as uuidv4 } from "uuid";
import { getMsgType } from "../../utils/getMsgType";
export const normalizeChatHistory = (chats: any) => {
  //TODO: replace it from store
  const conversationId = sessionStorage.getItem("conversationId");
  const history = chats
    .filter(
      (item: any) =>
        conversationId === "null" || item.conversationId === conversationId
    )
    .flatMap((item: any) =>
      [
        item.query?.length && {
          text: item.query,
          position: "right",
          repliedTimestamp: item.createdAt,
          messageId: uuidv4(),
        },
        {
          text: item.response,
          position: "left",
          sentTimestamp: item.createdAt,
          reaction: item.reaction,
          msgId: item.id,
          messageId: item.id,
          audio_url: item.audioURL,
          isEnd: true,
          optionClicked: true,
        },
      ].filter(Boolean)
    );
  return history;
};

export const normalizeMsgs = (messages: Array<any>) =>
  map(messages, (msg) => ({
    type: getMsgType(msg),
    content: { text: msg?.text, data: { ...msg } },
    position: msg?.position ?? "right",
  }));
