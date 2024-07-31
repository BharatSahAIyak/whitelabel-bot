import React, { useCallback, useContext } from 'react';
import { Modal, Box, Typography, Button, IconButton } from '@mui/material';
import { AppContext } from '../../context';
import { useLocalization } from '../../hooks';
import CloseIcon from '@mui/icons-material/Close';
import LanguagePopupImg from './assets/language-popup-img';
import { useColorPalates } from '../../providers/theme-provider/hooks';
import { useConfig } from '../../hooks/useConfig';

const style = {
  position: 'absolute' as 'absolute',
  textAlign: 'center',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 450,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 2,
  borderRadius: '8px',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  position: 'absolute',
  right: 0,
  top: 0,
};

const LanguagePopup: React.FC = () => {
  const context = useContext(AppContext);
  const t = useLocalization();
  const theme = useColorPalates();
  const config = useConfig('component', 'langPopup');

  const clickHandler = () => {
    localStorage.setItem('locale', config?.lang);
    context?.setLocale(config?.lang);
    context?.setShowLanguagePopup(false);
    context?.setLanguagePopupFlag(false);
  };

  return (
    <div>
      <Modal
        open={context?.showLanguagePopup}
        onClose={() => {
          context?.setShowLanguagePopup(false);
          context?.setLanguagePopupFlag(false);
        }}
        aria-labelledby="language-popup-title"
        aria-describedby="language-popup-description"
      >
        <Box sx={style}>
          <Box sx={headerStyle}>
            <IconButton
              onClick={() => {
                context?.setShowLanguagePopup(false);
                context?.setLanguagePopupFlag(false);
              }}
              color="inherit"
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <LanguagePopupImg color={theme?.primary?.main} />
          <Typography
            id="language-popup-title"
            variant="body1"
            component="h2"
            fontWeight={600}
            sx={{ mt: 2 }}
          >
            {t('label.language_popup_title')}
          </Typography>
          <Typography id="language-popup-description" sx={{ mt: 2 }}>
            {t('label.language_popup_desc')}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2, textTransform: 'none' }}
            onClick={clickHandler}
          >
            {t('label.language_popup_btn')}
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default LanguagePopup;
