import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import '@samagra-x/chatui/dist/index.css';
import 'bootstrap-css-only/css/bootstrap.min.css';
import { Toaster } from 'react-hot-toast';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useLogin } from '../hooks';
import Provider from '../providers';
// import { InstallModal } from '../components/install-modal';
import { FullPageLoader } from '../components/fullpage-loader';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import OnBoardingPage from '../pageComponents/onboarding-page';
import { requestForToken, initializeFirebase } from '../config/firebase';
import NotificationModal from '../components/notification-modal';

const NavBar = dynamic(() => import('../components/navbar'), {
  ssr: false,
});

function SafeHydrate({ children }: { children: ReactElement }) {
  return <div suppressHydrationWarning>{typeof window === 'undefined' ? null : children}</div>;
}

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const { isAuthenticated, login } = useLogin();
  const [cookie, setCookie, removeCookie] = useCookies();
  const [user, setUser] = useState<any>(null);
 
 
  const [token, setToken] = useState('');

  const getToken = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await requestForToken();
      if (token) {
        console.log('your token is here', token);
        setToken(token);
      }
    } else {
      console.log('permission not granted');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {

      if (!sessionStorage.getItem('sessionId')) {
        sessionStorage.setItem('sessionId', uuidv4());
      }

      initializeFirebase();
      getToken();

      const firebaseConfig = encodeURIComponent(
        JSON.stringify({
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
          measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
        })
      );

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register(`/firebase-messaging-sw.js?firebaseConfig=${firebaseConfig}`)
          .then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch((err) => {
            console.error('Service Worker registration failed:', err);
          });
      }
    }
  }, [isAuthenticated]);

 
  if (typeof window !== 'undefined') {
    window.updateFCMToken = (param: string) => {
      console.log('updateFCMToken called');
      return 'updateFCMToken called' + param;
      // TODO: save this token for this user
    };
    window.updateNotificationPayload = (stringifiedPayload: string) => {
      console.log('updateNotificationPayload called with param', stringifiedPayload);
      const payload = JSON.parse(stringifiedPayload);
      const request = indexedDB.open('notificationDB', 1);
      request.onerror = (event: any) => {
        console.error('IndexedDB error:', event?.target?.error);
      };
      request.onsuccess = (event: any) => {
        const db = event?.target?.result;
        const transaction = db.transaction(['notifications'], 'readwrite');
        const store = transaction.objectStore('notifications');

        // Add the payload to IndexedDB
        const addRequest = store.add({ ...payload, timestamp: Date.now() });

        addRequest.onerror = (event: any) => {
          console.error('Error adding payload to IndexedDB:', event.target.error);
        };

        addRequest.onsuccess = () => {
          setKey((prevKey: any) => prevKey + 1);
          console.log('Payload added to IndexedDB successfully');
        };
      };

      return 'updateNotificationPayload processed';
    };
  }

  const handleLoginRedirect = useCallback(() => {
    if (router.pathname === '/login' || router.pathname.startsWith('/otp')) {
      // already logged in then send to home
      if (localStorage.getItem('auth') && localStorage.getItem('userID')) {
        console.log('here');
        router.push(sessionStorage.getItem('path') ?? '/');
      }
    } else {
      if (router.query.navbar) {
        sessionStorage.setItem('navbar', router.query.navbar as string);
      }
      if (router.query.navigation) {
        sessionStorage.setItem('navigation', router.query.navigation as string);
      }
      if (router.query.userType) {
        sessionStorage.setItem('userType', router.query.userType as string);
      }
      if (router.query.phoneNumber) {
        localStorage.setItem('phoneNumber', router.query.phoneNumber as string);
      }
      sessionStorage.setItem('path', router.asPath);
      if (router.query.auth && router.query.userId) {
        // setCookie('access_token', router.query.auth, { path: '/' });
        localStorage.setItem('auth', router.query.auth as string);
        localStorage.setItem('userID', router.query.userId as string);
        sessionStorage.removeItem('conversationId');
      } else if (!localStorage.getItem('auth') || !localStorage.getItem('userID')) {
        const userType = sessionStorage.getItem('userType');
        localStorage.clear();
        sessionStorage.clear();
        userType && sessionStorage.setItem('userType', userType);
        removeCookie('access_token', { path: '/' });
        router.push('/login');
      }
    }
  }, [removeCookie, router]);

  useEffect(() => {
    handleLoginRedirect();
  }, [handleLoginRedirect]);

  useEffect(() => {
    const fetchConfig = async () => {
      fetch(process.env.NEXT_PUBLIC_CONFIG_BASE_URL || '')
        .then((res) => res.json())
        .then((data) => {
          console.log('main data', data?.data?.config);
          const faviconUrl = data?.data?.config?.component?.botDetails?.favicon;
          console.log({ faviconUrl });
          var myDynamicManifest = {
            short_name: 'Bot',
            name: 'Bot',
            icons: [
              {
                src: faviconUrl,
                sizes: '64x64 32x32 24x24 16x16',
                type: 'image/x-icon',
              },
              {
                src: faviconUrl,
                type: 'image/png',
                sizes: '192x192',
              },
              {
                src: faviconUrl,
                type: 'image/png',
                sizes: '512x512',
              },
            ],
            start_url: window?.location?.href || '/',
            display: 'fullscreen',
            theme_color: 'black',
            background_color: 'white',
          };

          const stringManifest = JSON.stringify(myDynamicManifest);
          const blob = new Blob([stringManifest], {
            type: 'application/json',
          });
          const manifestURL = URL.createObjectURL(blob);
          document.getElementById('manifest-file')?.setAttribute('href', manifestURL);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    fetchConfig();
  }, []);

  const fetchUser = async () => {
    try {
      const userID = localStorage.getItem('userID');
      const res = await axios.get(`/api/fetchUser?userID=${userID}`);
      setUser(res?.data?.user);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      login();
    } else if (process.env.NEXT_PUBLIC_SHOW_ONBOARDING === 'true') {
      fetchUser();
    }
  }, [isAuthenticated, login]);

  if (process.env.NODE_ENV === 'production') {
    globalThis.console.log = () => {};
  }

  if (typeof window === 'undefined') return <FullPageLoader loading />;
  if (isAuthenticated && user && !user?.data?.profile) {
    return (
      <Provider>
        <OnBoardingPage setUser={setUser} />
      </Provider>
    );
  }
  return (
    <Provider>
      <>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        ></meta>
        <div style={{ height: '100dvh', width: '100dvw', position: 'fixed' }}>
          <Toaster position="top-center" reverseOrder={false} />
          {/* {localStorage.getItem("navbar") !== "hidden" &&<InstallModal />} */}
          {sessionStorage.getItem('navbar') !== 'hidden' && <NavBar />}
          <NotificationModal key={key} />

          <SafeHydrate>
            <Component {...pageProps} />
          </SafeHydrate>
        </div>
      </>
    </Provider>
  );
};

export default App;
