import React, { useEffect, useState, useContext, useCallback } from 'react';
import styles from './index.module.css';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import { Chip, Grid, Button } from '@mui/material';
import { useConfig } from '../../hooks/useConfig';
import { useLocalization } from '../../hooks';
import { AppContext } from '../../context';
import axios from 'axios';
import { FullPageLoader } from '../../components/fullpage-loader';
import { useColorPalates } from '../../providers/theme-provider/hooks';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useRouter } from 'next/router';
import Menu from '../../components/menu';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import saveTelemetryEvent from '../../utils/telemetry';

const Home: React.FC = () => {
  const t = useLocalization();
  const context = useContext(AppContext);
  const router = useRouter();
  const theme = useColorPalates();
  const config = useConfig('component', 'homePage');
  const [weather, setWeather] = useState<any>(null);
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 18 || currentHour < 6) {
      setIsNight(true);
    }
  }, []);

  useEffect(() => {
    console.log('Home Config:', config);
    const fetchWeatherData = async () => {
      const latitude = localStorage.getItem('latitude');
      const longitude = localStorage.getItem('longitude');
      if (!latitude || !longitude) return;

      try {
        const response = await axios.get(
          process.env.NEXT_PUBLIC_WEATHER_API || '',
          {
            params: { latitude, longitude },
          }
        );

        console.log(response.data);
        const providers = response.data.message.catalog.providers;

        const weatherProvider = providers.find(
          (provider: any) =>
            provider.id.toLowerCase() === 'ouat' &&
            provider.category_id === 'weather_provider'
        );

        const imdWeatherProvider = providers.find(
          (provider: any) =>
            provider.id === 'imd' && provider.category_id === 'weather_provider'
        );

        if (weatherProvider) {
          setWeather((prev: any) => ({
            ...prev,
            future: weatherProvider.items,
          }));
        }

        if (imdWeatherProvider) {
          setWeather((prev: any) => ({
            ...prev,
            future: imdWeatherProvider.items?.slice(1),
            current: imdWeatherProvider.items?.[0],
          }));
        }
      } catch (error) {
        console.error('Error fetching advisory data:', error);
        throw error;
      }
    };

    fetchWeatherData();
  }, []);

  const handleKnowMoreClick = () => {
    router.push('/weather');
  };

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
    context?.setShowInputBox(false);
    const tags = [type];
    sessionStorage.setItem('tags', JSON.stringify(tags));
    sendMessage(`Guided: ${t('label.' + type)}`);
  };

  function getDayAbbreviation(dateString: string) {
    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  }
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

  if (!weather) {
    return <FullPageLoader loading={!weather} />;
  }

  return (
    <div className={styles.main}>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
      ></meta>

      <div
        className={styles.container}
        style={{
          background: `url(${weather?.current?.descriptor?.images
            ?.find(
              (image: any) =>
                image.type === (isNight ? 'image_night' : 'image_day')
            )
            ?.url?.replace(/ /g, '%20')
            ?.replace(/\(/g, '%28')
            ?.replace(/\)/g, '%29')})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      >
        <div className={styles.weatherText}>
          <div>
            <h1
              style={{
                color: 'white',
                margin: 0,
                fontSize: '2.75rem',
              }}
            >
              {weather?.current?.tags?.temp}°C
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2>
              {localStorage.getItem('locale') === 'en'
                ? weather?.current?.tags?.conditions
                : weather?.current?.tags?.[
                    `conditions${'_' + localStorage.getItem('locale') || ''}`
                  ]}
            </h2>
            {sessionStorage.getItem('city') && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'end',
                }}
              >
                <LocationOnRoundedIcon style={{ fontSize: '1.5rem' }} />
                <span style={{ fontSize: '1.25rem' }}>
                  {sessionStorage.getItem('city')}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.weatherBottom}>
          <Grid
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '5px 10px',
            }}
            spacing={{ xs: 2, md: 3 }}
            columns={3}
          >
            <Grid item xs={1} sm={1} md={1}>
              <Chip
                label={
                  localStorage.getItem('locale') === 'en'
                    ? weather?.current?.tags?.winddir
                    : weather?.current?.tags?.[
                        `winddir${'_' + localStorage.getItem('locale') || ''}`
                      ]
                }
                size="medium"
                sx={{
                  fontSize: '14px',
                  fontWeight: '600',
                  minWidth: '70px',
                  background: null,
                }}
              />
              <p
                style={{
                  minWidth: '70px',
                  background: 'white',
                  color: 'black',
                  fontWeight: '600',
                  marginTop: '5px',
                }}
              >
                {t('label.wind_direction')}
              </p>
            </Grid>
            <Grid item xs={1} sm={1} md={1}>
              <Chip
                label={(weather?.current?.tags?.windspeed || 0) + ' km/h'}
                size="medium"
                sx={{
                  fontSize: '14px',
                  fontWeight: '600',
                  minWidth: '70px',
                  background: '#101860',
                  color: 'white',
                }}
              />
              <p
                style={{
                  minWidth: '70px',
                  background: 'white',
                  color: 'black',
                  fontWeight: '600',
                  marginTop: '5px',
                }}
              >
                {t('label.wind_speed')}
              </p>
            </Grid>
            <Grid item xs={1} sm={1} md={1}>
              <Chip
                label={(weather?.current?.tags?.humidity || 0) + ' %'}
                size="medium"
                sx={{
                  fontSize: '14px',
                  fontWeight: '600',
                  minWidth: '70px',
                  background: '#4CC3CB',
                  color: 'white',
                }}
              />
              <p
                style={{
                  minWidth: '70px',
                  background: 'white',
                  color: 'black',
                  fontWeight: '600',
                  marginTop: '5px',
                }}
              >
                {t('label.humidity')}
              </p>
            </Grid>
          </Grid>

          <div
            style={{
              marginTop: '5px',
              textAlign: 'center',
              paddingBottom: '10px',
            }}
          >
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{
                backgroundColor: '#EDEDF1',
                color: '#1e6231',
                fontSize: '18px',
                width: '308px',
                height: '40px',
                padding: '18px 24px',
                fontWeight: '500',
                borderRadius: '6px',

                textTransform: 'none',
                boxShadow: 'none',
              }}
              onClick={() => {
                if (config.showWeatherPage) {
                  handleKnowMoreClick();
                } else {
                  router.push('/chat');
                }
              }}
            >
              {t('label.weather_button_text')}
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.cropContainer}>
        <div className={styles.heading} style={{ background: '#DFF6D1' }}>
          {t('message.ask_ur_question')}
        </div>
        <div className={styles.gridSection}>
          <Grid container spacing={1} justifyContent="center">
            {config.showWeatherAdvisory && (
              <Grid
                item
                xs={4}
                sm={3}
                md={4}
                sx={{
                  textAlign: 'center',
                  padding: '8px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  borderRadius: '12px',
                  margin: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <div
                  onClick={() => {
                    if (config?.showWeatherPage) {
                      router.push('/weather');
                      sendWeatherTelemetry();
                    } else {
                      sendGuidedMsg('weather');
                    }
                  }}
                >
                  <img
                    src={config.weatherAdvisoryImg}
                    alt="Weather"
                    className={styles.gridImage}
                  />
                  <p className={styles.gridText}>
                    {t('label.weather_advisory')}{' '}
                  </p>
                </div>
              </Grid>
            )}

            {config.showSchemes && (
              <Grid
                item
                xs={4}
                sm={3}
                md={4}
                sx={{
                  textAlign: 'center',
                  padding: '8px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  borderRadius: '12px',
                  margin: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div onClick={() => sendGuidedMsg('scheme')}>
                  <img
                    src={config.schemesImg}
                    alt="Schemes"
                    className={styles.gridImage}
                  />
                  <p className={styles.gridText}>{t('label.scheme')}</p>
                </div>
              </Grid>
            )}

            {config.showPlantProtection && (
              <Grid
                item
                xs={4}
                sm={3}
                md={4}
                sx={{
                  textAlign: 'center',
                  padding: '8px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  borderRadius: '12px',
                  margin: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div onClick={() => sendGuidedMsg('pest')}>
                  <img
                    src={config.plantProtectionImg}
                    alt="Pest"
                    className={styles.gridImage}
                  />
                  <p className={styles.gridText}>
                    {t('label.plant_protection')}
                  </p>
                </div>
              </Grid>
            )}

            {config.showOtherInformation && (
              <Grid
                item
                xs={4}
                sm={3}
                md={4}
                sx={{
                  textAlign: 'center',
                  padding: '8px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  borderRadius: '12px',
                  margin: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div onClick={() => router.push('/faq')}>
                  <img
                    src={config.otherInformationImg}
                    alt="FAQ"
                    className={styles.gridImage}
                  />
                  <p className={styles.gridText}>
                    {t('label.other_information')}
                  </p>
                </div>
              </Grid>
            )}
          </Grid>
        </div>
        {config.showFooter && (
          <div
            style={{
              marginTop: '20px',
              textAlign: 'center',
              marginBottom: '120px',
            }}
          >
            <p
              style={{
                fontSize: '16px',
                fontWeight: 400,
                lineHeight: '20.86px',
                textAlign: 'left',
                margin: '0 20px',
              }}
            >
              {t('label.homepage_footer')}
            </p>
          </div>
        )}
      </div>

      <Menu />
    </div>
  );
};

export default Home;
