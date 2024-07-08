import React, { useEffect, useState } from 'react';
import styles from './index.module.css';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import { Chip, Grid } from '@mui/material';
import { useConfig } from '../../hooks/useConfig';
import { useLocalization } from '../../hooks';
import axios from 'axios';
import { FullPageLoader } from '../../components/fullpage-loader';
import WeatherAdvisoryPopup from '../../components/weather-advisory-popup';
import saveTelemetryEvent from '../../utils/telemetry';
import { v4 as uuidv4 } from 'uuid';
import Menu from '../../components/menu';
const WeatherPage: React.FC = () => {
  const t = useLocalization();
  const config = useConfig('component', 'weatherPage');
  const [weather, setWeather] = useState<any>(null);
  const [crop, setCrop] = useState<any>(null);
  const [isNight, setIsNight] = useState(false);
  const [showWeatherAdvisoryPopup, setShowWeatherAdvisoryPopup] =
    useState(false);
  const [selectedCrop, setSelectedCrop] = useState<any>(null);
  const [fetchTime, setFetchTime] = useState(0);
  console.log({ config });

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 18 || currentHour < 6) {
      setIsNight(true);
    }
  }, []);

  useEffect(() => {
    const startTime = performance.now();
    const fetch = async () => {
      if (
        !localStorage.getItem('longitude') ||
        !localStorage.getItem('latitude')
      )
        return;
      try {
        const response = await axios.get(
          process.env.NEXT_PUBLIC_WEATHER_API || '',
          {
            params: {
              latitude: localStorage.getItem('latitude'),
              longitude: localStorage.getItem('longitude'),
              provider: config?.provider || 'upcar',
            },
          }
        );

        const endTime = performance.now();
        setFetchTime(endTime - startTime);
        console.log(response.data);
        const providers = response.data.message.catalog.providers;
        // setData(providers);

        // providers.forEach((provider: any) => {
        //   if(provider?.id === 'upcar') {
        //     setCrop(provider);
        //   }else{
        //     setWeather(provider);
        //   }
        // });

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
                  current: provider?.items?.[0],
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

    fetch();
  }, []);

  useEffect(() => {
    const sendTelemetry = async () => {
      try {
        if (weather?.current) {
          saveTelemetryEvent('0.1', 'E017', 'userQuery', 'responseAt', {
            botId: process.env.NEXT_PUBLIC_BOT_ID || '',
            orgId: process.env.NEXT_PUBLIC_ORG_ID || '',
            userId: localStorage.getItem('userID') || '',
            phoneNumber: localStorage.getItem('phoneNumber') || '',
            conversationId: sessionStorage.getItem('conversationId') || '',
            messageId: sessionStorage.getItem('weatherMsgId') || '',
            text: '',
            timeTaken: 0,
          });
          saveTelemetryEvent('0.1', 'E012', 'userQuery', 'llmResponse', {
            botId: process.env.NEXT_PUBLIC_BOT_ID || '',
            transformerId: uuidv4(),
            orgId: process.env.NEXT_PUBLIC_ORG_ID || '',
            userId: localStorage.getItem('userID') || '',
            phoneNumber: localStorage.getItem('phoneNumber') || '',
            conversationId: sessionStorage.getItem('conversationId') || '',
            replyId: uuidv4(),
            messageId: sessionStorage.getItem('weatherMsgId') || '',
            text: JSON.stringify(weather.current),
            createdAt: Math.floor(new Date().getTime() / 1000),
            timeTaken: parseInt(`${fetchTime}`),
          });
          saveTelemetryEvent('0.1', 'E033', 'messageQuery', 'messageReceived', {
            botId: process.env.NEXT_PUBLIC_BOT_ID || '',
            orgId: process.env.NEXT_PUBLIC_ORG_ID || '',
            userId: localStorage.getItem('userID') || '',
            phoneNumber: localStorage.getItem('phoneNumber') || '',
            conversationId: sessionStorage.getItem('conversationId') || '',
            replyId: uuidv4(),
            messageId: sessionStorage.getItem('weatherMsgId') || '',
            text: JSON.stringify(weather.current),
            createdAt: Math.floor(new Date().getTime() / 1000),
            timeTaken: parseInt(`${fetchTime}`),
          });
          sessionStorage.removeItem('weatherMsgId');
        }
      } catch (err) {
        console.error(err);
      }
    };

    sendTelemetry();
  }, [weather]);

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
              borderBottom: '1px solid #cdcaca',
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

          <div style={{ marginTop: '10px' }}>
            <div
              style={{
                color: 'black',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0px',
              }}
            >
              <div
                style={{
                  flex: 0.4,
                  maxWidth: '110px',
                  height: '112px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <p
                  style={{
                    textAlign: 'left',
                    color: '#cdcaca',
                    marginLeft: '10px',
                  }}
                >
                  {t('label.weather_forecast')}
                </p>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <p
                    style={{
                      textAlign: 'left',
                      color: '#cdcaca',
                      marginBottom: 0,
                    }}
                  >
                    {t('label.high')}
                  </p>
                  <div
                    style={{
                      backgroundColor: '#cdcaca',
                      height: '1px',
                      width: '45px',
                    }}
                  ></div>
                  <p
                    style={{
                      textAlign: 'left',
                      color: '#cdcaca',
                      marginBottom: 0,
                    }}
                  >
                    {t('label.low')}
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flex: '1',
                }}
              >
                {weather?.future?.map((ele: any, index: any) => {
                  if (index > 3) return;
                  return (
                    <>
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          flex: '1',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                          }}
                        >
                          <p>{getDayAbbreviation(ele?.time?.timestamp)}</p>
                          <img
                            src={
                              ele?.descriptor?.images?.find(
                                (image: any) => image.type === 'icon'
                              )?.url
                            }
                            alt=""
                            height="32px"
                            width="32px"
                          />
                          <p
                            style={{
                              fontWeight: 400,
                              margin: '0',
                            }}
                          >
                            {Number(ele?.tags?.temp_max)}°
                          </p>
                          <div
                            style={{
                              width: '80%',
                              height: '1px',
                              margin: 'auto',
                              backgroundColor: '#cdcaca',
                            }}
                          ></div>
                          <p
                            style={{
                              fontWeight: 400,
                              margin: '0',
                              opacity: '0.5',
                            }}
                          >
                            {Number(ele?.tags?.temp_min)}°
                          </p>
                        </div>
                      </div>
                      {index < 3 && (
                        <div
                          style={{
                            flex: '0.01 1',
                            backgroundColor: '#cdcaca',
                          }}
                        ></div>
                      )}
                    </>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.cropContainer}>
        <div className={styles.heading} style={{ background: '#DFF6D1' }}>
          {t('label.todays_advisory')}
        </div>
        <Grid
          container
          columns={3}
          overflow={'auto'}
          height={'calc(100% - 50px)'}
          justifyContent={'center'}
        >
          {(localStorage.getItem('locale') !== 'en'
            ? crop.filter((ele: any) =>
                ele.category_ids.some((categoryId: string) =>
                  categoryId.endsWith('translated')
                )
              )
            : crop.filter(
                (ele: any) =>
                  !ele.category_ids.some((categoryId: string) =>
                    categoryId.endsWith('translated')
                  )
              )
          ).map((ele: any, index: number) => {
            return (
              <Grid
                item
                key={index}
                sx={{
                  textAlign: 'center',
                  padding: '5px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                  borderRadius: '5px',
                  margin: '10px',
                  width: '26%',
                }}
                onClick={() => {
                  setShowWeatherAdvisoryPopup(true);
                  setSelectedCrop(ele);
                }}
              >
                <img
                  src={ele?.descriptor?.images?.[0]?.url}
                  alt=""
                  width={80}
                  height={80}
                />
                <p>{ele?.descriptor?.name}</p>
              </Grid>
            );
          })}
        </Grid>
      </div>
      <Menu />
    </div>
  );
};

export default WeatherPage;
