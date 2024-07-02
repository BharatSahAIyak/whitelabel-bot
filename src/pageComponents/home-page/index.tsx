import React, { useEffect, useState, useContext, useCallback } from 'react';
import styles from './index.module.css';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import { Chip, Grid, Button } from '@mui/material';
import { useConfig } from '../../hooks/useConfig';
import { useLocalization } from '../../hooks';
import { AppContext } from '../../context';
import axios from 'axios';
import { FullPageLoader } from '../../components/fullpage-loader';
import WeatherAdvisoryPopup from '../../components/weather-advisory-popup';
import { useColorPalates } from '../../providers/theme-provider/hooks';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useRouter } from 'next/router';
import Menu from '../../components/menu';
import toast from 'react-hot-toast';

const Home: React.FC = () => {
  const t = useLocalization();
  const context = useContext(AppContext);
  const router = useRouter();
  const theme = useColorPalates();
  const config = useConfig('component', 'homePage');
  const [weather, setWeather] = useState<any>(null);
  const [crop, setCrop] = useState<any>(null);
  const [isNight, setIsNight] = useState(false);
  const [showWeatherAdvisoryPopup, setShowWeatherAdvisoryPopup] =
    useState(false);
  const [selectedCrop, setSelectedCrop] = useState<any>(null);

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 18 || currentHour < 6) {
      setIsNight(true);
    }
  }, []);

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (
        !sessionStorage.getItem('longitude') ||
        !sessionStorage.getItem('latitude')
      )
        return;
      try {
        const response = await axios.get(
          process.env.NEXT_PUBLIC_WEATHER_API || '',
          {
            params: {
              latitude: sessionStorage.getItem('latitude'),
              longitude: sessionStorage.getItem('longitude'),
            },
          }
        );
        console.log(response.data);
        const providers = response.data.message.catalog.providers;

        providers.forEach((provider: any) => {
          if (provider.id.toLowerCase() === 'ouat') {
            if (provider.category_id === 'crop_advisory_provider') {
              setCrop(provider?.items);
            } else if (provider.category_id === 'weather_provider') {
              setWeather((prev: any) => ({
                ...prev,
                future: provider?.items,
              }));
            }
          } else {
            if (
              provider.category_id === 'weather_provider' &&
              provider.id === 'imd'
            ) {
              if (!weather) {
                setWeather((prev: any) => ({
                  future: provider?.items?.slice(1),
                  current: provider?.items?.[0],
                }));
              } else {
                setWeather((prev: any) => ({
                  ...prev,
                }));
              }
            } else if (
              provider.category_id === 'crop_advisory_provider' &&
              provider.id === 'upcar'
            ) {
              if (!crop) {
                setCrop(provider?.items);
              }
            }
          }
        });
        return providers;
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

  const windDirections: any = {
    0: 'Calm',
    20: 'North-northeasterly',
    50: 'Northeasterly',
    70: 'East-northeasterly',
    90: 'Easterly',
    110: 'East-southeasterly',
    140: 'Southeasterly',
    160: 'South-southeasterly',
    180: 'Southerly',
    200: 'South-southwesterly',
    230: 'Southwesterly',
    250: 'West-southwesterly',
    270: 'Westerly',
    290: 'West-northwesterly',
    320: 'Northwesterly',
    340: 'North-northwesterly',
    360: 'Northerly',
  };

  function getClosestDirection(degree: number) {
    const keys = Object.keys(windDirections).map(Number);
    let closestKey = keys[0];
    let smallestDifference = Math.abs(degree - closestKey);

    for (let i = 1; i < keys.length; i++) {
      const currentKey = keys[i];
      const currentDifference = Math.abs(degree - currentKey);

      if (currentDifference < smallestDifference) {
        closestKey = currentKey;
        smallestDifference = currentDifference;
      }
    }

    return windDirections[closestKey];
  }

  function getDayAbbreviation(dateString: string) {
    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  }

  if (!weather || !crop) {
    return <FullPageLoader loading={!weather || !crop} />;
  }

  return (
    <div className={styles.main}>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
      ></meta>
      {showWeatherAdvisoryPopup && (
        <WeatherAdvisoryPopup
          cropName={selectedCrop?.code}
          setShowWeatherAdvisoryPopup={setShowWeatherAdvisoryPopup}
          advisory={selectedCrop}
        />
      )}
      <div
        className={styles.container}
        style={{
          background: `url(${
            weather?.current?.descriptor?.images?.find(
              (image: any) =>
                image.type === (isNight ? 'image_night' : 'image_day')
            )?.url
          })`,
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
                label={getClosestDirection(
                  weather?.current?.tags?.winddir || 0
                )}
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
              marginTop: '10px',
              textAlign: 'center',
              paddingBottom: '20px',
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
                height: '60px',
                padding: '18px 24px',
                fontWeight: '500',
                borderRadius: '6px',

                textTransform: 'none',
                boxShadow: 'none',
              }}
              onClick={handleKnowMoreClick}
            >
              Know more about crops
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.spacing}></div>

      <div className={styles.cropContainer}>
        <div className={styles.heading} style={{ background: '#DFF6D1' }}>
          {t('message.ask_ur_question')}
        </div>
        <div className={styles.gridSection}>
          <Grid container spacing={1} justifyContent="center">
            {' '}
            <Grid
              item
              xs={5}
              sm={4}
              md={4}
              sx={{
                textAlign: 'center',
                padding: '10px',
                backgroundColor: 'white',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                borderRadius: '15.87px',
                margin: '10px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <div onClick={() => router.push('/weather')}>
                <img
                  src={config.weatherImage}
                  alt="Weather"
                  className={styles.gridImage}
                />
                <p className={styles.gridText}>Weather </p>
              </div>
            </Grid>
            <Grid
              item
              xs={5}
              sm={4}
              md={4}
              sx={{
                textAlign: 'center',
                padding: '10px',
                backgroundColor: 'white',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                borderRadius: '15.87px',
                margin: '10px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div onClick={() => sendGuidedMsg('scheme')}>
                <img
                  src={config.schemeImage}
                  alt="Schemes"
                  className={styles.gridImage}
                />
                <p className={styles.gridText}>Schemes</p>
              </div>
            </Grid>
            <Grid
              item
              xs={5}
              sm={5}
              md={4}
              sx={{
                textAlign: 'center',
                padding: '10px',
                backgroundColor: 'white',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                borderRadius: '15.87px',
                margin: '10px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div onClick={() => sendGuidedMsg('pest')}>
                <img
                  src={config.pestImage}
                  alt="Pest"
                  className={styles.gridImage}
                />
                <p className={styles.gridText}>{t('label.pest')}</p>
              </div>
            </Grid>
            <Grid
              item
              xs={5}
              sm={4}
              md={4}
              sx={{
                textAlign: 'center',
                padding: '10px',
                backgroundColor: 'white',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                borderRadius: '15.87px',
                margin: '10px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div onClick={() => router.push('/faq')}>
                <img
                  src={config.otherInformationImage}
                  alt="FAQ"
                  className={styles.gridImage}
                />
                <p className={styles.gridText}>
                  {t('label.other_information')}
                </p>
              </div>
            </Grid>
          </Grid>
        </div>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p
            style={{
              fontFamily: 'Noto Sans Devanagari',
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '20.86px',
              textAlign: 'left',
              margin: '0 20px',
            }}
          >
            {t('label.ask_me2')}
          </p>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
        </div>
      </div>

      <Menu />
    </div>
  );
};

export default Home;
