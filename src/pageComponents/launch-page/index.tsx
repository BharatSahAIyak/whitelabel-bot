
import styles from './index.module.css';
import { FC } from 'react';
import { useConfig } from '../../hooks/useConfig';
import Image from 'next/image';

 const LaunchPage:FC<{theme:any,config:any}>=({theme,config})=> {
  console.log({config})
  return (
    <div className={`${styles.container}`} style={{background: theme?.
      palette?.primary?.main}}>
      <img
        className={styles.loginImage}
        src={config?.logo}
        alt="KrushakOdisha"
        width={220}
        height={233}    
      />
      <span>{config?.label}</span>
    </div>
  );
}


export default LaunchPage