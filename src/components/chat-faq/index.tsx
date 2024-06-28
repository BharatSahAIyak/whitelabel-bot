// Needed

import React from 'react';
import { useRouter } from 'next/router';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import styles from './index.module.css';

interface FAQProps {
  onQuestionClick: (question: string) => void;
}

const FAQ: React.FC<FAQProps> = ({ onQuestionClick }) => {
  const router = useRouter();

  const handleClick = (question: string) => {
    onQuestionClick(question);
  };

  const handleKnowMoreClick = () => {
    router.push('/faq');
  };

  return (
    <div className={styles.faqContainer}>
      <h3>Frequently Asked Questions</h3>
      <br></br>
      <div
        className={styles.faqItem}
        onClick={() => handleClick('Ask me more about Crops')}
      >
        <div className={styles.faqBox}>
          <h3>Ask me more about Crops</h3>
        </div>
      </div>
      <div
        className={styles.faqItem}
        onClick={() => handleClick('Ask about schemes?')}
      >
        <div className={styles.faqBox}>
          <h3>Ask about schemes?</h3>
        </div>
      </div>
      <div
        className={styles.faqItem}
        onClick={() => handleClick('What is the weather now?')}
      >
        <div className={styles.faqBox}>
          <h3>What is the weather now?</h3>
        </div>
      </div>
      <div className={styles.knowMoreButton}>
        <button onClick={handleKnowMoreClick}>
          Know More <ArrowForwardIcon />
        </button>
      </div>
    </div>
  );
};

export default FAQ;
