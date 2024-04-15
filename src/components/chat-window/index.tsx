import axios from 'axios';
//@ts-ignore
import Chat from '@samagra-x/chatui';
import React, {
  ReactElement,
  useCallback,
  useContext,
  useMemo,
  useEffect,
} from 'react';
import { AppContext } from '../../context';
import { useLocalization } from '../../hooks';
import MessageItem from '../message-item';
import RenderVoiceRecorder from '../recorder/RenderVoiceRecorder';
import toast from 'react-hot-toast';
import { useConfig } from '../../hooks/useConfig';
import ShareButtons from '../share-buttons';
import DowntimePage from '../../pageComponents/downtime-page';
import { useColorPalates } from '../../providers/theme-provider/hooks';
import { getMsgType } from '../../utils/getMsgType';
import { recordUserLocation } from '../../utils/location';
import { v4 as uuidv4 } from 'uuid';

const ChatUiWindow: React.FC = () => {
  const config = useConfig('component', 'chatUI');
  const theme = useColorPalates();
  const secondaryColor = useMemo(() => {
    return theme?.primary?.light;
  }, [theme?.primary?.light]);
  const t = useLocalization();
  const context = useContext(AppContext);
  const { isDown, isMsgReceiving } = context;

  useEffect(() => {
    const fetchData = async () => {
      try {
        await context?.fetchIsDown();
        if (!context?.isDown) {
          const chatHistory = await axios.get(
            `${
              process.env.NEXT_PUBLIC_BFF_API_URL
            }/user/chathistory/${sessionStorage.getItem('conversationId')}`,
            {
              headers: {
                authorization: `Bearer ${localStorage.getItem('auth')}`,
              },
            }
          );

          console.log('ghji:', chatHistory);
          console.log('history:', chatHistory.data);

          const modifiedChatHistory = chatHistory.data.map((chat: any) => {
            if (!chat.response) {
              chat.response = t('message.no_signal');
            }
            return chat;
          });

          const normalizedChats = normalizedChat(modifiedChatHistory);
          console.log('normalized chats', normalizedChats);
          if (normalizedChats.length > 0) {
            context?.setMessages(normalizedChats);
          }
        }
      } catch (error: any) {
        console.error(error);
      }
    };
    recordUserLocation();
    !context?.loading && fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context?.setMessages, context?.fetchIsDown, context?.isDown]);

  const normalizedChat = (chats: any): any => {
    console.log('in normalized', chats);
    const conversationId = sessionStorage.getItem('conversationId');
    const history = chats
      .filter(
        (item: any) =>
          conversationId === 'null' || item.conversationId === conversationId
      )
      .flatMap((item: any) =>
        [
          item.query?.length && {
            text: item.query,
            position: 'right',
            repliedTimestamp: item.createdAt,
            messageId: uuidv4(),
          },
          {
            text: item.response,
            position: 'left',
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

    console.log('historyyy', history);
    console.log('history length:', history.length);

    return history;
  };

  const handleSend = useCallback(
    async (type: string, msg: any) => {
      if (msg.length === 0) {
        toast.error(t('error.empty_msg'));
        return;
      }
      console.log('mssgs:', context?.messages);
      if (type === 'text' && msg.trim()) {
        context?.sendMessage(msg.trim());
      }
    },
    [context, t]
  );
  const normalizeMsgs = useMemo(
    () =>
      context?.messages?.map((msg: any) => ({
        type: getMsgType(msg),
        content: { text: msg?.text, data: { ...msg } },
        position: msg?.position ?? 'right',
      })),
    [context?.messages]
  );
  console.log('fghj:', { messages: context?.messages });
  const msgToRender = useMemo(() => {
    return context?.loading
      ? [
          ...normalizeMsgs,
          {
            type: 'loader',
            position: 'left',
            botUuid: '1',
          },
        ]
      : normalizeMsgs;
  }, [context?.loading, normalizeMsgs]);

  const placeholder = useMemo(
    () => config?.placeholder ?? 'Ask Your Question',
    [config]
  );

  if (isDown) {
    return <DowntimePage />;
  } else
    return (
      <div style={{ height: '100%', width: '100%' }}>
        <Chat
          btnColor={secondaryColor || 'black'}
          background="var(--bg-color)"
          disableSend={isMsgReceiving}
          //@ts-ignore
          translation={t}
          showTransliteration={config?.allowTransliteration  && localStorage.getItem('locale') === config?.transliterationOutputLanguage}
          transliterationConfig={{
            transliterationApi: config?.transliterationApi + '/transliterate',
            transliterationInputLanguage: config?.transliterationInputLanguage,
            transliterationOutputLanguage:
              config?.transliterationOutputLanguage,
            transliterationProvider: config?.transliterationProvider,
            transliterationSuggestions: config?.transliterationSuggestions,
          }}
          //@ts-ignore
          messages={msgToRender}
          voiceToText={RenderVoiceRecorder}
          //@ts-ignore
          renderMessageContent={(props): ReactElement => (
            <MessageItem message={props} />
          )}
          onSend={handleSend}
          locale="en-US"
          placeholder={placeholder}
        />
        <ShareButtons />
      </div>
    );
};

export default ChatUiWindow;
