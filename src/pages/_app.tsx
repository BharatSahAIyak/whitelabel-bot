import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import '@samagra-x/chatui/dist/index.css';
import 'bootstrap-css-only/css/bootstrap.min.css'
import { Toaster } from 'react-hot-toast';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useLogin } from '../hooks';
import FeaturePopup from '../components/feature-popup';
import Provider from '../providers';
import { InstallModal } from '../components/install-modal';
import { FullPageLoader } from '../components/fullpage-loader';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
// import OnBoardingPage from '../pageComponents/onboarding-page';

const NavBar = dynamic(() => import('../components/navbar'), {
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
  const [cookie, setCookie, removeCookie] = useCookies();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!sessionStorage.getItem('sessionId')) {
      sessionStorage.setItem('sessionId', uuidv4());
    }
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
        removeCookie('access_token', { path: '/' })
        router.push('/login');
      }
    }
  }, [cookie, router]);

  useEffect(() => {
    handleLoginRedirect();
  }, [handleLoginRedirect]);

  const fetchUser = async () => {
    try {
      const res = await axios.get(process.env.NEXT_PUBLIC_BFF_API_URL + '/user/' + localStorage.getItem('userID'), {
        headers: {
          Authorization: process.env.NEXT_PUBLIC_FUSIONAUTH_KEY || '',
          "Service-Url": process.env.NEXT_PUBLIC_FUSIONAUTH_URL || ''
        }
      })
      setUser(res?.data?.user);
    }catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    console.log({user})
  }, [user])

  useEffect(() => {
    if (!isAuthenticated) {
      login();
    }else{
      fetchUser()
    }
  }, [isAuthenticated, login]);

  if (process.env.NODE_ENV === 'production') {
    globalThis.console.log = () => {};
  }

  if (typeof window === 'undefined') return <FullPageLoader loading />;
  // if(isAuthenticated && user && !user?.data?.profile){
  //   return (
  //     <Provider>
  //     <OnBoardingPage setUser={setUser}/>
  //     </Provider>
  //   )
  // }
    return (
      <Provider>
        <>
          <div style={{ height: '100%' }}>
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
