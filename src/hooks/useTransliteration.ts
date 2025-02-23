import { useState, useEffect, useCallback, useContext, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AppContext } from '../context';
import { detectLanguage } from '../utils/detectLang';
import { useConfig } from './useConfig';

const useTransliteration = (config: any, value: any, setValue: any, inputRef: any) => {
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionClicked, setSuggestionClicked] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const context = useContext(AppContext);
  const langPopupConfig = useConfig('component', 'langPopup');
  const isDetectingLanguage = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    if (
      value.length > 0 &&
      config?.allowTransliteration &&
      localStorage.getItem('locale') === config?.transliterationOutputLanguage
    ) {
      if (suggestionClicked) {
        setSuggestionClicked(false);
        return;
      }

      setSuggestions([]);

      const words = value.split(' ');
      const wordUnderCursor = words.find(
        (word: any, index: number) =>
          cursorPosition >= value.indexOf(word) &&
          cursorPosition <= value.indexOf(word) + word.length
      );

      if (!wordUnderCursor) return;

      const data = JSON.stringify({
        inputLanguage: config?.transliterationInputLanguage,
        outputLanguage: config?.transliterationOutputLanguage,
        input: wordUnderCursor,
        provider: config?.transliterationProvider || 'bhashini',
        numSuggestions: config?.transliterationSuggestions || 3,
      });

      const axiosConfig = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${process.env.NEXT_PUBLIC_AI_TOOLS_API}/transliterate`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: data,
        signal: controller.signal,
      };

      axios
        .request(axiosConfig)
        .then((res) => {
          if (controller.signal.aborted) {
            return;
          }

          setSuggestions(res?.data?.suggestions);
          console.log('api suggestions', res?.data?.suggestions);
        })
        .catch((error) => {
          if (error?.code === 'ERR_CANCELED') {
            return;
          } else toast.error('Transliteration failed');
        });
    } else {
      setSuggestions([]);
    }

    return () => controller.abort();
  }, [value, cursorPosition]);

  const suggestionHandler = (index: number) => {
    setActiveSuggestion(index);
  };

  const handleInputChange = (e: any) => {
    const value = e.target.value;
    setValue(value);
    setCursorPosition(e.target.selectionStart);
  };

  const handleLanguageDetection = useCallback(async () => {
    if (isDetectingLanguage.current) return;

    isDetectingLanguage.current = true;
    try {
      const result = await detectLanguage(
        value?.trim()?.split(' ')?.pop() || '',
        langPopupConfig?.provider,
        langPopupConfig?.match
      );

      if (result?.language === langPopupConfig?.match) {
        context?.setShowLanguagePopup(true);
      }
    } finally {
      isDetectingLanguage.current = false;
    }
  }, [value, langPopupConfig, context]);

  const handleKeyDown = useCallback(
    (e: any) => {
      if (e.keyCode === 229) return;
      if (suggestions.length > 0) {
        if (e.code === 'ArrowUp') {
          e.preventDefault();
          setActiveSuggestion((prev) => Math.max(prev - 1, 0));
        } else if (e.code === 'ArrowDown') {
          e.preventDefault();
          setActiveSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === ' ' || e.code === 'Space' || e.keyCode === 32 || e.data === ' ') {
          e.preventDefault();
          if (activeSuggestion >= 0 && activeSuggestion < suggestions.length) {
            suggestionClickHandler(suggestions[activeSuggestion]);
          } else {
            setValue((prev: any) => prev + ' ');
          }
        }
      } else if (e.key === ' ' || e.code === 'Space' || e.keyCode === 32 || e.data === ' ') {
        if (
          context?.languagePopupFlag &&
          langPopupConfig?.langCheck &&
          context?.locale !== langPopupConfig?.lang
        ) {
          handleLanguageDetection();
        }
      }
    },
    [suggestions, activeSuggestion, setValue, context, langPopupConfig, handleLanguageDetection]
  );

  useEffect(() => {
    if (context?.transliterate) {
      const data = JSON.stringify({
        inputLanguage: config?.transliterationInputLanguage,
        outputLanguage: config?.transliterationOutputLanguage,
        input: value,
        provider: config?.transliterationProvider || 'bhashini',
        numSuggestions: config?.transliterationSuggestions || 3,
      });

      const axiosConfig = {
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
        .then((res) => {
          setSuggestions([]);
          setValue(res?.data?.suggestions[0] || value);
          context?.setTransliterate(false);
          console.log('api suggestions', res?.data?.suggestions);
        })
        .catch(() => toast.error('Transliteration failed'));
    }
  }, [context?.transliterate]);

  useEffect(() => {
    let input = document.getElementById('inputBox');
    input?.addEventListener('textInput', handleKeyDown);

    return () => {
      input?.removeEventListener('textInput', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const suggestionClickHandler = useCallback(
    (suggestion: any) => {
      const words = value.split(' ');
      const cursorPos = cursorPosition;
      let currentIndex = 0;
      let selectedWord = '';
      let selectedWordStart = 0;

      for (let word of words) {
        if (currentIndex <= cursorPos && cursorPos <= currentIndex + word.length) {
          selectedWord = word;
          selectedWordStart = currentIndex;
          break;
        }
        currentIndex += word.length + 1; // +1 for space
      }

      if (selectedWord !== '') {
        const spaceAfter = selectedWordStart + selectedWord.length <= value.length ? ' ' : '';
        const newValue =
          value.substring(0, selectedWordStart) +
          suggestion +
          spaceAfter +
          value.substring(selectedWordStart + selectedWord.length);
        setSuggestions([]);
        setSuggestionClicked(true);
        setActiveSuggestion(0);
        setValue(newValue);

        const newCursorPosition = selectedWordStart + suggestion.length + spaceAfter.length;
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
            inputRef.current.focus();
          }
        }, 0);
      }
    },
    [cursorPosition, value, setValue]
  );

  return {
    suggestions,
    activeSuggestion,
    handleInputChange,
    suggestionClickHandler,
    suggestionHandler,
    setActiveSuggestion,
    handleKeyDown,
  };
};

export default useTransliteration;
