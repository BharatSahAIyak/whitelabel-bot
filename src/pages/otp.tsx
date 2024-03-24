import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useLocalization } from '../hooks';
import OtpPage from '../pageComponents/otp-page';


const OTP: NextPage = () => {
  const t=useLocalization();
  return (
    <React.Fragment>
      <Head>
      <title>{t("label.title")}</title>
      </Head>
      <OtpPage />
    </React.Fragment>
  );
};

export default OTP;
