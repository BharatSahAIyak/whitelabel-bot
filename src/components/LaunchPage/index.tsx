import { useMemo } from 'react';
import { useConfig } from '../../hooks/useConfig';
import styles from './index.module.css';

function LaunchPage() {

  const config = useConfig('theme','primaryColor');
  const primaryColor = useMemo(() => {
    return config?.value;
  }, [config]);

  return (
    <div className={`${styles.container}`} style={{backgroundColor: primaryColor}}>
      <img
        className={styles.loginImage}
        src="https://seeklogo.com/images/C/corporate-company-logo-749CEE6ADC-seeklogo.com.png"
        alt="LaunchImg"
        width={220}
        height={233}
      />
      <span>Bot</span>
    </div>
  );
}

export default LaunchPage;
