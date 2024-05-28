import React, { useEffect, useState } from 'react';
import {
  Button,
  Modal,
  Box,
  Typography,
  Backdrop,
  Fade,
  CircularProgress
} from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '10px',
};

const LocationPermissionModal = (props: any) => {
  const [open, setOpen] = useState(true);
  // const [location, setLocation] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => setOpen(false);

  const requestLocationPermission = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        props?.setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setErrorMessage('');
        handleClose();
      },
      (error) => {
        setLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setErrorMessage('Location access denied. Please enable location permissions in your browser settings.');
        } else {
          setErrorMessage('Error occurred while getting location.');
          console.error('Error occurred while getting location:', error);
        }
        props?.setLocation(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  return (
    <div>
      <Modal
        aria-labelledby="location-permission-modal-title"
        aria-describedby="location-permission-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <Box sx={style}>
            <Typography id="location-permission-modal-title" variant="h6" component="h2">
              Location Permission Needed
            </Typography>
            <Typography id="location-permission-modal-description" sx={{ mt: 2 }}>
              We need your location to provide better service. Please allow us to access your location.
            </Typography>
            <div style={{display: 'flex', gap: '10px'}}>
            <Button
              variant="contained"
              color="primary"
              onClick={requestLocationPermission}
              disabled={loading} // Disable button while loading
              sx={{ mt: 3, width: '50%' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Allow Location Access'}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleClose}
              sx={{ mt: 3, width: '50%'}}
            >
              Don't Allow
            </Button>
            </div>
            {/* {location && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1">
                  Latitude: {location.latitude}
                </Typography>
                <Typography variant="body1">
                  Longitude: {location.longitude}
                </Typography>
                <Typography variant="body1">
                  Accuracy: {location.accuracy} meters
                </Typography>
              </Box>
            )} */}
            {errorMessage && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1" color="error">
                  {errorMessage}
                </Typography>
              </Box>
            )}
          </Box>
        </Fade>
      </Modal>
    </div>
  );
};

export default LocationPermissionModal;
