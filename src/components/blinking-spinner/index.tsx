import React, { useMemo } from 'react';
import styles from './index.module.css';
import { useConfig } from '../../hooks/useConfig';

const BlinkingSpinner = () => {
  const config = useConfig('theme', 'secondaryColor');
  const secondaryColor = useMemo(() => {
    return config?.value;
  }, [config]);
  
  return (
    <p
      className={styles.spinner}
      style={{ backgroundColor: secondaryColor }}></p>
  );
};

export default BlinkingSpinner;
