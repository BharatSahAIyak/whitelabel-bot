import React from 'react';
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

const WeatherPage: React.FC = () => {
  const t = useLocalization();
  const config = useConfig('component', 'weatherPage');
  console.log({ config });
  const theme = useColorPalates();

  const chips = [
    { id: 1, heading: 'हवा की दिशा', label: 'उत्तर पश्चिम' },
    { id: 2, heading: 'हवा की गति', label: 'धीमी', color: '#101860' },
    { id: 3, heading: 'नमी', label: 'ज़्यादा', color: '#4CC3CB' },
  ];
  const upcomingWeatherData = [
    { id: 1, day: 'Sun', temp: '21°C', img: RainingCloud },
    { id: 2, day: 'Mon', temp: '21°C', img: ThunderCloud },
    { id: 3, day: 'Tue', temp: '21°C', img: SunRainCloud },
    { id: 4, day: 'Thur', temp: '21°C', img: HeavyRain },
  ];

  return (
    <>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"></meta>
      <div className={styles.container}>
          <Image src={SunnyBg} layout="fill" />
          <div className={styles.weatherText}>
            <div>
              <h1
                style={{ color: 'white' }}>
                27°C
              </h1>
            </div>
            <div style={{textAlign: 'right' }}>
              <h1>स्पष्ट</h1>
              <p>
                <LocationOnRoundedIcon
                  style={{ fontSize: '1rem'}}
                />
                बिशनपुर सेक्टर 58, नोएडा
              </p>
            </div>
          </div>

        <div className={styles.weatherBottom}>
            <Grid
              container
              spacing={{ xs: 2, md: 3 }}
              columns={3}>
              {chips.map((chip) => (
                <Grid item xs={1} sm={1} md={1}>
                  <Chip
                    label={chip?.label}
                    size="medium"
                    sx={{
                      fontSize: '16px',
                      fontWeight: '600',
                      minWidth: '70px',
                      background: chip?.color ?? null,
                      color: chip?.color ? 'white' : 'black',
                    }}
                  />
                  <p
                    style={{
                      minWidth: '70px',
                      background: 'white',
                      color: 'black',
                      fontWeight: '600',
                      marginTop: '5px'
                    }}>
                    {chip?.heading}
                  </p>
                </Grid>
              ))}
            </Grid>

            <div style={{ marginTop: '30px' }}>
              <div
                style={{
                  color: 'black',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                }}>
                <p style={{ width: '15%', fontSize: '14px', fontWeight: 600, margin: '0 0 0 10px' }}>
                  अगले 4 दिनों का पूर्वानुमान
                </p>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    flex: '1',
                  }}>
                  {upcomingWeatherData.map((ele, index) => (
                    <div
                      key={ele.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                        flex: '1',
                      }}>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 600 }}>
                          {ele.day}
                        </p>
                        <Image
                          src={ele.img}
                          alt=""
                          style={{ margin: '8px 0' }}
                          height={'32px'}
                        />
                        <p style={{ fontSize: '16px', fontWeight: 400 }}>
                          {ele.temp}
                        </p>
                      </div>
                      {index !== 3 && (
                        <div
                          style={{
                            width: '1px',
                            height: '80%',
                            backgroundColor: '#ccc',
                            margin: '0 5px',
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
    </>
  );
};

export default WeatherPage;
