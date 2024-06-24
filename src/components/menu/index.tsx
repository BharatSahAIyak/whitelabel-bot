import React from 'react';
import { useRouter } from 'next/router';
import HomeIcon from '@mui/icons-material/Home';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import Button from '@mui/material/Button';
import MicIcon from '@mui/icons-material/Mic';
import styles from './style.module.css';

const Menu = () => {
    const router = useRouter();

    const handleHomeClick = () => {
        router.push('/');
    };

    const handleNotificationClick = () => {};

    return (
        <div className={styles.footer}>
            <div className={styles.buttonWrapper}>
                <Button
                    onClick={handleHomeClick}
                    className={styles.footerButton}
                >
                    <HomeIcon fontSize="large" />
                </Button>
                <p className={styles.buttonText}>Home</p>
            </div>
            <div className={styles.middleButton}>
                <Button
                    variant="contained"
                    color="primary"
                    className={`${styles.greenButton} ${styles.rounded}`}
                    startIcon={<MicIcon fontSize="large" />}
                >
                    Touch to Speak
                </Button>
            </div>
            <div className={styles.buttonWrapper}>
                <Button
                    onClick={handleNotificationClick}
                    className={styles.footerButton}
                >
                    <NotificationsNoneIcon fontSize="large" />
                </Button>
                <p className={styles.buttonText}>Notifications</p>
            </div>
        </div>
    );
};

export default Menu;
