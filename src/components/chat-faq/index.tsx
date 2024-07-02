import React from 'react';
import { useRouter } from 'next/router';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import styles from './index.module.css';
import { useConfig } from '../../hooks/useConfig';
import { useLocalization } from '../../hooks';

interface FAQProps {
  onQuestionClick: (question: string) => void;
}
const FAQ: React.FC<FAQProps> = ({ onQuestionClick }) => {
  const router = useRouter();
  const config = useConfig('component', 'faq');
  const t = useLocalization();

  const handleClick = (question: string) => {
    const item = config.faqItems.find(
      (item: { question: string }) => item.question === question
    );
    if (item) {
      onQuestionClick(item.action);
    }
  };

  const handleKnowMoreClick = () => {
    if (config.showKnowMoreButton) {
      router.push(config.knowMoreButtonLink);
    }
  };

  return (
    <div className={styles.faqContainer}>
      {config.showFAQTitle && <h3>{t('label.faqTitle')}</h3>}
      <br />
      {config.faqItems.map(
        (item: { question: string }, index: React.Key | null | undefined) => (
          <div
            key={index}
            className={styles.faqItem}
            onClick={() => handleClick(item.question)}
          >
            <div className={styles.faqBox}>
              <h3>{t(`label.faqQuestion${index + 1}`)}</h3>
            </div>
          </div>
        )
      )}

      {config.showKnowMoreButton && (
        <div className={styles.knowMoreButton}>
          <button onClick={handleKnowMoreClick}>
            {t('label.knowMore')} <ArrowForwardIcon />
          </button>
        </div>
      )}
    </div>
  );
};

export default FAQ;
