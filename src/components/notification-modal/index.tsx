import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import { openDB } from 'idb';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { useRouter } from 'next/router';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  minWidth: 360,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 2,
};

const NotificationModal = () => {
  const [open, setOpen] = useState(false);
  const [notificationData, setNotificationData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkNotification = async () => {
      const db = await openDB('notificationDB', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('notifications')) {
            db.createObjectStore('notifications', { keyPath: 'timestamp' });
          }
        },
      });

      const tx = db.transaction('notifications', 'readonly');
      const store = tx.objectStore('notifications');
      const notifications = await store.getAll();

      if (notifications.length > 0) {
        setNotificationData(notifications[0]);
        setOpen(true);
      } else {
        setOpen(false);
        setNotificationData(null);
      }
    };

    checkNotification();

    return () => {
      handleClose();
    };
  }, []);

  const handleClose = async () => {
    if (notificationData) {
      const db = await openDB('notificationDB', 1);
      const tx = db.transaction('notifications', 'readwrite');
      const store = tx.objectStore('notifications');
      await store.delete(notificationData.timestamp);
      setNotificationData(null);
      setOpen(false);
    }
  };
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (notificationData) {
        const db = await openDB('notificationDB', 1);
        const tx = db.transaction('notifications', 'readwrite');
        const store = tx.objectStore('notifications');
        await store.delete(notificationData.timestamp);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [notificationData]);

  if (!notificationData) return null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="notification-modal-title"
      aria-describedby="notification-modal-description"
      // BackdropProps={{
      //   onClick: (e) => e.stopPropagation(),
      // }}
    >
      <Box sx={style}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <p
            style={{
              marginBottom: '4px',
              display: 'inline-block',
              color: '#023035',
              fontWeight: 600,
              fontSize: '16px',
            }}
          >
            {notificationData?.title}
          </p>
          <CloseRoundedIcon onClick={handleClose} />
        </div>
        <div
          style={{
            height: '1px',
            borderColor: 'black',
            backgroundColor: '#B4B9C5',
          }}
        ></div>{' '}
        {notificationData?.image && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src={notificationData.image}
              alt="Notification"
              style={{ maxWidth: '80%', height: '100px' }}
            />
          </Box>
        )}
        <Typography
          color="black"
          style={{
            marginTop: '10px',
            wordBreak: 'break-word',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          {notificationData?.body}
        </Typography>
        {notificationData?.buttonUrl && notificationData?.buttonText && (
          <Button
            fullWidth
            variant="outlined"
            style={{
              backgroundColor: '#f5952f',
              color: '#fff',
              marginTop: '20px',
              // height: '40px',
              border: '1px solid var(--Mid-Gray-50, #F6F7F9)',
              fontSize: '14px',
              fontWeight: 600,
            }}
            onClick={() => {
              router.push(notificationData?.buttonUrl);
              handleClose();
            }}
          >
            {notificationData?.buttonText}
          </Button>
        )}
      </Box>
    </Modal>
  );
};

export default NotificationModal;
