import styles from './index.module.css';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { NextPage } from 'next';
import axios from 'axios';
import { AppContext } from '../../context';
import SendIcon from '../../assets/images/sendButton.png';
// import reloadIcon from '../../assets/icons/reload.svg';
import { useLocalization } from '../../hooks';
import router from 'next/router';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import RenderVoiceRecorder from '../recorder/RenderVoiceRecorder';
import { recordUserLocation } from '../../utils/location';
import { useConfig } from '../../hooks/useConfig';
import DowntimePage from '../../pageComponents/downtime-page';
import { useColorPalates } from '../../providers/theme-provider/hooks';

const HomePage: NextPage = () => {
  const context = useContext(AppContext);
  const config = useConfig('component', 'chatUI');
  const theme = useColorPalates();
  const t = useLocalization();
  const inputRef = useRef(null);
  const placeholder = useMemo(() => t('message.ask_ur_question'), [t]);
  const [inputMsg, setInputMsg] = useState('');
  const voiceRecorderRef = useRef(null);
  const chatBoxButton = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionClicked, setSuggestionClicked] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<number>(0);
  const [cursorPosition, setCursorPosition] = useState(0);

  const suggestionHandler = (e: any, index: number) => {
    setActiveSuggestion(index);
  };

  useEffect(() => {
    if (inputMsg.length > 0 && config?.allowTransliteration) {
      if (suggestionClicked) {
        setSuggestionClicked(false);
        return;
      }

      setSuggestions([]);

      const words = inputMsg.split(' ');
      const wordUnderCursor = words.find(
        (word, index) =>
          cursorPosition >= inputMsg.indexOf(word) &&
          cursorPosition <= inputMsg.indexOf(word) + word.length
      );

      if (!wordUnderCursor) return;
      let data = JSON.stringify({
        inputLanguage:  config?.transliterationInputLanguage || 'en',
        outputLanguage: config?.transliterationOutputLanguage || 'or',
        input: wordUnderCursor,
        provider: config?.transliterationProvider || 'bhashini',
        numSuggestions: config?.transliterationSuggestions || 3,
      });

      let axiosConfig = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${process.env.NEXT_PUBLIC_AI_TOOLS_API}/transliterate`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: data,
      };

      axios
        .request(axiosConfig)
        .then((res: any) => {
          // console.log("hurray", res?.data?.output?.[0]?.target);
          setSuggestions(res?.data?.suggestions);
        })
        .catch((err) => {
          console.log(err);
          toast.error('Bhashini transliteration failed');
        });
    } else {
      setSuggestions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputMsg, cursorPosition]);

  // useEffect(() => {
  //   setMessages([getInitialMsgs(t, flags, context?.locale)]);
  // }, [t, context?.locale, flags]);

  useEffect(() => {
    context?.fetchIsDown(); // check if server is down

    if (!sessionStorage.getItem('conversationId')) {
      const newConversationId = uuidv4();
      sessionStorage.setItem('conversationId', newConversationId);
      context?.setConversationId(newConversationId);
    }
    recordUserLocation();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = useCallback(
    async (msg: string) => {
      if (msg.length === 0) {
        toast.error(t('error.empty_msg'));
        return;
      }
      if (context?.newSocket?.socket?.connected) {
        console.log('clearing mssgs');
        context?.setMessages([]);
        router.push('/chat');
        context?.sendMessage(msg);
      } else {
        toast.error(t('error.disconnected'));
        return;
      }
    },
    [context, t]
  );

  const handleInputChange = (e: any) => {
    const inputValue = e.target.value;
    setInputMsg(inputValue);
    // Store the cursor position
    const cursorPosition = e.target.selectionStart;
    setCursorPosition(cursorPosition);
    // setShowExampleMessages(inputValue.length === 0);
    // Adjust textarea height dynamically based on content
    if (inputRef.current) {
      //@ts-ignore
      inputRef.current.style.height = 'auto';
      //@ts-ignore
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  };

  const handleDocumentClick = useCallback((event: any) => {
    const target = event.target;

    // Check if clicked outside voiceRecorder and exampleMessages
    if (
      //@ts-ignore
      !voiceRecorderRef.current?.contains(target) &&
      //@ts-ignore
      !chatBoxButton.current?.contains(target)
    ) {
      // setShowExampleMessages(false);
      setSuggestions([]);
      // setShowChatBox(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleDocumentClick);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [handleDocumentClick]);

  const suggestionClickHandler = useCallback(
    (e: any) => {
      const words = inputMsg.split(' ');

      // Find the word at the cursor position
      //@ts-ignore
      const cursorPosition = inputRef.current.selectionStart;
      let currentIndex = 0;
      let selectedWord = '';

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (
          currentIndex <= cursorPosition &&
          cursorPosition <= currentIndex + word.length
        ) {
          selectedWord = word;
          break;
        }
        currentIndex += word.length + 1; // +1 to account for the space between words
      }

      // Replace the selected word with the transliterated suggestion
      if (selectedWord !== '') {
        const newInputMsg = inputMsg.replace(
          selectedWord,
          cursorPosition === inputMsg.length ? e + ' ' : e
        );

        setSuggestions([]);
        setSuggestionClicked(true);
        setActiveSuggestion(0);

        setInputMsg(newInputMsg);

        //@ts-ignore
        inputRef.current && inputRef.current.focus();
      }
    },
    [inputMsg]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (suggestions.length > 0) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveSuggestion((prevActiveSuggestion) =>
            prevActiveSuggestion > 0
              ? prevActiveSuggestion - 1
              : prevActiveSuggestion
          );
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setActiveSuggestion((prevActiveSuggestion) =>
            prevActiveSuggestion < suggestions.length - 1
              ? prevActiveSuggestion + 1
              : prevActiveSuggestion
          );
        } else if (e.key === ' ') {
          e.preventDefault();
          if (activeSuggestion >= 0 && activeSuggestion < suggestions?.length) {
            suggestionClickHandler(suggestions[activeSuggestion]);
          } else {
            setInputMsg((prevInputMsg) => prevInputMsg + ' ');
          }
        }
      }
    },
    [activeSuggestion, suggestionClickHandler, suggestions]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const secondaryColor = useMemo(() => {
    return theme?.primary?.main;
  }, [theme?.primary?.main]);

  if (context?.isDown) {
    return <DowntimePage />;
  } else
    return (
      <>
        <div className={styles.main} onClick={handleDocumentClick}>
          <div className={styles.title} style={{ color: secondaryColor }}>
            {t('label.ask_me')}
          </div>
          <div className={styles.voiceRecorder} ref={voiceRecorderRef}>
            <RenderVoiceRecorder setInputMsg={setInputMsg} tapToSpeak={true} />
          </div>

          <form onSubmit={(event) => event?.preventDefault()}>
            <div
              ref={chatBoxButton}
              className={`${`${styles.inputBox} ${styles.inputBoxOpen}`}`}>
              <div className={styles.suggestions}>
                {suggestions.map((elem, index) => {
                  return (
                    <div
                      key={index}
                      onClick={() => suggestionClickHandler(elem)}
                      className={`${styles.suggestion} ${
                        activeSuggestion === index ? styles.active : ''
                      }`}
                      onMouseEnter={(e) => suggestionHandler(e, index)}>
                      {elem}
                    </div>
                  );
                })}
              </div>
              <textarea
                ref={inputRef}
                rows={1}
                value={inputMsg}
                onChange={handleInputChange}
                placeholder={placeholder}
              />
              <button type="submit" className={styles.sendButton}>
                <Image
                  src={SendIcon}
                  width={50}
                  height={50}
                  alt="sendIcon"
                  onClick={() => sendMessage(inputMsg)}
                />
              </button>
            </div>
          </form>
        </div>
      </>
    );
};
export default HomePage;
