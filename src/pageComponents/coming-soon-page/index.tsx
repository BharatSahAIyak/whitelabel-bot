import React, { useCallback } from 'react';
import styles from './index.module.css';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Hourglass from './hourglass';
import { useColorPalates } from '../../providers/theme-provider/hooks';
import { useConfig } from '../../hooks/useConfig';

const ComingSoonPage: React.FC = () => {
  const theme = useColorPalates();
  const config = useConfig('component', 'comingSoon');
  const handleBack = useCallback(()=>{
    window?.history?.back()
    // console.log(component.backText ?? "Back Button")
  },[])

  return (
    <>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"></meta>
        <Box my={15} className={styles.container}>
          <Box mt={5}><Typography variant='h4' sx={{color: theme?.primary?.main, fontWeight: "700"}}>{config?.title ?? "Coming Soon"}</Typography></Box>
          <Box><Hourglass fillColor={theme?.primary?.main}/></Box>
          <Box><Typography variant='body1' sx={{fontWeight:"600"}}>{config?.description?? "Coming Soon Description"}</Typography></Box>
          <Box my={5}><Button variant='contained' className={styles.backButton} size='large' style={{backgroundColor: theme?.primary?.main}} onClick={handleBack}>{config?.backText ?? "Back Button"}</Button></Box>
        </Box>
    </>
  );
};

export default ComingSoonPage;