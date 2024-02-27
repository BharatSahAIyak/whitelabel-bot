import styles from './index.module.css';

function LaunchPage() {

  return (
    <div className={`${styles.container}`} style={{backgroundColor: "var(--primary)"}}>
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
