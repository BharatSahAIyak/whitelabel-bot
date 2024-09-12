import React, { useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useConfig } from '../../hooks/useConfig';
import Sidebar from '../sidebar';
import { AppContext } from '../../context';
import { useLocalization } from '../../hooks';
import toast from 'react-hot-toast';
import Nav from '@samagra-x/stencil-molecules/lib/navbar/navbar';
import { v4 as uuidv4 } from 'uuid';

const Navbar: React.FC = () => {
  const router = useRouter();
  const config = useConfig('component', 'navbar');
  const botConfig = useConfig('component', 'botDetails');
  const context = useContext(AppContext);
  const t = useLocalization();

  const { showHamburgerMenu, showCenterLogo, centerLogoSrc } = config;

  const [isSidebarOpen, setSidebarOpen] = useState(false);

  document.documentElement.style.setProperty(
    '--scrollbar-thumb-color',
    botConfig?.scrollbarColor || '#030311'
  );

  const toggleSidebar = () => {
    if (context?.isMsgReceiving) {
      toast.error(`${t('error.wait_new_chat')}`);
      return;
    }
    setSidebarOpen(!isSidebarOpen);
  };

  const newChatHandler = useCallback(() => {
    if (context?.isMsgReceiving) {
      toast.error(`${t('error.wait_new_chat')}`);
      return;
    }

    const newConversationId = uuidv4();
    sessionStorage.setItem('conversationId', newConversationId);
    sessionStorage.removeItem('tags');
    context?.setShowInputBox(true);
    context?.setConversationId(newConversationId);
    context?.setMessages([]);
    context?.setIsMsgReceiving(false);
    context?.setLoading(false);
    context?.setLanguagePopupFlag(true);
    router.push('/');
  }, [context, t, router]);

  console.log({ config, path: router.pathname });

  if (router.pathname === '/login' || router.pathname === '/otp') return null;

  return (
    <Nav
      onToggle={toggleSidebar}
      isOpen={isSidebarOpen}
      showHamburgerMenu={showHamburgerMenu}
      centerLogoIcons={
        showCenterLogo
          ? [
              {
                id: 'logo1',
                src: centerLogoSrc,
              },
            ]
          : []
      }
      style={{
        appBar: {
          background: 'var(--bg-color)',
          boxShadow: 'none',
          borderBottom: '1px solid lightgray',
          height: '80px',
          fontFamily: 'NotoSans-Regular',
        },
        toolbar: {
          height: '100%',
        },
        centerSection: {
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
        },
      }}
    >
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

      {/* TODO: need to add Back button to /faq , /feedback routes   
Navigation and switch statements to be given so that it can route 
 */}
    </Nav>
  );
};

export default Navbar;
