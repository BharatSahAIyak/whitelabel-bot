// import { useState, useContext, useCallback, useMemo } from 'react';
// import styles from './index.module.css';
// import PlusIcon from '../../assets/icons/plus';
// import HomeIcon from '../../assets/icons/home';
// import { AppContext } from '../../context';
// import flagsmith from 'flagsmith/isomorphic';
// import router from 'next/router';
// import { v4 as uuidv4 } from 'uuid';
// import { useFlags } from 'flagsmith/react';
// import { useLocalization } from '../../hooks';
// import toast from 'react-hot-toast';
// import { Sidemenu } from '../Sidemenu';
// import { recordUserLocation } from '../../utils/location';
// import { useConfig } from '../../hooks/useConfig';
// import { useColorPalates } from '../../providers/theme-provider/hooks';

// function NavBar() {
//   const config = useConfig('component','navbar');
//   const flags = useFlags(['show_download_button', 'show_share_button']);
//   // const defaultLang = flagsmith.getValue('default_lang', { fallback: 'en' });
//   const [isEngActive, setIsEngActive] = useState(
//     localStorage.getItem('locale')
//       ? localStorage.getItem('locale') === 'en'
//       : true
//   );
//   const context = useContext(AppContext);
//   const t = useLocalization();

//   const toggleLanguage = useCallback(
//     (newLanguage: string) => () => {
//       localStorage.setItem('locale', newLanguage);
//       context?.setLocale(newLanguage);
//       setIsEngActive((prev) => (prev === true ? false : true));
//     },
//     [context]
//   );

  // const newChatHandler = useCallback(() => {
  //   if (context?.isMsgReceiving) {
  //     toast.error(`${t('error.wait_new_chat')}`);
  //     return;
  //   }

  //   recordUserLocation();

  //   const newConversationId = uuidv4();
  //   sessionStorage.setItem('conversationId', newConversationId);
  //   if (context?.audioElement) context?.audioElement.pause();
  //   if (context?.setAudioPlaying) context?.setAudioPlaying(false);
  //   context?.setConversationId(newConversationId);
  //   context?.setMessages([]);
  //   context?.setIsMsgReceiving(false);
  //   context?.setLoading(false);
  //   router.push('/');
  // }, [context, t]);



//   const botName = useMemo(() => {
//     return config?.brandName;
//   }, [config]);

 
//   const theme = useColorPalates();
 

//   if (router.pathname === '/chat' && !context?.isDown) {
//     return (
//       <div className={styles.navbar}>
//         <div
//           style={{ width: '120px', display: 'flex', alignItems: 'flex-start' }}>
//           <Sidemenu />
//           <div
//             onClick={() => {}}
//             // onClick={newChatHandler}
//             style={{
//               paddingLeft: '15px',
//               display: 'flex',
//               flexDirection: 'column',
//               alignItems: 'center',
//             }}>
//             <PlusIcon color={theme?.primary?.main} />
//             <p style={{ color: 'var(--font)', fontSize: '12px' }}>
//               {t('label.new_chat')}
//             </p>
//           </div>
//         </div>
//         <div
//           style={{
//             minWidth: '200px',
//             display: 'flex',
//             justifyContent: 'space-between',
//           }}>
//           <img
//             src={config?.leftLogo}
//             alt=""
//             width={60}
//             height={60}
//           />
//           <img
//             src={config?.centerLogo}
//             alt=""
//             width={60}
//             height={60}
//           />
//           <img
//             src={config?.rightLogo}
//             alt=""
//             width={60}
//             height={60}
//           />
//         </div>
//       </div>
//     );
//   } else
//     return (
//       <div className={styles.navbar}>
//         {localStorage.getItem('phoneNumber') ? (
//           <div
//             style={{
//               width: '120px',
//               display: 'flex',
//               alignItems: 'center',
//             }}>
//             <Sidemenu />

//             {router.pathname !== '/chat' && router.pathname !== '/' ? (
//               <div
//                 style={{ paddingLeft: '15px' }}
//                 onClick={() => {
//                   router.push('/');
//                 }}>
//                 <HomeIcon color={theme?.primary?.main} />
//               </div>
//             ) : null}
//           </div>
//         ) : (
//           <div style={{ display: 'flex', alignItems: 'center' }}>
//             <button
//               id="eng"
//               className={isEngActive ? styles.active : styles.btn}
//               style={{ borderRadius: '10px 0px 0px 10px' }}
//               onClick={toggleLanguage('en')}>
//               ENG
//             </button>
//             <button
//               id="hindi"
//               className={!isEngActive ? styles.active : styles.btn}
//               style={{ borderRadius: '0px 10px 10px 0px' }}
//               onClick={toggleLanguage('en')}>
//               Lang2
//             </button>
//           </div>
//         )}
//         <div
//           style={{
//             flex: 1,
//             textAlign: 'center',
//           }}>
//           {botName}
//         </div>
//         <div
//           style={{
//             minWidth: '200px',
//             display: 'flex',
//             justifyContent: 'space-between',
//           }}>
//           <img
//             src={config?.leftLogo}
//             alt=""
//             width={60}
//             height={60}
//           />
//           <img
//             src={config?.centerLogo}
//             alt=""
//             width={60}
//             height={60}
//           />
//           <img
//             src={config?.rightLogo}
//             alt=""
//             width={60}
//             height={60}
//           />
//         </div>
//       </div>
//     );
// }

// export default NavBar;

import React, { useCallback, useContext, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import Typography from '@mui/material/Typography';
import AddCircle from '@mui/icons-material/AddCircle';
import { useRouter } from 'next/router';
import { useColorPalates } from '../../providers/theme-provider/hooks';
import { useConfig } from '../../hooks/useConfig';
import Sidebar from '../../pageComponents/sidebar';
import { recordUserLocation } from '../../utils/location';
import { v4 as uuidv4 } from 'uuid';
import { AppContext } from '../../context';
import { useLocalization } from '../../hooks';
import toast from 'react-hot-toast';

const Navbar: React.FC = () => {
    const router = useRouter();
    const config = useConfig('component', 'navbar');
    const context = useContext(AppContext);
    const t = useLocalization();
    const theme = useColorPalates();
    const {
        brandName,
        showHamburgerMenu,
        logos: {
            showCenterLogos,
            centerLogoIcons,
            showRightLogos,
            rightLogoIcons
        }
    } = config;

    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const newChatHandler = useCallback(() => {
        if (context?.isMsgReceiving) {
            toast.error(`${t('error.wait_new_chat')}`);
            return;
        }

        recordUserLocation();

        const newConversationId = uuidv4();
        sessionStorage.setItem('conversationId', newConversationId);
        if (context?.audioElement) context?.audioElement.pause();
        if (context?.setAudioPlaying) context?.setAudioPlaying(false);
        context?.setConversationId(newConversationId);
        context?.setMessages([]);
        context?.setIsMsgReceiving(false);
        context?.setLoading(false);
        router.push('/');
    }, [context, t, router]);

    return (
        <>
            <AppBar position="static" sx={{ background: theme.primary.dark }}>
                <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {showHamburgerMenu && (
                            <IconButton
                                size="large"
                                edge="start"
                                color="primary"
                                aria-label="open drawer"
                                sx={{ mr: 2, width: '50px', height: '50px' }}
                                onClick={toggleSidebar}
                                
                            >
                                <MenuIcon  sx={{ fontSize: '50px' }} />
                            </IconButton>
                        )}
                        {router.pathname === '/chat' && (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <IconButton
            color="primary"  
            size="large"
            edge="start"
            aria-label="home"
            style={{ fontSize: '2rem', width: '28px', height: '28px', margin: 0 }} // Adjusted styling
            onClick={newChatHandler}
        >
            <AddCircle  sx={{ fontSize: '30px' }} />
        </IconButton>
        <Typography variant="body1" color="black"    sx={{ fontSize: '15px' }} >
            New Chat
        </Typography>
    </div>
)}


                        {router.pathname !== '/' && router.pathname !== '/chat' && (
                            <IconButton
                                color="primary"
                                size="large"
                                edge="start"
                                aria-label="home"
                                style={{ fontSize: '2rem', height: '48px' }}
                                onClick={() => router.push('/')}
                            >
                                <HomeIcon sx={{ fontSize: '50px' }} />
                            </IconButton>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        {showCenterLogos && centerLogoIcons.map((logo: any) => (
                            <img key={logo.id} src={logo.src} alt={`Logo ${logo.id}`} style={{ maxHeight: '48px' }} />
                        ))}

                        {brandName && (
                            <Typography variant="h6" color="inherit" sx={{ marginTop: 1, fontSize: '1.5rem' }}>
                                {brandName}
                            </Typography>
                        )}
                    </div>

                    {showRightLogos && (
                        <div style={{ marginTop: '10px' }} >
                            {rightLogoIcons.map((logo: any) => (
                                <img key={logo.id} src={logo.src} alt={`Right Logo ${logo.id}`} style={{ maxHeight: '60px' }} />
                            ))}
                        </div>
                    )}

                </Toolbar>
            </AppBar>

            <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
        </>
    );
};

export default Navbar;
