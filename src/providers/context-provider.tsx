'use client';
import {
  FC,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppContext } from '../context';
import _ from 'underscore';
import { v4 as uuidv4 } from 'uuid';
import { IntlProvider } from 'react-intl';
import { useLocalization } from '../hooks';
import toast from 'react-hot-toast';
import flagsmith from 'flagsmith/isomorphic';
import axios from 'axios';
import { useFlags } from 'flagsmith/react';
import { useCookies } from 'react-cookie';
import { UCI } from 'socket-package';

import mergeConfigurations from '../utils/mergeConfigurations';
import { FullPageLoader } from '../components/fullpage-loader';
import LaunchPage from '../pageComponents/launch-page';

const URL = process.env.NEXT_PUBLIC_SOCKET_URL || '';

const ContextProvider: FC<{
  locale: any;
  localeMsgs: any;
  setLocale: any;
  children: ReactElement;
  setLocaleMsgs:any;
}> = ({ locale, children, localeMsgs, setLocale,setLocaleMsgs }) => {
  const t = useLocalization();
  const flags = useFlags(['health_check_time']);
  const [loading, setLoading] = useState(false);
  const [isMsgReceiving, setIsMsgReceiving] = useState(false);
  const [messages, setMessages] = useState<Array<any>>([]);
  const [newSocket, setNewSocket] = useState<any>();
  const [showLaunchPage, setShowLaunchPage] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(
    sessionStorage.getItem('conversationId')
  );
  const timer1 = flagsmith.getValue('timer1', { fallback: 30000 });
  const timer2 = flagsmith.getValue('timer2', { fallback: 45000 });
  const audio_playback = flagsmith.getValue('audio_playback', {
    fallback: 1.5,
  });
  const [isDown, setIsDown] = useState(false);
  const [showDialerPopup, setShowDialerPopup] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  // const [isConnected, setIsConnected] = useState(newSocket?.connected || false);
  const [cookie, setCookie, removeCookie] = useCookies();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [audioElement, setAudioElement] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(true);
  const [clickedAudioUrl, setClickedAudioUrl] = useState<string | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [endTime, setEndTime] = useState(Date.now());
  const [lastMsgId, setLastMsgId] = useState('');
  const [kaliaClicked, setKaliaClicked] = useState(false);
  const [config, setConfig] = useState(null);

  // const configs = useMergeConfigurations();
  // console.log("hola:",{configs})
  useEffect(() => {
    mergeConfigurations().then(setConfig);
  }, []);


  useEffect(()=>{
    //@ts-ignore
    if(config?.component?.launchPage){
      setShowLaunchPage(true);
      setTimeout(()=>{
        setShowLaunchPage(false);;
      },2000)
    }
  },[config])
  console.log('maaki:', { config ,locale});

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
useEffect(()=>{
  //@ts-ignore
  if(config?.translation){
    onLocaleUpdate()
  }
},[config])
  const onLocaleUpdate = useCallback(() => {
    //@ts-ignore
    // setLocaleMsgs(config?.translation?.[locale]);
    //@ts-ignore
   setLocaleMsgs(config?.translation?.['en']);
  },[config])
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
        .then((res) => {})
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
      setLoading(false);
      setIsMsgReceiving(false);
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
    // if (localStorage.getItem('userID') && localStorage.getItem('auth')) {
    setNewSocket(
      new UCI(
        URL,
        {
          transportOptions: {
            polling: {
              extraHeaders: {
                // Authorization: `Bearer ${localStorage.getItem('auth')}`,
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
    // }
    function cleanup() {
      if (newSocket)
        newSocket.onDisconnect(() => {
          console.log('Socket disconnected');
        });
    }
    return cleanup;
  }, []);

  const updateMsgState = useCallback(
    async ({ msg, media }: { msg: any; media: any }) => {
      console.log('updatemsgstate:', msg);
      if (
        msg?.payload?.text &&
        msg?.messageId?.Id &&
        msg?.messageId?.channelMessageId
      ) {
        if (
          sessionStorage.getItem('conversationId') ===
          msg.messageId.channelMessageId
        ) {
          const word = msg.payload.text;

          setMessages((prev: any) => {
            const updatedMessages = [...prev];
            const existingMsgIndex = updatedMessages.findIndex(
              (m: any) => m.messageId === msg.messageId.Id
            );
            console.log('existingMsgIndex', existingMsgIndex);

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
                choices: msg?.payload?.buttonChoices,
                position: 'left',
                reaction: 0,
                messageId: msg?.messageId.Id,
                conversationId: msg.messageId.channelMessageId,
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
            return updatedMessages;
          });
          setIsMsgReceiving(false);
          if (msg.payload.text.endsWith('<end/>')) {
            setLastMsgId(msg?.messageId.Id);
            setEndTime(Date.now());
          }
          setLoading(false);
        }
      }
    },
    []
  );


  // TODO: add message received telemetry once confirmed when full message is received 
  // const telemetryApi =
  //   process.env.NEXT_PUBLIC_TELEMETRY_API + '/metrics/v1/save' || '';
  // useEffect(() => {
  //   const postTelemetry = async () => {
  //     console.log('MESSAGE:', messages);
  //     try {
  //       await axios.post(telemetryApi, [
  //         {
  //           generator: 'pwa',
  //           version: '1.0',
  //           timestamp: new Date().getTime(),
  //           actorId: localStorage.getItem('userID') || '',
  //           actorType: 'user',
  //           env: 'prod',
  //           eventId: 'E037',
  //           event: 'messageQuery',
  //           subEvent: 'messageReceived',
  //           os:
  //             // @ts-ignore
  //             window.navigator?.userAgentData?.platform ||
  //             window.navigator.platform,
  //           browser: window.navigator.userAgent,
  //           ip: sessionStorage.getItem('ip') || '',
  //           // @ts-ignore
  //           deviceType: window.navigator?.userAgentData?.mobile
  //             ? 'mobile'
  //             : 'desktop',
  //           eventData: {
  //             botId: process.env.NEXT_PUBLIC_BOT_ID || '',
  //             userId: localStorage.getItem('userID') || '',
  //             phoneNumber: localStorage.getItem('phoneNumber') || '',
  //             conversationId: sessionStorage.getItem('conversationId') || '',
  //             messageId: messages[messages.length - 1]?.messageId,
  //             text: messages[messages.length - 1]?.text,
  //             createdAt: new Date().getTime(),
  //             timeTaken: endTime - startTime,
  //           },
  //         },
  //       ]);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };
  //   postTelemetry();
  // }, [endTime]);

  console.log('erty:', { conversationId });

  const onMessageReceived = useCallback(
    async (msg: any) => {
      // if (!msg?.content?.id) msg.content.id = '';
      if (msg.messageType.toUpperCase() === 'IMAGE') {
        if (
          // msg.content.timeTaken + 1000 < timer2 &&
          isOnline
        ) {
          await updateMsgState({
            msg: msg,
            media: { imageUrls: msg?.content?.media_url },
          });
        }
      } else if (msg.messageType.toUpperCase() === 'AUDIO') {
        updateMsgState({
          msg,
          media: { audioUrl: msg?.content?.media_url },
        });
      } else if (msg.messageType.toUpperCase() === 'HSM') {
        updateMsgState({
          msg,
          media: { audioUrl: msg?.content?.media_url },
        });
      } else if (msg.messageType.toUpperCase() === 'VIDEO') {
        updateMsgState({
          msg,
          media: { videoUrl: msg?.content?.media_url },
        });
      } else if (
        msg.messageType.toUpperCase() === 'DOCUMENT' ||
        msg.messageType.toUpperCase() === 'FILE'
      ) {
        updateMsgState({
          msg,
          media: { fileUrl: msg?.content?.media_url },
        });
      } else if (msg.messageType.toUpperCase() === 'TEXT') {
        if (
          // msg.content.timeTaken + 1000 < timer2 &&
          isOnline
        ) {
          await updateMsgState({
            msg: msg,
            media: null,
          });
        }
      }
    },
    [isOnline, updateMsgState]
  );

  useEffect(() => {
    if (!lastMsgId) return;
    const timeDiff = endTime - startTime;
    console.log('time taken', timeDiff);
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

  //@ts-ignore
  const sendMessage = useCallback(
    async (text: string, media: any, isVisibile = true) => {
      if (!sessionStorage.getItem('conversationId')) {
        const cId = uuidv4();
        console.log('convId', cId);
        setConversationId(() => {
          sessionStorage.setItem('conversationId', cId);
          return cId;
        });
      } else sessionStorage.setItem('conversationId', conversationId || '');
      // if (!localStorage.getItem('userID')) {
      //   removeCookie('access_token', { path: '/' });
      //   location?.reload();
      //   return;
      // }
      // console.log('mssgs:', messages)
      setLoading(true);
      setIsMsgReceiving(true);

      console.log('my mssg:', text);
      newSocket.sendMessage({
        text: text?.replace('&', '%26'),
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
          botId: process.env.NEXT_PUBLIC_BOT_ID || '',
        },
      });
      const messageId = uuidv4();
      
      setStartTime(Date.now());
      if (isVisibile)
        if (media) {
          if (media.mimeType.slice(0, 5) === 'image') {
          } else if (media.mimeType.slice(0, 5) === 'audio' && isVisibile) {
          } else if (media.mimeType.slice(0, 5) === 'video') {
          } else if (media.mimeType.slice(0, 11) === 'application') {
          } else {
          }
        } else {
          //console.log('mssgs:',messages)
          //@ts-ignore
          setMessages((prev: any) => [
            ...prev.map((prevMsg: any) => ({ ...prevMsg, disabled: true })),
            {
              text: text,
              position: 'right',
              payload: { text },
              time: Date.now(),
              disabled: true,
              messageId: messageId,
              repliedTimestamp: Date.now(),
            },
          ]);
          sessionStorage.removeItem('asrId');
        }
        try {
          const telemetryApi =
            process.env.NEXT_PUBLIC_TELEMETRY_API + '/metrics/v1/save' || '';
          await axios.post(telemetryApi, [
            {
              generator: 'pwa',
              version: '1.0',
              timestamp: new Date().getTime(),
              actorId: localStorage.getItem('userID') || '',
              actorType: 'user',
              env: 'prod',
              eventId: 'E036',
              event: 'messageQuery',
              subEvent: 'messageSent',
              os:
                // @ts-ignore
                window.navigator?.userAgentData?.platform ||
                window.navigator.platform,
              browser: window.navigator.userAgent,
              ip: sessionStorage.getItem('ip') || '',
              // @ts-ignore
              deviceType: window.navigator?.userAgentData?.mobile
                ? 'mobile'
                : 'desktop',
              eventData: {
                botId: process.env.NEXT_PUBLIC_BOT_ID || '',
                userId: localStorage.getItem('userID') || '',
                phoneNumber: localStorage.getItem('phoneNumber') || '',
                conversationId: sessionStorage.getItem('conversationId') || '',
                messageId: messageId,
                text: text,
                createdAt: new Date().getTime(),
              },
            },
          ], {
            headers: {
              orgId: process.env.NEXT_PUBLIC_ORG_ID || ''
            }
          });
        } catch (err) {
          console.error(err);
        }
    },
    [conversationId, newSocket, removeCookie]
  );

  const fetchIsDown = useCallback(async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BFF_API_URL}/health/${flags?.health_check_time?.value}`
      );
      const status = res.data.status;
      console.log('hie', status);
      if (status === 'OK') {
        setIsDown(false);
      } else {
        setIsDown(true);
        console.log('Server status is not OK');
      }
    } catch (error: any) {
      console.error(error);
    }
  }, [flags?.health_check_time?.value]);

  // Remove ASR ID from session storage on conversation change
  useEffect(() => {
    sessionStorage.removeItem('asrId');
  }, [conversationId]);

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
          },
        ].filter(Boolean)
      );

    console.log('historyyy', history);
    console.log('history length:', history.length);

    return history;
  };

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
        toast.loading('message.taking_longer', {duration: 3000});
      }
      secondTimer = setTimeout(async () => {
        fetchIsDown();
        console.log('log: here');
        if (loading) {
          console.log('log:', loading);
          try {
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

            if (!chatHistory.data[chatHistory.data.length - 1].response) {
              chatHistory.data[chatHistory.data.length - 1].response = `${t(
                'message.no_signal'
              )}`;
            }
            const normalizedChats = normalizedChat(chatHistory);
            console.log('normalized chats', normalizedChats);
            if (normalizedChats.length > 0) {
              setIsMsgReceiving(false);
              setLoading(false);
              setMessages(normalizedChats);
            }
          } catch (error: any) {
            setIsMsgReceiving(false);
            setLoading(false);
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
          setLoading(false);
          setIsMsgReceiving(false);
        }
      }, timer2);
      console.log('log:', secondTimer);
    }, timer1);
    console.log('log: called', isMsgReceiving, loading);
    return () => {
      clearTimeout(timer);
      clearTimeout(secondTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDown, isMsgReceiving, loading, t, timer1, timer2]);

  const values = useMemo(
    () => ({
      sendMessage,
      messages,
      setMessages,
      loading,
      setLoading,
      isMsgReceiving,
      setIsMsgReceiving,
      locale,
      setLocale,
      localeMsgs,
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
      config,
      kaliaClicked,
      setKaliaClicked
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
      config,
      kaliaClicked,
      setKaliaClicked
    ]
  );
 
 
  if (!config) return <FullPageLoader loading label='Loading configuration..' />
  //@ts-ignore
  if(showLaunchPage) return <LaunchPage theme={config?.theme} config={config?.component?.launchPage}/>;
  return (
    //@ts-ignore
    <AppContext.Provider value={values}>
        {children}
    </AppContext.Provider>
  );
};

export default ContextProvider;