import axios from 'axios';
//@ts-ignore
import Chat from '@samagra-x/chatui';
import React, {
  ReactElement,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { AppContext } from '../../context';
import { useLocalization } from '../../hooks';
import ChatMessageItem from '../chat-message-item';
import RenderVoiceRecorder from '../recorder/RenderVoiceRecorder';
import toast from 'react-hot-toast';
import DownTimePage from '../down-time-page';

import { useConfig } from '../../hooks/useConfig';
import { useSelector } from 'react-redux';
import { selectIsDown, selectIsMessageReceiving, selectMessagesToRender } from '../../store/slices/messageSlice';

import ShareButtons from '../share-buttons';

const ChatUiWindow: React.FC = () => {
  const t = useLocalization();
  const context = useContext(AppContext);
  const isDown = useSelector(selectIsDown);
  const isMsgReceiving = useSelector(selectIsMessageReceiving);
  
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       await context?.fetchIsDown();
  //       if (!context?.isDown) {
  //         const chatHistory = await axios.get(
  //           `${process.env.NEXT_PUBLIC_BFF_API_URL
  //           }/user/chathistory/${sessionStorage.getItem('conversationId')}`,
  //           {
  //             headers: {
  //               authorization: `Bearer ${localStorage.getItem('auth')}`,
  //             },
  //           }
  //         );

  //         console.log('ghji:', chatHistory);
  //         console.log('history:', chatHistory.data);

  //         const modifiedChatHistory = chatHistory.data.map((chat: any) => {
  //           if (!chat.response) {
  //             chat.response =
  //               t('message.no_signal');
  //           }
  //           return chat;
  //         });

  //         const normalizedChats = normalizedChat(modifiedChatHistory);
  //         console.log('normalized chats', normalizedChats);
  //         if (normalizedChats.length > 0) {
  //           context?.setMessages(normalizedChats);
  //         }
  //       }
  //     } catch (error: any) {
  //       console.error(error);
  //     }
  //   };
  //   recordUserLocation();
  //   !context?.loading && fetchData();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [context?.setMessages, context?.fetchIsDown, context?.isDown]);



  const handleSend = useCallback(
    async (type: string, msg: any) => {
      if (msg.length === 0) {
        toast.error(t('error.empty_msg'));
        return;
      }
      if (type === 'text' && msg.trim()) {
        context?.sendMessage(msg.trim());
      }
    },
    [context, t]
  );

  const messagesToRender = useSelector(selectMessagesToRender);
  const placeholder = useMemo(() => t('message.ask_ur_question'), [t]);

  const secondaryColorConfig = useConfig('theme', 'secondaryColor');
  const secondaryColor = useMemo(() => {
    return secondaryColorConfig?.value;
  }, [secondaryColorConfig]);

  if (isDown) {
    return <DownTimePage />;
  } else
    return (
      <div style={{ height: '100%', width: '100%' }}>
        <Chat
          btnColor={secondaryColor}
          background="var(--bg-color)"
          disableSend={isMsgReceiving}
          //@ts-ignore
          translation={t}
          showTransliteration={!(localStorage.getItem('locale') === 'en')}
          //@ts-ignore
          messages={messagesToRender}
          voiceToText={RenderVoiceRecorder}
          //@ts-ignore
          renderMessageContent={(props): ReactElement => (
            <ChatMessageItem
              //@ts-ignore
              key={props}
              message={props}
              onSend={handleSend}
            />
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
