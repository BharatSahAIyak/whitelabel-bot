import '../styles/globals.css';
import type { AppProps } from 'next/app';
import ContextProvider from '../context/ContextProvider';
import { ReactElement, useCallback, useEffect, useState } from 'react';
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
import { FlagsmithProvider } from 'flagsmith/react';
import flagsmith from 'flagsmith/isomorphic';

const LaunchPage = dynamic(() => import('../components/LaunchPage'), {
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
  const [flagsmithState, setflagsmithState] = useState(null);
  const [cookie] = useCookies();

  useEffect(() => {
    const getFlagSmithState = async () => {
      await flagsmith.init({
        // api: process.env.NEXT_PUBLIC_FLAGSMITH_API,
        environmentID: process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID || '',
      });
      if (flagsmith.getState()) {
        //@ts-ignore
        setflagsmithState(flagsmith.getState());
      }
    };
    getFlagSmithState();
  }, []);

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

  if (process.env.NODE_ENV === 'production') {
    globalThis.console.log = () => {};
  }

  if (typeof window === 'undefined') return <FullPageLoader loading />;
  if (
    // launch ||
    !flagsmithState
  ) {
    // return <LaunchPage />;
    return <></>;
  } else
    return (
      <Provider>
        <FlagsmithProvider flagsmith={flagsmith} serverState={flagsmithState}>
          <ContextProvider>
            <div style={{ height: '100%' }}>
              <Toaster position="top-center" reverseOrder={false} />
              <FeaturePopup />
              <InstallModal />
              {isAuthenticated && <NavBar />}
              <SafeHydrate>
                <Component {...pageProps} />
              </SafeHydrate>
            </div>
          </ContextProvider>
        </FlagsmithProvider>
      </Provider>
    );
};

export default App;
