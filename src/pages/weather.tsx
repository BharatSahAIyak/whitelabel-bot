
import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useLocalization } from '../hooks';
import { useConfig } from "../hooks/useConfig";
import WeatherPage from '../pageComponents/weather-page';

const Weather: NextPage = () => {
  const t=useLocalization();
  const config = useConfig("component", "botDetails");
  return (
    <React.Fragment>
      <Head>
        <title>{t("label.tab_title")}</title>
        <link rel="icon" href={config?.favicon} />
      </Head>
      <WeatherPage />
    </React.Fragment>
  );
};

export default Weather;
