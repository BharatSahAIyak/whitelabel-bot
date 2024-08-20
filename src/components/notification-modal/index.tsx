import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import { openDB } from 'idb';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const NotificationModal = () => {
  const [open, setOpen] = useState(false);
  const [notificationData, setNotificationData] = useState<any>(null);

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
      }
    };

    checkNotification();
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

  if (!notificationData) return null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="notification-modal-title"
      aria-describedby="notification-modal-description"
      BackdropProps={{
        onClick: (e) => e.stopPropagation(),
      }}
    >
      <Box sx={style}>
        <Typography id="notification-modal-title" variant="h6" component="h2">
          {notificationData?.title}
        </Typography>
        <Typography id="notification-modal-description" sx={{ mt: 2 }}>
          {notificationData?.body}
        </Typography>
        {notificationData?.image && (
          <Box sx={{ mt: 2 }}>
            <img src={notificationData.image} alt="Notification" style={{ maxWidth: '100%' }} />
          </Box>
        )}
        <Button onClick={handleClose} sx={{ mt: 2 }}>
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default NotificationModal;
