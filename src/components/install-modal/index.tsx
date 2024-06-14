import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useColorPalates } from '../../providers/theme-provider/hooks';
import { useEffect } from 'react';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export const InstallModal: React.FC = () => {
  const theme = useColorPalates();
  const [open, setOpen] = React.useState(false);
  const deferredPromptRef = React.useRef<any>(null);
  // let deferredPrompt: any;

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      console.log("hi 2");
      deferredPromptRef.current = event;
      console.log("hello", deferredPromptRef.current);
    };
  
    console.log("installPwa", localStorage.getItem('installPwa'));
    if ((localStorage.getItem('installPwa') !== 'true') || (localStorage.getItem('installPwa') === null)) {
      // Check if the browser has the install event
      setOpen(true);
      console.log("hi 1");
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt, { once: true });
    }
  
    // Cleanup function
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const closeAndSetLocalStorage = () => {
    setOpen(false);
    localStorage.setItem('installPwa', 'true');
  };

  const handleOpen = async () => {
      if (!deferredPromptRef.current) {
        console.log('deff is null')
        return;
      }
      console.log("deffered prompt",deferredPromptRef.current)
      const result = await deferredPromptRef.current.prompt();
      console.log(`User ${result.outcome} the install prompt `);
      // deferredPromptRef.current = null;
      if(result.outcome === "accepted")
        closeAndSetLocalStorage();
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <>
          <Box sx={style}>
            <IconButton
              data-testid="install-app-close-button"
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}>
              <CloseIcon />
            </IconButton>
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h2"
              data-testid="install-app-text">
              Install App
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              Click the button to install the app.
            </Typography>
            <Button
              data-testid="install-app-button"
              onClick={handleOpen}
              style={{
                marginTop: '20px',
                backgroundColor: theme?.primary?.main,
                color: 'white',
              }}>
              Install
            </Button>
          </Box>
        </>
      </Modal>
    </>
  );
};
