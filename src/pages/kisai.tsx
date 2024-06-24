import React, { useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useLocalization } from '../hooks';
import { useConfig } from '../hooks/useConfig';
import KisaiHomepage from '../pageComponents/kisai-homepage';
import { recordUserLocation } from '../utils/location';

const Kisai: NextPage = () => {
    const t = useLocalization();
    const config = useConfig('component', 'botDetails');
    useEffect(() => {
        recordUserLocation();
    }, []);

    return (
        <React.Fragment>
            <Head>
                <title>{t('label.tab_title')}</title>
                <link rel="icon" href={config?.favicon} />
            </Head>
            <KisaiHomepage />
        </React.Fragment>
    );
};

export default Kisai;
