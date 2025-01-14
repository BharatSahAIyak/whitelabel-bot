import React, { useEffect, useState, useContext, useCallback } from 'react';
import styles from './index.module.css';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import { Chip, Grid, Button, Typography } from '@mui/material';
import { useConfig } from '../../hooks/useConfig';
import { useLocalization } from '../../hooks';
import { AppContext } from '../../context';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';

import { FullPageLoader } from '../../components/fullpage-loader';
import { useColorPalates } from '../../providers/theme-provider/hooks';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useRouter } from 'next/router';
import Menu from '../../components/menu';
import toast from 'react-hot-toast';
import { recordUserLocation } from '../../utils/location';

const Home: React.FC = () => {
  const t = useLocalization();
  const context = useContext(AppContext);
  const router = useRouter();
  const theme = useColorPalates();
  const config = useConfig('component', 'homePage');
  const weatherConfig = useConfig('component', 'weatherPage');
  const [weather, setWeather] = useState<any>(context?.weather);
  const [isFetching, setIsFetching] = useState(false);
  const [isNight, setIsNight] = useState(false);
  const [locationStatus, setLocationStatus] = useState<PermissionState>('prompt');

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 18 || currentHour < 6) {
      setIsNight(true);
    }
    checkLocationPermission();
  }, []);

  const fetchWeatherData = async () => {
    const latitude = sessionStorage.getItem('latitude');
    const longitude = sessionStorage.getItem('longitude');
    const city = sessionStorage.getItem('city');
    if (locationStatus != 'granted') return;

    try {
      setIsFetching(true);
      const response = await axios.get(process.env.NEXT_PUBLIC_WEATHER_API || '', {
        params: { latitude, longitude, city, weather: weatherConfig?.weather || 'imd' },
      });

      const providers = response.data.message.catalog.providers;

      const weatherProvider = providers.find(
        (provider: any) =>
          provider.id.toLowerCase() === (weatherConfig?.weather || 'imd') &&
          provider.category_id === 'weather_provider'
      );

      setWeather((prev: any) => ({
        ...prev,
        future: weatherProvider.items?.slice(1),
        current: weatherProvider.items?.[0],
      }));
      context?.setWeather((prev: any) => ({
        ...prev,
        future: weatherProvider.items?.slice(1),
        current: weatherProvider.items?.[0],
      }));
      setIsFetching(false);
    } catch (error) {
      console.error('Error fetching advisory data:', error);
      setIsFetching(false);
      throw error;
    }
  };
  const checkLocationPermission = async () => {
    try {
      await recordUserLocation(config);

      const status = await navigator.permissions.query({ name: 'geolocation' });
      if (status.state) {
        setLocationStatus(() => status?.state);
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      return 'error';
    }
  };

  // Keep fetching weather data until it's available
  useEffect(() => {
    if (!config?.showWeather) return;

    let interval: NodeJS.Timeout | null = null;

    if (!weather && !isFetching) {
      interval = setInterval(() => {
        fetchWeatherData();
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [weather, fetchWeatherData]);

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
          context?.sendMessage('Aadhaar number - ' + msg, 'Aadhaar number - ' + msg, null, true);
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
    sendMessage(`Guided: ${t('message.' + type)}`);
  };
  // if (!weather && config?.showWeather) {
  //   return <FullPageLoader loading={!weather} />;
  // }

  const getLocationName = (locations: Array<string>) => {
    return locations?.[0];
    if (context?.locale === 'en') return locations?.[0];
    if (context?.locale === 'hi') return locations?.[1];
    if (context?.locale === 'or') return locations?.[2];
    return '';
  };
  return (
    <div className={styles.main}>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
      ></meta>

      {config?.showWeather &&
        (weather ? (
          <div
            data-testid="home-page-bg-image"
            className={styles.container}
            style={{
              background: `url(${weather?.current?.descriptor?.images
                ?.find((image: any) => image.type === (isNight ? 'image_night' : 'image_day'))
                ?.url?.replace(/ /g, '%20')
                ?.replace(/\(/g, '%28')
                ?.replace(/\)/g, '%29')}) 0% 0% / cover no-repeat`,
            }}
          >
            <div className={styles.weatherText}>
              <div>
                <h1
                  data-testid="home-page-temperature"
                  style={{
                    color: 'white',
                    margin: 0,
                    fontSize: '2.75rem',
                  }}
                >
                  {weather?.current?.tags?.temp}°C
                </h1>
              </div>
              <div
                style={{
                  textAlign: 'right',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                }}
              >
                {weather?.current?.locations_ids && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'end',
                    }}
                  >
                    <LocationOnRoundedIcon style={{ fontSize: '1.5rem' }} />
                    <span
                      style={{
                        fontSize:
                          getLocationName(weather?.current?.locations_ids)?.length > 14
                            ? '1rem'
                            : '1.5rem',
                      }}
                      data-testid="weather-page-location"
                    >
                      {getLocationName(weather?.current?.locations_ids)}
                    </span>
                  </div>
                )}
                <h2
                  data-testid="weather-page-condition"
                  style={{
                    color: 'white',
                    margin: 0,
                    fontSize: '1.5rem',
                    wordBreak: 'break-word',
                  }}
                >
                  {localStorage.getItem('locale') === 'en'
                    ? weather?.current?.tags?.conditions
                    : weather?.current?.tags?.[
                        `conditions${'_' + localStorage.getItem('locale') || ''}`
                      ]}
                </h2>
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
                <Grid item xs={1} sm={1} md={1} data-testid="home-page-wind-direction">
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
                      margin: '5px 0 0 0',
                    }}
                  >
                    {t('label.wind_direction')}
                  </p>
                </Grid>
                <Grid item xs={1} sm={1} md={1} data-testid="home-page-wind-speed">
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
                      margin: '5px 0 0 0',
                    }}
                  >
                    {t('label.wind_speed')}
                  </p>
                </Grid>
                <Grid item xs={1} sm={1} md={1} data-testid="home-page-humidity">
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
                      margin: '5px 0 0 0',
                    }}
                  >
                    {t('label.humidity')}
                  </p>
                </Grid>
              </Grid>

              {config.showWeatherButton && (
                <div
                  style={{
                    marginTop: '5px',
                    textAlign: 'center',
                    paddingBottom: '10px',
                  }}
                >
                  <Button
                    data-testid="home-page-crop-advisory-button"
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      backgroundColor: '#EDEDF1',
                      '&:hover': {
                        backgroundColor: '#EDEDF1',
                      },
                      color: theme?.primary?.light,
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
                      if (config?.showWeatherPage) {
                        router.push('/weather');
                      } else {
                        router.push('/chat?message=Guided:%20weather');
                      }
                    }}
                  >
                    {t('label.weather_button_text')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : locationStatus != 'granted' ? (
          <div className={styles.locationContainer}>
            <Typography
              className={styles.locationText}
              data-testid="home-page-allow-location-text-1"
            >
              {t('label.allow_location_permission')}
            </Typography>
            <Typography
              className={styles.locationText}
              style={{ width: '100%' }}
              data-testid="home-page-allow-location-text-2"
            >
              {t('label.allow_location_from_setting')}
            </Typography>
            {locationStatus != 'denied' && (
              <Button
                data-testid="location-permission-button"
                fullWidth
                variant="outlined"
                color="primary"
                style={{
                  color: '#fff',
                  marginTop: '20px',
                  background: theme.primary.main,
                  border: '1px solid var(--Mid-Gray-50, #F6F7F9)',
                  fontSize: '14px',
                  width: 300,
                  fontWeight: 600,
                }}
                onClick={checkLocationPermission}
              >
                {t('label.access_location_permission')}
              </Button>
            )}
          </div>
        ) : (
          <div
            className={styles.locationContainer}
            style={{
              color: 'black',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <CircularProgress />
            <Typography className={styles.locationText} data-testid="home-page-loading-weather">
              {t('label.loading_weather_details')}
            </Typography>
          </div>
        ))}
      {config?.showHomeBgImg && (
        <div
          data-testid="home-page-bg-image"
          className={styles.container}
          style={{
            background: `url(${config?.homeBgImg})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></div>
      )}
      <div className={styles.cropContainer}>
        <div
          className={styles.heading}
          style={{ background: config?.askYourQuestionBgColor }}
          data-testid="home-page-ask-your-question"
        >
          {t('message.ask_ur_question')}
        </div>
        <div className={styles.gridSection}>
          <Grid
            container
            spacing={1}
            justifyContent="center"
            data-testid="home-page-action-buttons"
          >
            {config.showWeatherActionButton && (
              <Grid
                item
                xs={5}
                sm={3}
                md={4}
                sx={{
                  textAlign: 'center',
                  padding: '6px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  borderRadius: '12px',
                  margin: '6px',
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
                    } else {
                      router.push('/chat?message=Guided:%20weather');
                    }
                  }}
                >
                  <img
                    src={config.weatherButtonLogo}
                    alt="weatherImg"
                    className={styles.gridImage}
                  />
                  <p className={styles.gridText}>{t('label.weather')} </p>
                </div>
              </Grid>
            )}
            {config.showPestIdentification && (
              <Grid
                item
                xs={5}
                sm={3}
                md={4}
                sx={{
                  textAlign: 'center',
                  padding: '6px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  borderRadius: '12px',
                  margin: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <div
                  onClick={() => {
                    sendGuidedMsg('identification');
                  }}
                >
                  <img
                    src={config.pestIdentificationImg}
                    alt="pestIdentification"
                    className={styles.gridImage}
                  />
                  <p className={styles.gridText}>{t('label.pest_identification')} </p>
                </div>
              </Grid>
            )}

            {config.showSchemes && (
              <Grid
                item
                xs={5}
                sm={3}
                md={4}
                sx={{
                  textAlign: 'center',
                  padding: '6px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  borderRadius: '12px',
                  margin: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  onClick={() => {
                    if (config.disableSchemes) {
                      toast(t('message.coming_soon'));
                    } else {
                      sendGuidedMsg('scheme');
                    }
                  }}
                >
                  <img src={config.schemesImg} alt="Schemes" className={styles.gridImage} />
                  <p className={styles.gridText}>{t('label.scheme')}</p>
                </div>
              </Grid>
            )}

            {config.showPlantProtection && (
              <Grid
                item
                xs={5}
                sm={3}
                md={4}
                sx={{
                  textAlign: 'center',
                  padding: '6px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  borderRadius: '12px',
                  margin: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  onClick={() => {
                    if (config.disablePlantProtection) {
                      toast(t('message.coming_soon'));
                    } else {
                      sendGuidedMsg('pest');
                    }
                  }}
                >
                  <img src={config.plantProtectionImg} alt="Pest" className={styles.gridImage} />
                  <p className={styles.gridText}>{t('label.plant_protection')}</p>
                </div>
              </Grid>
            )}

            {config.showOtherInformation && (
              <Grid
                item
                xs={5}
                sm={3}
                md={4}
                sx={{
                  textAlign: 'center',
                  padding: '6px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  borderRadius: '12px',
                  margin: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div onClick={() => router.push('/newchat')}>
                  <img
                    src={config.otherInformationImg}
                    alt="otherInformation"
                    className={styles.gridImage}
                  />
                  <p className={styles.gridText}>{t('label.other_information')}</p>
                </div>
              </Grid>
            )}
          </Grid>
        </div>
        {config.showFooter && (
          <div className={styles.footer} data-testid="home-page-footer-text">
            {t('label.homepage_footer')}
          </div>
        )}
      </div>

      <Menu />
    </div>
  );
};

export default Home;
