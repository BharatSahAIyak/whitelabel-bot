import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import { openDB } from 'idb';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { useRouter } from 'next/router';
import { useColorPalates } from '../../providers/theme-provider/hooks';
import { onMessageListener } from '../../config/firebase';

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
  const theme = useColorPalates();

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

    onMessageListener().then((payload: any) => {
      if (payload) {
        const newNotification = {
          timestamp: new Date().getTime().toString(),
          title: payload.notification.title,
          modalBody: payload.notification.body,
          image: payload.notification.image,
          buttonUrl: payload.data?.buttonUrl,
          buttonText: payload.data?.buttonText,
        };

        setNotificationData(newNotification);
        setOpen(true);
      }
    });

    updateNotificationPayload('temp');

    return () => {
      handleClose();
    };
  }, []);

  // Function to add data to IndexedDB
  const addData = (db: any, data: any) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['notifications'], 'readwrite');
      const store = transaction.objectStore('notifications');
      const request = store.add(data);

      request.onerror = (event: any) => reject('Error adding data: ' + event.target.error);
      request.onsuccess = (event: any) => resolve(event.target.result);
    });
  };

  async function updateNotificationPayload(stringifiedPayload: string) {
    try {
      const payload = JSON.parse(stringifiedPayload);
      console.log('Received payload:', payload);
      const db = await openDB('notificationDB', 1);
      await addData(db, payload);
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  }

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
          {notificationData?.modalBody &&
            notificationData.modalBody.split('\n').map((line: string, index: number) => (
              <React.Fragment key={index}>
                {line}
                <br />
              </React.Fragment>
            ))}
        </Typography>
        {notificationData?.buttonUrl && notificationData?.buttonText && (
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            style={{
              color: '#fff',
              marginTop: '20px',
              background: theme.primary.main,
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
