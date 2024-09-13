import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import { openDB } from 'idb';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { useRouter } from 'next/router';
import { useColorPalates } from '../../providers/theme-provider/hooks';
import { onMessageListener } from '../../config/firebase';
import { width } from '@mui/system';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '300px',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 2,
};

const PermissionModal = ({ state = false, audio = false }) => {
  const [open, setOpen] = useState(state);
  const router = useRouter();
  const theme = useColorPalates();

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = () => {
    if ('geolocation' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'denied' || result.state === 'prompt') {
          setOpen(true);
        }
      });
    } else {
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpenSettings = () => {
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="notification-modal-title"
      aria-describedby="notification-modal-description"
    >
      <Box sx={style}>
        <Typography
          color="black"
          style={{
            marginTop: '10px',
            wordBreak: 'break-word',
            fontSize: '14px',
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          {audio
            ? 'Allow Microphone in order to access the Mice Features'
            : 'Allow permission in order to access the weather Details'}
        </Typography>
        {
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
              handleOpenSettings();
              handleClose();
            }}
          >
            {'Allow Permission'}
          </Button>
        }
      </Box>
    </Modal>
  );
};

export default PermissionModal;
