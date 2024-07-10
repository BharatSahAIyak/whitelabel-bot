import React from 'react';
import { useRouter } from 'next/router';
import HomeIcon from '@mui/icons-material/Home';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import MicNoneIcon from '@mui/icons-material/MicNone';
import Button from '@mui/material/Button';
import styles from './style.module.css';
import { useLocalization } from '../../hooks';

const Menu = () => {
  const router = useRouter();
  const t = useLocalization();
  const isHome = router.pathname === '/';

  const handleHomeClick = () => {
    router.push('/');
  };

  const handleNotificationClick = () => {};

  const handleTouchToSpeakClick = () => {
    router.push('/newchat?voice=true');
  };

  return (
    <div className={styles.footer}>
      <div className={styles.buttonWrapper} data-testid="menu-home-button">
        <Button onClick={handleHomeClick} className={`${styles.greenButton}`}>
          {isHome ? <HomeIcon fontSize="large" /> : <HomeOutlinedIcon fontSize="large" />}
        </Button>
        <p className={styles.buttonText}>{t('label.menu_home')}</p>
      </div>
      <div className={styles.middleButton} data-testid="menu-mic-button">
        <Button
          onClick={handleTouchToSpeakClick}
          className={`${styles.touchToSpeakButton}`}
          startIcon={<MicNoneIcon fontSize="inherit" />}
        >
          {t('label.menu_tap_text')}
        </Button>
      </div>
      <div className={styles.buttonWrapper} data-testid="menu-notification-button">
        <Button onClick={handleNotificationClick} className={`${styles.greenButton}`}>
          <NotificationsNoneIcon fontSize="large" />
        </Button>
        <p className={styles.buttonText}>{t('label.menu_notification')}</p>
      </div>
    </div>
  );
};

export default Menu;
