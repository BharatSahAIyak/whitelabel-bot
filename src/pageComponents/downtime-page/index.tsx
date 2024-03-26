import React, { useCallback } from 'react';
import styles from './index.module.css';
import { Avatar, Box, Button, Typography} from '@mui/material';
import CallRoundedIcon from '@mui/icons-material/Call';
import { useColorPalates } from '../../providers/theme-provider/hooks';
import { useFlags } from 'flagsmith/react';
import { useConfig } from '../../hooks/useConfig';

const DowntimePage: React.FC = () => {
  const theme = useColorPalates(); 
  const config = useConfig('component', 'downtime');
  const flags = useFlags(['dialer_number']);
  const handleRefreshClick = useCallback(()=>{
    window?.location.reload()
  }, [])
  const handlePreviousClick = useCallback(()=>{
      window?.history.back();
  }, [])

  const handleContactUserClick = useCallback(()=>{
    const phoneNumber = `tel:${flags.dialer_number.value}`;
    window.location.href = phoneNumber;
  }, [flags])
  
  return (
    <>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"></meta>
      <Box className={styles.container} px={18} py={12}>
        <Box><Typography variant='h5' fontWeight={600} color={theme?.primary?.main}>{config?.title ?? "Downtime"}</Typography></Box>
        <Box my={4}>
          <img src={config?.downTimeImage?? "src/pageComponents/downtime-page/assets/downtimeGIF.gif"} alt='downtimeGif' className={styles.imageContainer}/>
        </Box>
        <Box><Typography variant='h6' fontWeight={600} color={theme?.grey?.[600]}>{config?.supportingText ?? "Description"}</Typography></Box>
        <Box  gap={1} display={'flex'} my={2}>
          <Box><Avatar
            sx={{ bgcolor: theme.primary.main, width:"7vh",height:"7vh" }}
            alt="Call Icon"
           >
           <CallRoundedIcon fontSize='large'/>
           </Avatar></Box>
          <Button variant={"text"} sx={{textTransform: 'none'}} onClick={handleContactUserClick}>
            <Typography variant='h5' color={theme?.grey?.[600]} fontWeight={600} sx={{textDecoration: 'underline'}}>{config?.contactLink?? "Contact Details"}</Typography>
          </Button>
        </Box>

        <Box display={"flex"} justifyContent={"space-around"} width={"100%"} my={4}>
          <Button
            className={styles.roundedButton}
            onClick={handleRefreshClick}
            variant='contained'
            size='large'
            style={{ textTransform: 'none', backgroundColor: theme?.grey?.[600] }}>
            <Typography variant='body1'>{config?.refreshText ?? "Reload Page"}</Typography>
          </Button>
          <Button
          className={styles.roundedButton}
          variant='contained'
          size='large'
          style={{ textTransform: 'none', backgroundColor: theme?.primary?.main }}
          onClick={handlePreviousClick}
          >
          <Typography variant='body1'>{config?.previousPageText ?? "Previous Page"}</Typography>
        </Button>
        </Box>
    </Box>
    </>
  );
};

export default DowntimePage;
