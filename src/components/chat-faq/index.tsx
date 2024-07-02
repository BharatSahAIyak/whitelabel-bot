import React from 'react';
import { useRouter } from 'next/router';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import styles from './index.module.css';
import { useConfig } from '../../hooks/useConfig';
import { useLocalization } from '../../hooks';

interface FAQProps {
  onQuestionClick: (action: string) => void;
}

const FAQ: React.FC<FAQProps> = ({ onQuestionClick }) => {
  const router = useRouter();
  const config = useConfig('component', 'faq');
  const t = useLocalization();

  const questions = [
    { question: t('label.faq_question1'), action: t('label.faq_question1') },
    { question: t('label.faq_question2'), action: t('label.faq_question2') },
    { question: t('label.faq_question3'), action: t('label.faq_question3') },
  ];

  const handleClick = (action: string) => {
    onQuestionClick(action);
  };

  // const handleKnowMoreClick = () => {
  //   if (config.showKnowMoreButton) {
  //     router.push(config.knowMoreButtonLink);
  //   }
  // };

  return (
    <div className={styles.faqContainer}>
      <h3>{t('label.faq_title')}</h3>
      <br />
      {questions.map((item, index) => (
        <div
          key={index}
          className={styles.faqItem}
          onClick={() => handleClick(item.action)}
        >
          <div className={styles.faqBox}>
            <h3>{item.question}</h3>
          </div>
        </div>
      ))}

      {/* {config.showKnowMoreButton && (
        <div className={styles.knowMoreButton}>
          <button onClick={handleKnowMoreClick}>
            {t('label.know_more')} <ArrowForwardIcon />
          </button>
        </div>
      )} */}
    </div>
  );
};

export default FAQ;
