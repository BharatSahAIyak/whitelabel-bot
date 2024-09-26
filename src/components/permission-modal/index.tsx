import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/router';
import { useColorPalates } from '../../providers/theme-provider/hooks';
import { borderRadius } from '@mui/system';
import { useLocalization } from '../../hooks';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '300px',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: '8px',
  p: 2,
};
interface MicroPhonePermissionModalProps {
  permissionStatus: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onClose: () => void;
  onRequestPermission: () => void;
}

const MicroPhonePermissionModal: React.FC<MicroPhonePermissionModalProps> = ({
  permissionStatus,
  open,
  setOpen,
  onClose,
  onRequestPermission,
}: any) => {
  const theme = useColorPalates();
  const t = useLocalization();

  const handleClose = () => {
    setOpen(false);
    onClose();
    onRequestPermission();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="permission-modal-title"
      aria-describedby="permission-modal-description"
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
          {permissionStatus == ' prompt'
            ? t('label.allow_microphone_permission')
            : t('label.allow_microphone_permission_in_setting')}
        </Typography>
        {permissionStatus == 'prompt' && (
          <Button
            data-testid="microphone-permission-button"
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
            onClick={handleClose}
          >
            {t('label.access_microphone_permission')}
          </Button>
        )}
      </Box>
    </Modal>
  );
};

export default MicroPhonePermissionModal;
