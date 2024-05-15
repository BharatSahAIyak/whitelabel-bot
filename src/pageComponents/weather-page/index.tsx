import React from 'react';
import styles from './index.module.css';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded'
import {
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Typography,
  styled,
} from '@mui/material'
import { useColorPalates } from '../../providers/theme-provider/hooks';
import { useConfig } from '../../hooks/useConfig';
import { useLocalization } from '../../hooks';

const WeatherPage: React.FC = () => {
  const t = useLocalization();
  const theme = useColorPalates();
  const config = useConfig('component', 'weatherPage');

  return (
    <>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"></meta>
      <Box className={styles.container} px={18} py={12}>


      </Box>
    </>
  );
};

export default WeatherPage;
