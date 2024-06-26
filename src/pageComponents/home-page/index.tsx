import styles from './index.module.css';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { NextPage } from 'next';
import { AppContext } from '../../context';
import SendButton from './assets/sendButton';
import { useLocalization } from '../../hooks';
import router from 'next/router';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import RenderVoiceRecorder from '../../components/recorder/RenderVoiceRecorder';
import { recordUserLocation } from '../../utils/location';
import { useConfig } from '../../hooks/useConfig';
import DowntimePage from '../downtime-page';
import { useColorPalates } from '../../providers/theme-provider/hooks';
import kaliaStatusImg from './assets/kalia_status.png';
import plantProtectionImg from './assets/plant_protection.png';
import weatherAdvisoryImg from './assets/weather_advisory.png';
import TransliterationInput from '../../components/transliteration-input';
import saveTelemetryEvent from '../../utils/telemetry';

const HomePage: NextPage = () => {
  const context = useContext(AppContext);
  const botConfig = useConfig('component', 'chatUI');
  const config = useConfig('component', 'homePage');
  const { micWidth, micHeight } = config;
  const t = useLocalization();
  const placeholder = useMemo(() => t('message.ask_ur_question'), [t]);
  const [inputMsg, setInputMsg] = useState('');
  const theme = useColorPalates();
  const secondaryColor = useMemo(() => {
    return theme?.primary?.main;
  }, [theme?.primary?.main]);

  useEffect(() => {
    context?.fetchIsDown(); // check if server is down

    if (!sessionStorage.getItem('conversationId')) {
      const newConversationId = uuidv4();
      sessionStorage.setItem('conversationId', newConversationId);
      context?.setConversationId(newConversationId);
    }
    recordUserLocation();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = useCallback(
    async (msg: string) => {
      if (msg.length === 0) {
        toast.error(t('error.empty_msg'));
        return;
      }
      if (context?.newSocket?.socket?.connected) {
        console.log('clearing mssgs');
        context?.setMessages([]);
        router.push('/chat');
        if (context?.kaliaClicked) {
          context?.sendMessage(
            'Aadhaar number - ' + msg,
            'Aadhaar number - ' + msg,
            null,
            true
          );
        } else context?.sendMessage(msg, msg);
      } else {
        toast.error(t('error.disconnected'));
        return;
      }
    },
    [context, t]
  );

  const sendGuidedMsg = (type: string) => {
    // convert the string type into stringified array
    context?.setShowInputBox(false);
    const tags = [type];
    sessionStorage.setItem('tags', JSON.stringify(tags));
    sendMessage(`Guided: ${t('label.' + type)}`);
  };

  const sendWeatherTelemetry = async () => {
    try {
      const msgId = uuidv4();
      sessionStorage.setItem('weatherMsgId', msgId);
      await saveTelemetryEvent('0.1', 'E032', 'messageQuery', 'messageSent', {
        botId: process.env.NEXT_PUBLIC_BOT_ID || '',
        orgId: process.env.NEXT_PUBLIC_ORG_ID || '',
        userId: localStorage.getItem('userID') || '',
        phoneNumber: localStorage.getItem('phoneNumber') || '',
        conversationId: sessionStorage.getItem('conversationId') || '',
        messageId: msgId,
        text: 'Weather',
        createdAt: Math.floor(new Date().getTime() / 1000),
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (context?.isDown) {
    return <DowntimePage />;
  } else
    return (
      <>
        <div
          className={styles.main}
          // onClick={handleDocumentClick}
          style={{ color: secondaryColor }}
        >
          {context?.kaliaClicked ? (
            <div className={styles.kaliaImg}>
              <img
                src={config?.kaliaStatusImg || kaliaStatusImg?.src}
                width={200}
                height={200}
                alt="kaliastatus"
              />
            </div>
          ) : (
            <>
              <div
                className={styles.title}
                dangerouslySetInnerHTML={{ __html: t('label.ask_me') }}
              ></div>

              {(config?.showKalia ||
                config?.showWeatherAdvisory ||
                config?.showPlantProtection ||
                config?.showSchemes) && (
                <div
                  className={styles.imgButtons}
                  data-testid="homepage-action-buttons"
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-evenly',
                      width: '100%',
                      maxWidth: '500px',
                    }}
                  >
                    {config?.showWeatherAdvisory && (
                      <div
                        className={styles.imgBtn}
                        onClick={() => {
                          if (config?.showWeatherPage) {
                            router.push('/weather');
                            sendWeatherTelemetry();
                          } else {
                            sendGuidedMsg('weather');
                          }
                        }}
                      >
                        <p>{t('label.weather_advisory')}</p>
                        <img
                          src={
                            config?.weatherAdvisoryImg ||
                            weatherAdvisoryImg?.src
                          }
                          width={50}
                          height={70}
                          alt="weatheradvisory"
                        />
                      </div>
                    )}
                    {config?.showPlantProtection && (
                      <div
                        className={styles.imgBtn}
                        onClick={() => sendGuidedMsg('pest')}
                      >
                        <p>{t('label.plant_protection')}</p>
                        <img
                          src={
                            config?.plantProtectionImg ||
                            plantProtectionImg?.src
                          }
                          width={60}
                          height={60}
                          alt="plantprotection"
                        />
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-evenly',
                      marginTop: '10px',
                      width: '100%',
                      maxWidth: '500px',
                    }}
                  >
                    {config?.showSchemes && (
                      <div
                        className={styles.imgBtn}
                        onClick={() => sendGuidedMsg('scheme')}
                      >
                        <p>{t('label.scheme')}</p>
                        <img
                          src={config?.schemesImg || plantProtectionImg?.src}
                          width={60}
                          height={60}
                          alt="schemes"
                        />
                      </div>
                    )}
                    {config?.showKalia && (
                      <div
                        className={styles.imgBtn}
                        onClick={() =>
                          context?.setKaliaClicked((props: boolean) => !props)
                        }
                      >
                        <p>{t('label.kalia_status')}</p>
                        <img
                          src={config?.kaliaStatusImg || kaliaStatusImg?.src}
                          width={60}
                          height={60}
                          alt="kaliastatus"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {config?.showMic && (
                <div
                  className={styles.voiceRecorder}
                  style={{
                    height: micHeight,
                    width: micWidth,
                  }}
                >
                  <RenderVoiceRecorder
                    setInputMsg={setInputMsg}
                    tapToSpeak={config?.showTapToSpeakText}
                  />
                </div>
              )}
            </>
          )}

          <form onSubmit={(event) => event?.preventDefault()}>
            <div className={`${`${styles.inputBox} ${styles.inputBoxOpen}`}`}>
              <TransliterationInput
                data-testid="homepage-input-field"
                config={botConfig}
                style={{ fontFamily: 'NotoSans-Regular' }}
                rows={1}
                value={inputMsg}
                setValue={setInputMsg}
                onEnter={sendMessage}
                multiline={false}
                placeholder={
                  !context?.kaliaClicked
                    ? placeholder
                    : t('label.enter_aadhaar_number')
                }
              />
              <button
                data-testid="homepage-send-button"
                type="submit"
                className={styles.sendButton}
                onClick={() => sendMessage(inputMsg)}
              >
                <SendButton
                  width={40}
                  height={40}
                  color={theme?.primary?.light}
                />
              </button>
            </div>
          </form>
        </div>
      </>
    );
};
export default HomePage;
