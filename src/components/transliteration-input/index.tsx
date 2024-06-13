import useTransliteration from '../../hooks/useTransliteration';
import TextField from '@mui/material/TextField';
import styles from './index.module.css';
import { useEffect } from 'react';

const TransliterationInput = ({ config, placeholder, multiline = false, rows = 1, cols = 35, ...props }: any) => {
  const {
    inputRef,
    inputValue,
    suggestions,
    activeSuggestion,
    handleInputChange,
    suggestionClickHandler,
    setActiveSuggestion,
    handleKeyDown
  } = useTransliteration(config);

  const suggestionHandler = (index: number) => {
    setActiveSuggestion(index);
  };

    useEffect(() => {
    let input = document.getElementById('inputBox');
    input?.addEventListener('textInput', handleKeyDown);

    return () => {
      input?.removeEventListener('textInput', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className={styles.container}>
      <div className={styles.suggestions}>
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            onClick={() => suggestionClickHandler(suggestion)}
            className={`${styles.suggestion} ${activeSuggestion === index ? styles.active : ''}`}
            onMouseEnter={() => suggestionHandler(index)}
          >
            {suggestion}
          </div>
        ))}
      </div>
      <TextField
        inputRef={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        variant="outlined"
        fullWidth
        multiline={multiline}
        rows={multiline ? rows : 1}
        inputProps={{ style: { width: `${cols * 8}px` } }}
        {...props}
      />
    </div>
  );
};

export default TransliterationInput;
