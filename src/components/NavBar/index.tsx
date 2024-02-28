import { useState, useContext, useCallback, useMemo } from 'react';
import styles from './index.module.css';
import PlusIcon from '../../assets/icons/plus';
import HomeIcon from '../../assets/icons/home';
import { AppContext } from '../../context';
import flagsmith from 'flagsmith/isomorphic';
import router from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import { useFlags } from 'flagsmith/react';
import { useLocalization } from '../../hooks';
import toast from 'react-hot-toast';
import { Sidemenu } from '../Sidemenu';
import { recordUserLocation } from '../../utils/location';
import { useConfig } from '../../hooks/useConfig';

function NavBar() {
  const flags = useFlags(['show_download_button', 'show_share_button']);
  // const defaultLang = flagsmith.getValue('default_lang', { fallback: 'en' });
  const [isEngActive, setIsEngActive] = useState(
    localStorage.getItem('locale')
      ? localStorage.getItem('locale') === 'en'
      : true
  );
  const context = useContext(AppContext);
  const t = useLocalization();

  const toggleLanguage = useCallback(
    (newLanguage: string) => () => {
      localStorage.setItem('locale', newLanguage);
      context?.setLocale(newLanguage);
      setIsEngActive((prev) => (prev === true ? false : true));
    },
    [context]
  );

  const newChatHandler = useCallback(() => {
    if (context?.isMsgReceiving) {
      toast.error(`${t('error.wait_new_chat')}`);
      return;
    }

    recordUserLocation();

    const newConversationId = uuidv4();
    sessionStorage.setItem('conversationId', newConversationId);
    if (context?.audioElement) context?.audioElement.pause();
    if (context?.setAudioPlaying) context?.setAudioPlaying(false);
    context?.setConversationId(newConversationId);
    context?.setMessages([]);
    context?.setIsMsgReceiving(false);
    context?.setLoading(false);
    router.push('/');
  }, [context, t]);


  const config = useConfig('component','navbar');
  console.log("hola2:",{config})
  const botName = useMemo(() => {
    return config?.brandName;
  }, [config]);
  const secondaryColorConfig = useConfig('theme','secondaryColor');
  const secondaryColor = useMemo(() => {
    return secondaryColorConfig?.value;
  }, [secondaryColorConfig]);

  if (router.pathname === '/chat' && !context?.isDown) {
    return (
      <div className={styles.navbar}>
        <div
          style={{ width: '120px', display: 'flex', alignItems: 'flex-start' }}>
          <Sidemenu />
          <div
            onClick={newChatHandler}
            style={{
              paddingLeft: '15px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
            <PlusIcon color={secondaryColor} />
            <p style={{ color: 'var(--font)', fontSize: '12px' }}>
              {t('label.new_chat')}
            </p>
          </div>
        </div>
        <div
          style={{
            minWidth: '200px',
            display: 'flex',
            justifyContent: 'space-between',
          }}>
          <img
            src="https://seeklogo.com/images/C/corporate-company-logo-749CEE6ADC-seeklogo.com.png"
            alt=""
            width={60}
            height={60}
          />
          <img
            src="https://seeklogo.com/images/C/corporate-company-logo-749CEE6ADC-seeklogo.com.png"
            alt=""
            width={60}
            height={60}
          />
          <img
            src="https://seeklogo.com/images/C/corporate-company-logo-749CEE6ADC-seeklogo.com.png"
            alt=""
            width={60}
            height={60}
          />
        </div>
      </div>
    );
  } else
    return (
      <div className={styles.navbar}>
        {localStorage.getItem('phoneNumber') ? (
          <div
            style={{
              width: '120px',
              display: 'flex',
              alignItems: 'center',
            }}>
            <Sidemenu />

            {router.pathname !== '/chat' && router.pathname !== '/' ? (
              <div
                style={{ paddingLeft: '15px' }}
                onClick={() => {
                  router.push('/');
                }}>
                <HomeIcon color={secondaryColor} />
              </div>
            ) : null}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              id="eng"
              className={isEngActive ? styles.active : styles.btn}
              style={{ borderRadius: '10px 0px 0px 10px' }}
              onClick={toggleLanguage('en')}>
              ENG
            </button>
            <button
              id="hindi"
              className={!isEngActive ? styles.active : styles.btn}
              style={{ borderRadius: '0px 10px 10px 0px' }}
              onClick={toggleLanguage('en')}>
              Lang2
            </button>
          </div>
        )}
        <div
          style={{
            flex: 1,
            textAlign: 'center',
          }}>
          {botName}
        </div>
        <div
          style={{
            minWidth: '200px',
            display: 'flex',
            justifyContent: 'space-between',
          }}>
          <img
            src="https://seeklogo.com/images/C/corporate-company-logo-749CEE6ADC-seeklogo.com.png"
            alt=""
            width={60}
            height={60}
          />
          <img
            src="https://seeklogo.com/images/C/corporate-company-logo-749CEE6ADC-seeklogo.com.png"
            alt=""
            width={60}
            height={60}
          />
          <img
            src="https://seeklogo.com/images/C/corporate-company-logo-749CEE6ADC-seeklogo.com.png"
            alt=""
            width={60}
            height={60}
          />
        </div>
      </div>
    );
}

export default NavBar;
