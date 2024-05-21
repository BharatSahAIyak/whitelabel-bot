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
import { useColorPalates } from '../../providers/theme-provider/hooks';
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
  const [isNight, setIsNight] = useState(false);
  const [showWeatherAdvisoryPopup, setShowWeatherAdvisoryPopup] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  console.log({ config });
  const theme = useColorPalates();

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
        const res = await axios.get(
          `${
            process.env.NEXT_PUBLIC_BFF_API_URL
          }/weather?latitude=${sessionStorage.getItem(
            'latitude'
          )}&longitude=${sessionStorage.getItem('longitude')}`
        );
        console.log(res);
        setWeather(res?.data);
      } catch (err) {
        console.log(err);
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

  if (!weather) {
    return <FullPageLoader loading={!weather} />;
  }
  return (
    <>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"></meta>
      {showWeatherAdvisoryPopup && <WeatherAdvisoryPopup cropName={selectedCrop} setShowWeatherAdvisoryPopup={setShowWeatherAdvisoryPopup} />}
      <div className={styles.container}>
        <Image src={isNight ? NightBg : SunnyBg} layout="fill" />
        <div className={styles.weatherText}>
          <div>
            <h1 style={{ color: 'white' }}>{weather?.days?.[0]?.temp}°C</h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1>{weather?.currentConditions?.conditions}</h1>
            {sessionStorage.getItem('city') && (
              <p style={{ display: 'flex', alignItems: 'center' }}>
                <LocationOnRoundedIcon style={{ fontSize: '1rem' }} />
                {sessionStorage.getItem('city')}
              </p>
            )}
          </div>
        </div>

        <div className={styles.weatherBottom}>
          <Grid container spacing={{ xs: 2, md: 3 }} columns={3}>
            <Grid item xs={1} sm={1} md={1}>
              <Chip
                label={getClosestDirection(weather?.days?.[0]?.winddir)}
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
                हवा की दिशा
              </p>
            </Grid>
            <Grid item xs={1} sm={1} md={1}>
              <Chip
                label={weather?.days?.[0]?.windspeed + ' km/h'}
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
                हवा की गति
              </p>
            </Grid>
            <Grid item xs={1} sm={1} md={1}>
              <Chip
                label={weather?.days?.[0]?.humidity + '%'}
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
                नमी
              </p>
            </Grid>
          </Grid>

          <div style={{ marginTop: '30px' }}>
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
                अगले 4 दिनों का पूर्वानुमान
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flex: '1',
                }}>
                {weather?.days.map((ele: any, index: any) => {
                  if (index === 0 || index > 4) return;
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
                          {getDayAbbreviation(ele.datetime)}
                        </p>
                        <Image
                          src={weatherImages?.[ele.icon] || SunRainCloud}
                          alt=""
                          height={'32px'}
                        />
                        <p style={{ fontWeight: 400 }}>{ele.temp + '°C'}</p>
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
          आज की फ़सल सलाह
        </div>
        <Grid
          container
          columns={3}
          overflow={'auto'}
          height={'calc(100% - 50px)'}
          justifyContent={'center'}>
          {[
            'banana',
            'Arhar',
            'maize',
            'bengal gram',
            'barjra',
            'ber',
            'bitter gourd',
          ].map((ele, index) => {
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
                onClick={() => {setShowWeatherAdvisoryPopup(true); setSelectedCrop(ele)}}>
                <Image
                  src={`/crops/${ele}.jpeg`}
                  alt=""
                  width={100}
                  height={100}
                />
                <p>{ele}</p>
              </Grid>
            );
          })}
        </Grid>
      </div>
    </>
  );
};

export default WeatherPage;
