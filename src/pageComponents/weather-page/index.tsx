import React, { useEffect, useState } from 'react';
import styles from './index.module.css';
import RainingCloud from './assets/raining-cloud.png';
import HeavyRain from './assets/heavy-rain.png';
import SunRainCloud from './assets/sun-rain-cloud.png';
import ThunderCloud from './assets/thunder-cloud.png';
import CloudyBg from './assets/cloudy-bg.png';
import NightBg from './assets/night-bg.png';
import RainyBg from './assets/rainy-bg.png';
import SunnyBg from './assets/sunny-bg.png';
import ThunderBg from './assets/thunder-bg.png';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import { Chip, Grid } from '@mui/material';
import { useConfig } from '../../hooks/useConfig';
import { useLocalization } from '../../hooks';
import Image from 'next/image';
import axios from 'axios';
import { FullPageLoader } from '../../components/fullpage-loader';
import WeatherAdvisoryPopup from '../../components/weather-advisory-popup';

const WeatherPage: React.FC = () => {
  const t = useLocalization();
  const config = useConfig('component', 'weatherPage');
  const [weather, setWeather] = useState<any>(null);
  const [crop, setCrop] = useState<any>(null);
  const [isNight, setIsNight] = useState(false);
  const [showWeatherAdvisoryPopup, setShowWeatherAdvisoryPopup] =
    useState(false);
  const [selectedCrop, setSelectedCrop] = useState<any>(null);
  console.log({ config });

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 18 || currentHour < 6) {
      setIsNight(true);
    }
  }, []);

  useEffect(() => {
    const fetch = async () => {
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

  const weatherImages: any = {
    'clear-day': SunRainCloud,
    'partly-cloudy-day': RainingCloud,
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
    <>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"></meta>
      {showWeatherAdvisoryPopup && (
        <WeatherAdvisoryPopup
          cropName={selectedCrop?.code}
          setShowWeatherAdvisoryPopup={setShowWeatherAdvisoryPopup}
          advisory={selectedCrop}
        />
      )}
      <div className={styles.container}>
        <Image src={isNight ? NightBg : SunnyBg} layout="fill" />
        <div className={styles.weatherText}>
          <div>
            <h1 style={{ color: 'white' }}>{weather?.current?.tags?.temp}°C</h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1>{weather?.currentConditions?.conditions}</h1>
            {sessionStorage.getItem('city') && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <LocationOnRoundedIcon style={{ fontSize: '1.5rem' }} />
                <span style={{fontSize: '1.5rem', fontWeight: '500'}}>{sessionStorage.getItem('city')}</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.weatherBottom}>
          <Grid container spacing={{ xs: 2, md: 3 }} columns={3}>
            {weather?.current?.tags?.winddir && <Grid item xs={1} sm={1} md={1}>
              <Chip
                label={getClosestDirection(weather?.current?.tags?.winddir)}
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
                }}>
                {t('label.wind_direction')}
              </p>
            </Grid>}
            {weather?.current?.tags?.windspeed && <Grid item xs={1} sm={1} md={1}>
              <Chip
                label={weather?.current?.tags?.windspeed + ' km/h'}
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
                }}>
                {t('label.wind_speed')}
              </p>
            </Grid>}
            {weather?.current?.tags?.humidity && <Grid item xs={1} sm={1} md={1}>
              <Chip
                label={weather?.current?.tags?.humidity + '%'}
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
                }}>
                {t('label.humidity')}
              </p>
            </Grid>}
          </Grid>

          <div style={{ marginTop: '10px' }}>
            <div
              style={{
                color: 'black',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
              }}>
              <p
                style={{
                  width: '15%',
                  fontWeight: 600,
                  margin: '0 0 0 10px',
                }}>
                {t('label.weather_forecast')}
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flex: '1',
                }}>
                {weather?.future?.map((ele: any, index: any) => {
                  if (index > 3) return;
                  return (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                        flex: '1',
                      }}>
                      <div>
                        <p style={{ fontWeight: 600 }}>
                          {getDayAbbreviation(ele?.time?.timestamp)}
                        </p>
                        <Image
                          src={weatherImages?.[ele.icon] || SunRainCloud}
                          alt=""
                          height={'32px'}
                        />
                        <p style={{ fontWeight: 400 }}>
                          {(Number(ele?.tags?.temp_max) +
                            Number(ele?.tags?.temp_min)) /
                            2 +
                            '°C'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.cropContainer}>
        <div className={styles.heading} style={{ background: '#DFF6D1' }}>
          {t('label.todays_crop_advisory')}
        </div>
        <Grid
          container
          columns={3}
          overflow={'auto'}
          height={'calc(100% - 50px)'}
          justifyContent={'center'}>
          {(localStorage.getItem('locale') !== 'en'
            ? crop.filter((ele: any) =>
                ele.category_ids.some((categoryId: string) =>
                  categoryId.endsWith('translated')
                )
              )
            : crop.filter((ele: any) =>
                !ele.category_ids.some(
                  (categoryId: string) => categoryId.endsWith('translated')
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
                  margin: '5px',
                  width: '29%',
                }}
                onClick={() => {
                  setShowWeatherAdvisoryPopup(true);
                  setSelectedCrop(ele);
                }}>
                <Image
                  src={`/crops/${ele?.code}.jpeg`}
                  alt=""
                  width={100}
                  height={100}
                />
                <p>{ele?.code}</p>
              </Grid>
            );
          })}
        </Grid>
      </div>
    </>
  );
};

export default WeatherPage;
