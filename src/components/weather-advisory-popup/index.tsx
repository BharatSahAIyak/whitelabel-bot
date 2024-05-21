import * as React from 'react';
import styles from './index.module.css';
import Backdrop from '@mui/material/Backdrop';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Button, List, Typography } from '@mui/material';
import { useColorPalates } from '../../providers/theme-provider/hooks';

const WeatherAdvisoryPopup = (props: any) => {
  const [open, setOpen] = React.useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  const handleClose = () => {
    setOpen(false);
    props?.setShowWeatherAdvisoryPopup(false);
  };

  const weatherDetails = [
    {
      id: 1,
      label:
        'उन्हें अच्छी तरह हाइड्रेटेड रखने के लिए स्वच्छ पेयजल उपलब्ध कराएं।',
    },
    {
      id: 2,
      label: 'तूफ़ान गुज़रने तक उन्हें शांत और सुरक्षित स्थान पर रखें।',
    },
  ];

  const theme = useColorPalates();
  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}>
        <Fade in={open}>
          <div className={styles.container}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <p
                style={{
                  display: 'inline-block',
                  color: '#023035',
                  fontWeight: 600,
                  fontSize: '20px',
                }}>
                फ़सल सलाह - {props?.cropName}
              </p>
              <CloseRoundedIcon onClick={handleClose} />
            </div>
            <div
              style={{
                marginTop: '4px',
                height: '1px',
                borderColor: 'black',
                backgroundColor: '#B4B9C5',
              }}></div>
            <div className="text-center p-3">
              <List dense>
                {weatherDetails.map((item) => (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      textAlign: 'start',
                    }}>
                    <span
                      style={{
                        marginRight: '8px',
                        color: 'black',
                        fontSize: '16px',
                        fontWeight: 500,
                      }}>{`${item.id}.`}</span>
                    <Typography
                      color="black"
                      style={{
                        wordBreak: 'break-word',
                        fontSize: '16px',
                        fontWeight: 500,
                      }}>
                      {item.label}
                    </Typography>
                  </div>
                ))}
              </List>
              <p
                style={{
                  color: theme.primary.main,
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                }}>
                <span
                  className="rounded-circle"
                  style={{
                    width: '20px',
                    height: '20px',
                    marginRight: '4px',
                  }}>
                  <CheckCircleRoundedIcon
                    color="success"
                    style={{ fontSize: '16px' }}
                  />
                </span>
                वेरिफ़िएड बय ओडिशा कृषि एवं प्रौद्योगिकी विश्वविद्यालय
              </p>
              <Button
                fullWidth
                variant="contained"
                style={{
                  marginTop: '30px',
                  backgroundColor: `${theme.primary.dark}`,
                  color: theme.primary.main,
                  padding: '8px 0',
                }}
                startIcon={<VolumeUpIcon />}>
                सुनने के लिए यहां क्लिक करें
              </Button>
            </div>
          </div>
        </Fade>
      </Modal>
    </div>
  );
};

export default WeatherAdvisoryPopup;
