import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import ContextProvider from '../context/ContextProvider';
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import '@samagra-x/chatui/dist/index.css';
import { Toaster } from 'react-hot-toast';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import flagsmith from 'flagsmith/isomorphic';
import { FlagsmithProvider } from 'flagsmith/react';
import { useLogin } from '../hooks';
import axios from 'axios';
import FeaturePopup from '../components/FeaturePopup';
import { Button, Modal } from '@material-ui/core';

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
  // const [launch, setLaunch] = useState(true);
  const [cookie] = useCookies();
  const [flagsmithState, setflagsmithState] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const deferredPromptRef = useRef<any>(null);

  // useEffect(() => {
  //   setTimeout(() => {
  //     setLaunch(false);
  //   }, 2500);
  // }, []);

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

  // For install PWA dialog box
  useEffect(() => {
    if (localStorage.getItem('installPwa') !== 'true') {
      // Check if the browser has the install event
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        setModalOpen(true);
        window.addEventListener('beforeinstallprompt', (e) => {
          e.preventDefault();
          deferredPromptRef.current = e;
        });
      }
    }
  }, []);

  const closeAndSetLocalStorage = () => {
    setModalOpen(false);
    localStorage.setItem('installPwa', 'true');
  };

  const openInstallPrompt = () => {
    closeAndSetLocalStorage();
    if (deferredPromptRef.current) {
      deferredPromptRef.current.prompt();
      deferredPromptRef.current.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('App installed');
        } else {
          console.log('App installation declined');
        }
      });
    }
  };
  
  if (
    // launch || 
    !flagsmithState) {
    // return <LaunchPage />;
    return <></>;
  } else {
    return (
      <ChakraProvider>
        <FlagsmithProvider flagsmith={flagsmith} serverState={flagsmithState}>
          <ContextProvider>
            <div style={{ height: '100%' }}>
              <FeaturePopup />
              {modalOpen && (
                <Modal
                  open={modalOpen}
                  onClose={closeAndSetLocalStorage}
                  aria-labelledby="install-modal-title"
                  aria-describedby="install-modal-description"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <div
                    style={{
                      backgroundColor: 'lightgreen',
                      padding: '20px',
                      borderRadius: '5px',
                      textAlign: 'center',
                    }}>
                    <h2 id="install-modal-title">Install App</h2>
                    <p id="install-modal-description">
                      Click the button to install the app.
                    </p>
                    <Button
                      onClick={openInstallPrompt}
                      style={{
                        marginTop: '20px',
                        backgroundColor: 'var(--secondary)',
                        color: 'white',
                      }}>
                      Install
                    </Button>
                  </div>
                </Modal>
              )}
              <Toaster position="top-center" reverseOrder={false} />
              <NavBar />
              <SafeHydrate>
                <Component {...pageProps} />
              </SafeHydrate>
            </div>
          </ContextProvider>
        </FlagsmithProvider>
      </ChakraProvider>
    );
  }
};

export default App;
