import React from 'react';
import { useRouter } from 'next/router';
import HomeIcon from '@mui/icons-material/Home';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import MicNoneIcon from '@mui/icons-material/MicNone';
import Button from '@mui/material/Button';
import styles from './style.module.css';

const Menu = () => {
  const router = useRouter();

  const handleHomeClick = () => {
    router.push('/');
  };

  const handleNotificationClick = () => {};

  const handleTouchToSpeakClick = () => {
    router.push('/newchat?voice=true');
  };

  return (
    <div className={styles.footer}>
      <div className={styles.buttonWrapper}>
        <Button onClick={handleHomeClick} className={`  ${styles.greenButton}`}>
          <HomeIcon fontSize="large" />
        </Button>
        <p className={styles.buttonText}>Home</p>
      </div>
      <div className={styles.middleButton}>
        <Button
          onClick={handleTouchToSpeakClick}
          className={`  ${styles.touchToSpeakButton}`}
          startIcon={<MicNoneIcon fontSize="inherit" />}
        >
          Touch to Speak
        </Button>
      </div>
      <div className={styles.buttonWrapper}>
        <Button
          onClick={handleNotificationClick}
          className={`  ${styles.greenButton}`}
        >
          <NotificationsNoneIcon fontSize="large" />
        </Button>
        <p className={styles.buttonText}>Notifications</p>
      </div>
    </div>
  );
};

export default Menu;
