import React from 'react';
import styles from './index.module.css';
import { useLocalization } from '../../hooks';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const Disclaimer = () => {
  const t = useLocalization();
  return (
    <div className={styles.container}>
      <InfoOutlinedIcon sx={{ fontSize: '13px' }} /> {t('label.disclaimer')}
    </div>
  );
};

export default Disclaimer;
