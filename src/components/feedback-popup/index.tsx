import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import crossIcon from '../../assets/icons/crossIcon.svg';
import styles from './index.module.css';
import Image from 'next/image';
import { useLocalization } from '../../hooks';
import { AppContext } from '../../context';
import { MessageType, XMessage } from '@samagra-x/xmessage';
import { useConfig } from '../../hooks/useConfig';
import axios from 'axios';
import toast from 'react-hot-toast';

const FeedbackPopup: React.FC<any> = ({ setShowFeedbackPopup }) => {
  const t = useLocalization();
  const config = useConfig('component', 'chatUI');
  const [reviewSubmitted, reviewSubmitError] = useMemo(
    () => [t('message.review_submitted'), t('error.fail_to_submit_review')],
    [t]
  );
  const context = useContext(AppContext);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionClicked, setSuggestionClicked] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<number>(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [review, setReview] = useState('');
  const inputRef = useRef(null);

  const negativeFeedbackPayload = {
    app: process.env.NEXT_PUBLIC_BOT_ID || '',
    messageType: MessageType.FEEDBACK_NEGATIVE,
    messageId: {
      replyId: context?.currentQuery,
      channelMessageId: sessionStorage.getItem('conversationId'),
    },
    from: {
      userID: localStorage.getItem('userID'),
    },
  } as Partial<XMessage>;

  const submitReview = useCallback(
    (r: string) => {
      context?.newSocket.sendMessage({
        payload: {
          payload: {
            text: r,
          },
          ...negativeFeedbackPayload,
        } as Partial<XMessage>
      });
      context?.setCurrentQuery('');
      setShowFeedbackPopup(false);
    },
    [reviewSubmitError, reviewSubmitted, setShowFeedbackPopup]
  );
  const suggestionHandler = (e: any, index: number) => {
    setActiveSuggestion(index);
  };

  const suggestionClickHandler = useCallback(
    (e: any) => {
      const words = review.split(' ');

      // Find the word at the cursor position
      //@ts-ignore
      const cursorPosition = inputRef.current.selectionStart;
      let currentIndex = 0;
      let selectedWord = '';

      // console.log(cursorPosition, inputMsg.length);

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
        const newInputMsg = review.replace(
          selectedWord,
          cursorPosition === review.length ? e + ' ' : e
        );

        setSuggestions([]);
        setSuggestionClicked(true);
        setActiveSuggestion(0);

        setReview(newInputMsg);

        //@ts-ignore
        inputRef.current && inputRef.current.focus();
      }
    },
    [review]
  );

  const handleKeyDown = useCallback(
    (e: any) => {
      if (e.keyCode === 229) return;
      // console.log(e);
      if (suggestions.length > 0) {
        if (e.code === 'ArrowUp') {
          e.preventDefault();
          setActiveSuggestion((prevActiveSuggestion) =>
            prevActiveSuggestion > 0
              ? prevActiveSuggestion - 1
              : prevActiveSuggestion
          );
        } else if (e.code === 'ArrowDown') {
          e.preventDefault();
          setActiveSuggestion((prevActiveSuggestion) =>
            prevActiveSuggestion < suggestions.length - 1
              ? prevActiveSuggestion + 1
              : prevActiveSuggestion
          );
        } else if (e.data === ' ') {
          e.preventDefault && e.preventDefault();
          if (activeSuggestion >= 0 && activeSuggestion < suggestions?.length) {
            suggestionClickHandler(suggestions[activeSuggestion]);
          } else {
            setReview((prevInputMsg) => prevInputMsg + ' ');
          }
        }
      }
    },
    [activeSuggestion, suggestionClickHandler, suggestions]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    let input = document.getElementById('inputBox');
    input?.addEventListener('textInput', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      input?.removeEventListener('textInput', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (
      review.length > 0 &&
      config?.allowTransliteration &&
      localStorage.getItem('locale') ===
        config?.transliterationOutputLanguage
    ) {
      if (suggestionClicked) {
        setSuggestionClicked(false)
        return
      }

      setSuggestions([])

      const words = review.split(' ')
      const wordUnderCursor = words.find(
        (word, index) =>
          cursorPosition >= review.indexOf(word) &&
          cursorPosition <= review.indexOf(word) + word.length
      )

      if (!wordUnderCursor) return
      let data = JSON.stringify({
        inputLanguage: config?.transliterationInputLanguage,
        outputLanguage: config?.transliterationOutputLanguage,
        input: wordUnderCursor,
        provider: config?.transliterationProvider || 'bhashini',
        numSuggestions: config?.transliterationSuggestions || 3,
      })

      let axiosConfig = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${process.env.NEXT_PUBLIC_AI_TOOLS_API}/transliterate`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: data,
      }

      axios
        .request(axiosConfig)
        .then((res: any) => {
          // console.log("hurray", res?.data?.output?.[0]?.target);
          setSuggestions(res?.data?.suggestions)
        })
        .catch((err) => {
          console.log(err)
          toast.error('Transliteration failed')
        })
    } else {
      setSuggestions([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [review, cursorPosition])

  const handleInputChange = (e: any) => {
    const inputValue = e.target.value;
    setReview(inputValue);
    // Store the cursor position
    const cursorPosition = e.target.selectionStart;
    setCursorPosition(cursorPosition);
    // Adjust textarea height dynamically based on content
    if (inputRef.current) {
      //@ts-ignore
      inputRef.current.style.height = 'auto';
      //@ts-ignore
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className={styles.main}>
      <div
        className={styles.crossIconBox}
        onClick={() => {
          context?.setCurrentQuery('');
          setShowFeedbackPopup(false);
          context?.newSocket.sendMessage({
            payload: {
              ...negativeFeedbackPayload
            } as Partial<XMessage>
          });
        }}>
        <Image src={crossIcon} alt="crossIcon" layout="responsive" />
      </div>
      <p>{t('label.comment')}</p>
      <div className={styles.feedbackBox}>
      <div className={styles.suggestions}>
          {suggestions.map((elem, index) => {
            return (
              <div
                key={index}
                onClick={() => suggestionClickHandler(elem)}
                className={`${styles.suggestion} ${activeSuggestion === index ? styles.active : ''
                  }`}
                onMouseEnter={(e) => suggestionHandler(e, index)}>
                {elem}
              </div>
            );
          })}
        </div>
        <textarea
          data-testid="feedback-popup-box"
          ref={inputRef}
          value={review}
          onChange={handleInputChange}
          name="experience-feedback"
          id="inputBox"
          cols={35}
          rows={5}
          placeholder={t('message.comment_description')}></textarea>

        <button onClick={() => submitReview(review)} data-testid="feedback-popup-button">
          {t('label.submit_feedback')}
        </button>
      </div>
    </div>
  );
};

export default FeedbackPopup;
