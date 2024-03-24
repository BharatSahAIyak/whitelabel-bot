import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';

import { useLocalization } from '../hooks';
import FAQPage from '../pageComponents/faq-page';

const Faq: NextPage = () => {
  const t=useLocalization();
  return (
    <React.Fragment>
      <Head>
      <title>{t("label.title")}</title>
      </Head>
      <FAQPage />
    </React.Fragment>
  );
};

export default Faq;
