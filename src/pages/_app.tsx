import '../styles/globals.css';
import type { AppProps } from 'next/app';

import { ReactElement, useCallback, useContext, useEffect, useState } from 'react';

import '@samagra-x/chatui/dist/index.css';
import { Toaster } from 'react-hot-toast';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useLogin } from '../hooks';
import FeaturePopup from '../components/FeaturePopup';
import Provider from '../providers';
import { InstallModal } from '../components/install-modal';
import { FullPageLoader } from '../components/fullpage-loader';
import flagsmith from 'flagsmith/isomorphic';
import { AppContext } from '../context';
import { useConfig } from '../hooks/useConfig';
import { messaging, analytics } from '../utils/firebase';
import { getToken } from 'firebase/messaging';
import FcmNotification from '../utils/FcmNotification';
import axios from 'axios';

const LaunchPage = dynamic(() => import('../pageComponents/launch-page'), {
  ssr: false,
});

const NavBar = dynamic(() => import('../components/NavBar'), {
  ssr: false,
});
function SafeHydrate({ children }: { children: ReactElement }) {
  return (
    <div suppressHydrationWarning>
      {typeof window === 'undefined' ? null : children}
    </div>
  );
}

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const { isAuthenticated, login } = useLogin();
  const [cookie, setCookie] = useCookies();

 
  const context =useContext(AppContext);

  // useEffect(() => {
  //   const getFlagSmithState = async () => {
  //     await flagsmith.init({
  //       // api: process.env.NEXT_PUBLIC_FLAGSMITH_API,
  //       environmentID: process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID || '',
  //     });
  //     if (flagsmith.getState()) {
  //       //@ts-ignore
  //       setflagsmithState(flagsmith.getState());
  //     }
  //   };
  //   getFlagSmithState();
  // }, []);

  const handleLoginRedirect = useCallback(() => {
    if (router.pathname === '/login' || router.pathname.startsWith('/otp')) {
      // already logged in then send to home
      if (cookie['access_token'] && localStorage.getItem('userID')) {
        router.push('/');
      }
    } else {
      // not logged in then send to login page
      if (!cookie['access_token'] || !localStorage.getItem('userID')) {
        localStorage.clear();
        sessionStorage.clear();
        router.push('/login');
      }
    }
  }, [cookie, router]);

  useEffect(() => {
    handleLoginRedirect();
  }, [handleLoginRedirect]);

  useEffect(() => {
    if (!isAuthenticated) {
      login();
    }
  }, [isAuthenticated, login]);

  // FCM tokens

   const updateUser = useCallback(
    async (
      fcmToken: string | null | undefined
      // permissionPromise: Promise<string | null>
    ): Promise<void> => {
      try {
        const userID = cookie['userID'];
        const user = await axios.get(`/src/pages/api/getUser.js?userID=${userID}`);
        console.log('i am inside updateUser');
        if (
          fcmToken &&
          user?.data?.user?.username &&
          fcmToken !== user?.data?.user?.data?.fcmToken
        ) {
          await axios.put(
            `/src/pages/api/updateUser?userID=${userID}&fcmToken=${fcmToken}&username=${user?.data?.user?.username}`
          );
        }
      } catch (err) {
        console.error(err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    const userID = cookie['userID'];
    if (isAuthenticated || userID) {
      const requestPermission = async (): Promise<string | null> => {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
          });
          let expires = new Date();
          expires.setMonth(expires.getMonth() + 1);
          setCookie('fcm-token', token, {  
            path: '/',
            expires,
            secure: false,
            sameSite: 'strict',
          });
          // localStorage.setItem('fcm-token', token);
          console.log('Token', token);
          return token;
        }
        return null; // Return null if permission isn't granted
      };

      const updateAndRequestPermission = async (): Promise<void> => {
        const permissionPromise = await requestPermission();
        console.log({ permissionPromise });
        await updateUser(permissionPromise);
      };

      updateAndRequestPermission();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, updateUser]);

  if (process.env.NODE_ENV === 'production') {
    globalThis.console.log = () => {};
  }

  if (typeof window === 'undefined') return <FullPageLoader loading />;
  return (
    <Provider>
      <>
        <div style={{ height: '100%' }}>
                 <FcmNotification />
          <Toaster position="top-center" reverseOrder={false} />
          <FeaturePopup />
          <InstallModal />
          <NavBar />
          <SafeHydrate>
            <Component {...pageProps} />
          </SafeHydrate>
        </div>
      </>
    </Provider>
  );
};

export default App;
