'use client';
import styles from './index.module.css';
import Image from 'next/image';
import { useLocalization } from '../../hooks';
import { useFlags } from 'flagsmith/react';
import CallIcon from '../../assets/icons/call-icon';
import router from 'next/router';
import { useConfig } from '../../hooks/useConfig';
import { useMemo } from 'react';

function DownTimePage() {
  const t = useLocalization();
  const flags = useFlags(['dialer_number']);

  const secondaryColorConfig = useConfig('theme','secondaryColor');
  const secondaryColor = useMemo(() => {
    return secondaryColorConfig?.value;
  }, [secondaryColorConfig]);
  
  return (
    <div className={styles.container}>
      <div className={styles.title}>{t('message.down_time_title')}</div>
      <div className={styles.imageContainer}>
        {/* Contains the down time gif in css */}
      </div>
      <span>{t('message.temporarily_down')}</span>
      {/* <p className={styles.miniText}>
        {t("message.temporarily_down_description")}
      </p> */}
      <div className={styles.dialerBox}>
        <a
          href={`tel:${flags.dialer_number.value}`}
          className={styles.footerTitle}>
          <div className={styles.callIconBox}>
            <CallIcon color={secondaryColor} />
          </div>
          <p style={{ textDecoration: 'underline' }}>
            {t('label.call_bot')}
          </p>
        </a>
      </div>

      <div className={styles.buttons}>
        <button
          type="button"
          className={styles.retryButton}
          onClick={() => window?.location.reload()}>
          {t('message.down_time_retry')}
        </button>
        <button
          type="button"
          className={styles.viewPrevChatsButton}
          onClick={() => {
            router.push('/history');
          }}>
          {t('message.down_time_view_prev_chats')}
        </button>
      </div>
    </div>
  );
}

export default DownTimePage;
