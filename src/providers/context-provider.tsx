'use client';
import {
  FC,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import _ from 'underscore';
import { v4 as uuidv4 } from 'uuid';
import { IntlProvider } from 'react-intl';
import { useLocalization } from '../hooks';
import toast from 'react-hot-toast';
import flagsmith from 'flagsmith/isomorphic';
import { Button, Spinner } from '@chakra-ui/react';
import axios from 'axios';
import { useFlags } from 'flagsmith/react';
import { useCookies } from 'react-cookie';
import { UCI } from 'socket-package';

import mergeConfigurations from '../utils/mergeConfigurations';
import { AppContext } from '../context';
import { FullPageLoader } from '../components/fullpage-loader';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessageAction } from '../store/actions/messages/send-message';
import { selectEndTime, selectIsDown, selectIsMessageReceiving, selectLastMsgId, selectMessageFetching, selectStartTime, setIsMsgReceiving, setLoading } from '../store/slices/messageSlice';
import {  onMessageReceivedAction } from '../store/actions/messages/receive-message';
import { normalizeChatHistory } from '../store/normalization/normalize-chats';
import { checkIsServerDown } from '../store/actions/messages/check-is-down';



const URL = process.env.NEXT_PUBLIC_SOCKET_URL || '';

export const ContextProvider: FC<{
  locale: any;
  localeMsgs: any;
  setLocale: any;
  children: ReactElement;
}> = ({ locale, children, localeMsgs, setLocale }) => {
  const t = useLocalization();
  const flags = useFlags(['health_check_time']);


  const [messages, setMessages] = useState<Array<any>>([]);
  const [newSocket, setNewSocket] = useState<any>();
  const [conversationId, setConversationId] = useState<string | null>(
    sessionStorage.getItem('conversationId')
  );

  const dispatch =useDispatch();
  const timer1 = flagsmith.getValue('timer1', { fallback: 30000 });
  const timer2 = flagsmith.getValue('timer2', { fallback: 45000 });
  const audio_playback = flagsmith.getValue('audio_playback', {
    fallback: 1.5,
  });
 
  const [showDialerPopup, setShowDialerPopup] = useState(false);
  const [currentQuery, setCurrentQuery] = useState("");
  // const [isConnected, setIsConnected] = useState(newSocket?.connected || false);
  const [cookie, setCookie, removeCookie] = useCookies();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [audioElement, setAudioElement] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(true);
  const [clickedAudioUrl, setClickedAudioUrl] = useState<string | null>(null);
  
 
   const [config, setConfig] = useState(null);
   const isMsgReceiving =useSelector(selectIsMessageReceiving);
   const startTime =useSelector(selectStartTime);
   const endTime =useSelector(selectEndTime);
   const lastMsgId =useSelector(selectLastMsgId);
   const loading =useSelector(selectMessageFetching);
   const isDown =useSelector(selectIsDown);

   console.log("selector:",{isMsgReceiving,startTime,endTime,lastMsgId,isDown})
 
  useEffect(() => {
    mergeConfigurations().then(setConfig);
  }, []);

  console.log("hola:",{config})


  const downloadChat = useMemo(() => {
    return (e: string) => {
      try {
        //@ts-ignore
        downloadHandler.postMessage(e);
      } catch (err) {
        console.log(err);
      }
    };
  }, []);

  const shareChat = useMemo(() => {
    return (e: string) => {
      try {
        //@ts-ignore
        shareUrl.postMessage(e);
      } catch (err) {
        console.log(err);
      }
    };
  }, []);

  const playAudio = useMemo(() => {
    return (url: string, content: any) => {
      if (!url) {
        console.error('Audio URL not provided.');
        return;
      }
      if (audioElement) {
        //@ts-ignore
        if (audioElement.src === url) {
          // If the same URL is provided and audio is paused, resume playback
          //@ts-ignore
          if (audioElement.paused) {
            setClickedAudioUrl(url);
            // setTtsLoader(true);
            audioElement
              //@ts-ignore
              .play()
              .then(() => {
                // setTtsLoader(false);
                setAudioPlaying(true);
                console.log('Resumed audio:', url);
              })
              //@ts-ignore
              .catch((error) => {
                setAudioPlaying(false);
                // setTtsLoader(false);
                setAudioElement(null);
                setClickedAudioUrl(null);
                console.error('Error resuming audio:', error);
              });
          } else {
            // Pause the current audio if it's playing
            //@ts-ignore
            audioElement.pause();
            setAudioPlaying(false);
            console.log('Paused audio:', url);
          }
          return;
        } else {
          // Pause the older audio if it's playing
          //@ts-ignore
          audioElement.pause();
          setAudioPlaying(false);
        }
      }
      setClickedAudioUrl(url);
      // setTtsLoader(true);
      const audio = new Audio(url);
      audio.playbackRate = audio_playback;
      audio.addEventListener('ended', () => {
        setAudioElement(null);
        setAudioPlaying(false);
      });
      axios
        .get(
          `${process.env.NEXT_PUBLIC_BFF_API_URL}/incrementaudioused/${content?.data?.messageId}`
        )
        .then((res) => { })
        .catch((err) => {
          console.log(err);
        });

      audio
        .play()
        .then(() => {
          // setTtsLoader(false);
          setAudioPlaying(true);
          console.log('Audio played:', url);
          // Update the current audio to the new audio element
          //@ts-ignore
          setAudioElement(audio);
        })
        .catch((error) => {
          setAudioPlaying(false);
          // setTtsLoader(false);
          setAudioElement(null);
          setClickedAudioUrl(null);
          console.error('Error playing audio:', error);
        });
    };
  }, [audioElement, audio_playback]);

  const checkInternetConnection = () => {
    if (!navigator.onLine) {
      setIsOnline(false);
      setMessages((prev) => [
        ...prev,
        {
          text: `${t('message.no_signal')}`,
          choices: [],
          position: 'left',
          reaction: 0,
          messageId: uuidv4(),
          conversationId: conversationId,
          sentTimestamp: Date.now(),
          btns: true,
          audio_url: '',
        },
      ]);
      dispatch(setLoading(false))
    //  setIsMsgReceiving(false);
    } else {
      setIsOnline(true);
    }
  };

  useEffect(() => {
    // Initial check
    checkInternetConnection();

    // Set up event listeners to detect changes in the internet connection status
    window.addEventListener('online', checkInternetConnection);
    window.addEventListener('offline', checkInternetConnection);

    // Clean up event listeners on component unmount
    return () => {
      window.removeEventListener('online', checkInternetConnection);
      window.removeEventListener('offline', checkInternetConnection);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (localStorage.getItem('userID') && localStorage.getItem('auth')) {
      setNewSocket(
        new UCI(
          URL,
          {
            transportOptions: {
              polling: {
                extraHeaders: {
                  Authorization: `Bearer ${localStorage.getItem('auth')}`,
                  channel: 'akai',
                },
              },
            },
            query: {
              deviceId: localStorage.getItem('userID'),
            },
            autoConnect: false,
            transports: ['polling', 'websocket'],
            upgrade: true,
          },
          onMessageReceived
        )
      );
    }
    function cleanup() {
      if (newSocket)
        newSocket.onDisconnect(() => {
          console.log('Socket disconnected');
        });
    }
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStorage.getItem('userID'), localStorage.getItem('auth')]);

  
  

  const onMessageReceived = useCallback(
    async (message: any) => {
      //@ts-ignore
      dispatch(onMessageReceivedAction({message,isOnline})).then(res=>{
        console.log("hola ram msgReceived",{res})
      })
    },
    [isOnline,onMessageReceivedAction]
  );



  useEffect(() => {
    if (!lastMsgId) return;
    //@ts-ignore
    const timeDiff = endTime - startTime;
    axios
      .post(
        `${process.env.NEXT_PUBLIC_BFF_API_URL}/timetakenatapplication/${lastMsgId}`,
        {
          data: {
            timeTaken: timeDiff,
          },
        }
      )
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endTime]);

  const sendMessage = useCallback(
    (text: string, media: any, isVisibile = true): void => {
      //@ts-ignore
      dispatch(sendMessageAction({ text, media, conversationId ,socket:newSocket,isVisibile}));
    },
    [conversationId, newSocket, removeCookie]
  );

  const fetchIsDown = useCallback (() => {
    //@ts-ignore
   dispatch(checkIsServerDown(flags));
    
  }, [flags,dispatch,checkIsServerDown]);

  // Remove ASR ID from session storage on conversation change
  useEffect(() => {
    sessionStorage.removeItem('asrId');
  }, [conversationId]);



  useEffect(() => {
    if (isDown) return;
    let secondTimer: any = null;
    let timer: any = null;
    if (timer || secondTimer) {
      clearTimeout(secondTimer);
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      if (loading) {
        toast(() => <span>{t('message.taking_longer')}</span>, {
          // @ts-ignore
          icon: <Spinner />,
        });
      }
      secondTimer = setTimeout(async () => {
        fetchIsDown();
        console.log('log: here');
        if (loading) {
          console.log('log:', loading);
          try {
            const chatHistory = await axios.get(
              `${process.env.NEXT_PUBLIC_BFF_API_URL
              }/user/chathistory/${sessionStorage.getItem('conversationId')}`,
              {
                headers: {
                  authorization: `Bearer ${localStorage.getItem('auth')}`,
                },
              }
            );
            console.log('ghji:', chatHistory);
            console.log('history:', chatHistory.data);

            if (!chatHistory.data[chatHistory.data.length - 1].response) {
              chatHistory.data[chatHistory.data.length - 1].response = `${t(
                'message.no_signal'
              )}`;
            }
            const normalizedChats = normalizeChatHistory(chatHistory);
            console.log('normalized chats', normalizedChats);
            if (normalizedChats.length > 0) {
             ;
              dispatch( setIsMsgReceiving(false))
              dispatch( setLoading(false));
              setMessages(normalizedChats);
            }
          } catch (error: any) {
            dispatch( setIsMsgReceiving(false))
            dispatch( setLoading(false));
            console.error(error);
          }
        } else if (isMsgReceiving) {
          console.log('log: here');
          const secondLastMsg =
            messages.length > 2 ? messages[messages.length - 2] : null;
          setMessages((prev: any) => {
            if (prev.length > 0) {
              // Create a new array without the last element
              const updatedMessages = prev.slice(0, -1);
              // Update the state with the new array
              return updatedMessages;
            } else {
              return prev;
            }
          });
          setLoading(true);
          console.log('log:', secondLastMsg);
          if (secondLastMsg) {
            newSocket.sendMessage({
              text: secondLastMsg.text,
              to: localStorage.getItem('userID'),
              from: localStorage.getItem('phoneNumber'),
              optional: {
                appId: 'AKAI_App_Id',
                channel: 'AKAI',
              },
              asrId: sessionStorage.getItem('asrId'),
              userId: localStorage.getItem('userID'),
              conversationId: sessionStorage.getItem('conversationId'),
            });
          }
        } else {
       
          dispatch(setLoading(false)); 
          dispatch(setIsMsgReceiving(false));   ;
        }
      }, timer2);
      console.log('log:', secondTimer);
    }, timer1);
    console.log('log: called', isMsgReceiving, loading);
    return () => {
      clearTimeout(timer);
      clearTimeout(secondTimer);
    };
    
  }, [isDown, isMsgReceiving, loading, t, timer1, timer2]);

  const values = useMemo(
    () => ({
       sendMessage,
    //  messages,
      setMessages,
    //  loading,
    //  setLoading,
     // isMsgReceiving,
     // setIsMsgReceiving,
      locale,
      setLocale,
      localeMsgs,
      setConversationId,
      newSocket,
    //  isDown,
       fetchIsDown,
      showDialerPopup,
      setShowDialerPopup,
      currentQuery,
      setCurrentQuery,
      playAudio,
      audioElement,
      shareChat,
      clickedAudioUrl,
      downloadChat,
      audioPlaying,
      setAudioPlaying,
      config
    }),
    [
      locale,
      setLocale,
      localeMsgs,
      sendMessage,
      messages,
      loading,
      setLoading,
      isMsgReceiving,
      setIsMsgReceiving,
      setConversationId,
      newSocket,
      isDown,
      fetchIsDown,
      showDialerPopup,
      setShowDialerPopup,
      currentQuery,
      setCurrentQuery,
      playAudio,
      audioElement,
      shareChat,
      clickedAudioUrl,
      downloadChat,
      audioPlaying,
      setAudioPlaying,
      config
    ]
  );
  if (!config) return <FullPageLoader loading label="Loading Configurations..." />;
  return (
    //@ts-ignore
    <AppContext.Provider value={values}>
      <IntlProvider locale={locale} messages={localeMsgs}>
        {children}
      </IntlProvider>
    </AppContext.Provider>
  );
};

