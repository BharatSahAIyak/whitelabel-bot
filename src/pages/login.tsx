import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useLocalization } from '../hooks';
import LoginMobileAadharPage from '../pageComponents/login-mobile-aadhar-page';

const Login: NextPage = () => {
  const t=useLocalization();

  return (
    <React.Fragment>
      <Head>
      <title>{t("label.title")}</title>
      </Head>
      <LoginMobileAadharPage />
    </React.Fragment>
  );
};

export default Login;
