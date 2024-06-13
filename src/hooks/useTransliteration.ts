import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const useTransliteration = (config: any) => {
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionClicked, setSuggestionClicked] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<any>(null);

  useEffect(() => {
    if (inputValue.length > 0 && config?.allowTransliteration && localStorage.getItem('locale') === config?.transliterationOutputLanguage) {
      if (suggestionClicked) {
        setSuggestionClicked(false);
        return;
      }

      setSuggestions([]);

      const words = inputValue.split(' ');
      const wordUnderCursor = words.find(
        (word, index) => cursorPosition >= inputValue.indexOf(word) && cursorPosition <= inputValue.indexOf(word) + word.length
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
      };

      axios.request(axiosConfig)
        .then((res) => setSuggestions(res?.data?.suggestions))
        .catch(() => toast.error('Transliteration failed'));
    } else {
      setSuggestions([]);
    }
  }, [inputValue, cursorPosition, suggestionClicked, config]);

  const handleInputChange = (e: any) => {
    const value = e.target.value;
    setInputValue(value);
    setCursorPosition(e.target.selectionStart);
  };

  const handleKeyDown = useCallback((e: any) => {
    if (suggestions.length > 0) {
      if (e.code === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestion((prev) => Math.max(prev - 1, 0));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1));
      } else if (e.key === ' ') {
        e.preventDefault();
        if (activeSuggestion >= 0 && activeSuggestion < suggestions.length) {
          suggestionClickHandler(suggestions[activeSuggestion]);
        } else {
          setInputValue((prev) => prev + ' ');
        }
      }
    }
  }, [suggestions, activeSuggestion]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const suggestionClickHandler = useCallback((suggestion: any) => {
    const words = inputValue.split(' ');
    const cursorPos = cursorPosition;
    let currentIndex = 0;
    let selectedWord = '';

    for (let word of words) {
      if (currentIndex <= cursorPos && cursorPos <= currentIndex + word.length) {
        selectedWord = word;
        break;
      }
      currentIndex += word.length + 1; // +1 for space
    }

    if (selectedWord !== '') {
      const newValue = inputValue.replace(selectedWord, cursorPos === inputValue.length ? suggestion + ' ' : suggestion);
      setSuggestions([]);
      setSuggestionClicked(true);
      setActiveSuggestion(0);
      setInputValue(newValue);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [inputValue, cursorPosition]);

  return {
    inputRef,
    inputValue,
    suggestions,
    activeSuggestion,
    handleInputChange,
    suggestionClickHandler,
    setActiveSuggestion,
    handleKeyDown
  };
};

export default useTransliteration;
