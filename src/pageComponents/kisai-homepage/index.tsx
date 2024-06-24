import React, { useEffect, useState } from 'react';
import styles from './index.module.css';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import { Chip, Grid, Button } from '@mui/material';
import { useConfig } from '../../hooks/useConfig';
import { useLocalization } from '../../hooks';
import axios from 'axios';
import { FullPageLoader } from '../../components/fullpage-loader';
import WeatherAdvisoryPopup from '../../components/weather-advisory-popup';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useRouter } from 'next/router';
import Menu from '../../components/menu';

const Kisai: React.FC = () => {
    const t = useLocalization();
    const router = useRouter();
    const config = useConfig('component', 'weatherPage');
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
                        } else if (
                            provider.category_id === 'weather_provider'
                        ) {
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

        fetchWeatherData();
    }, []);

    const handleClick = () => {
        router.push('/weather');
    };

    const handleBoxClick = (boxName: string) => {
        switch (boxName) {
            case 'Weather Information':
                router.push('/weather');
                break;
            case 'Scheme':
                router.push('/chat');
                break;
            case 'Pest':
                router.push('/chat');
                break;
            case 'Other Information':
                router.push('/chat');
                break;
            default:
                break;
        }
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

    const boxes = [
        {
            name: 'Weather Information',
            image: 'https://s6.imgcdn.dev/3A96h.png',
        },
        { name: 'Scheme', image: 'https://s6.imgcdn.dev/3Ad2n.png' },
        { name: 'Pest', image: 'https://s6.imgcdn.dev/3AbIv.png' },
        { name: 'Other Information', image: 'https://s6.imgcdn.dev/3A3Hg.png' },
    ];

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
                                image.type ===
                                (isNight ? 'image_night' : 'image_day')
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
                                      `conditions${
                                          '_' +
                                              localStorage.getItem('locale') ||
                                          ''
                                      }`
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
                                <LocationOnRoundedIcon
                                    style={{ fontSize: '1.5rem' }}
                                />
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
                                label={
                                    (weather?.current?.tags?.windspeed || 0) +
                                    ' km/h'
                                }
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
                                label={
                                    (weather?.current?.tags?.humidity || 0) +
                                    ' %'
                                }
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
                                color: '#115223',
                                fontSize: '18px',
                                width: '308px',
                                height: '60px',
                                padding: '18px 24px',
                                fontWeight: '500',
                                borderRadius: '6px 0px 0px 0px',
                                border: '1px solid transparent',
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: '#D6D6DB',
                                },
                            }}
                            onClick={handleClick}
                        >
                            Know more about crops
                        </Button>
                    </div>
                </div>
            </div>

            <div className={styles.spacing}></div>

            <div className={styles.cropContainer}>
                <div
                    className={styles.heading}
                    style={{ background: '#DFF6D1' }}
                >
                    {t('message.ask_ur_question')}
                </div>
                <Grid container spacing={1} justifyContent="center">
                    {boxes.map((box, index) => (
                        <Grid
                            item
                            xs={4}
                            sm={4}
                            md={4}
                            key={index}
                            sx={{
                                textAlign: 'center',
                                padding: '5px',
                                backgroundColor: 'white',
                                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                                borderRadius: '15.87px',
                                margin: '10px',
                                cursor: 'pointer',
                            }}
                            onClick={() => handleBoxClick(box.name)}
                        >
                            <img
                                src={box.image}
                                alt={box.name}
                                width={80}
                                height={80}
                            />
                            <p style={{ marginTop: '1px' }}>{box.name}</p>
                        </Grid>
                    ))}
                </Grid>

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
                        आमा कृषी चैटबॉट गलतियाँ कर सकता है। महत्वपूर्ण जानकारी
                        की जाँच करने पर विचार करें. हमारी शर्तें और गोपनीयता
                        नीति पढ़ें।
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

export default Kisai;
