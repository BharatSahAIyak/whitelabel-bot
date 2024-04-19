import React, { useState, useContext, useEffect } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HelpIcon from '@mui/icons-material/QuestionMark';
import FeedbackIcon from '@mui/icons-material/ThumbUpOffAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useConfig } from '../../hooks/useConfig';
import { useColorPalates } from '../../providers/theme-provider/hooks';
import router from 'next/router';
import { useCookies } from 'react-cookie';
import { AppContext } from '../../context';
import { useLocalization } from '../../hooks';

export const Sidebar = ({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) => {
  //   const [config, setConfig] = useState<{
  //     showLangSwitcher: boolean;
  //     languages: { code: string; label: string; }[];
  //     showProfileIcon: boolean;
  //     profileText: string;
  //     links: { label: string; icon: string; route: string; }[];
  //     showLogoutButton: boolean;
  //     logoutButtonLabel: string;
  //   } | null>(null); 
  
  const [activeLanguage, setActiveLanguage] = useState<string>(() => {
    const storedLang = localStorage.getItem('locale');
    return storedLang || 'en';  
  });
 
  const [cookie, setCookie, removeCookie] = useCookies();
  const context = useContext(AppContext);
  const config = useConfig('component', 'sidebar');
  const theme = useColorPalates();
  const t = useLocalization();

  useEffect(() => {
    context?.setLocale(activeLanguage);  
  }, [activeLanguage, context]);

  const handleLanguageClick = (langCode: string) => {
    setActiveLanguage(langCode);
    localStorage.setItem('locale', langCode);  
    onToggle();
  };

  const handleItemClick = () => {
    onToggle();
  };

  function logout() {
    removeCookie('access_token', { path: '/' });
    localStorage.clear();
    sessionStorage.clear();
    context?.setMessages([]);
    router.push('/login');
    if (typeof window !== 'undefined') window.location.reload();
  }

  return (
    <div style={{ background: theme.primary.main }}>
      <Drawer
        open={isOpen}
        onClose={onToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: 300,
            height: '100vh',
            borderTopRightRadius: '15px',
            borderBottomRightRadius: '15px',
            backgroundColor: theme.primary.main,
          },
        }}
      >
        <Box style={{ background: theme.primary.main }} role="presentation">
          {config && (
            <List>
              {config.showLangSwitcher && (
                <ListItem disablePadding>
                  <ListItemButton onClick={handleItemClick}>
                    <ListItemIcon>
                      <ArrowBackIcon sx={{ color: theme.primary.contrastText, fontSize: '35px' }} />
                    </ListItemIcon>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                      {/* {config.languages.map((lang: any, index: number) => (
                        <button
                          key={index}
                          id={lang.code}
                          className={`Sidemenu_button ${lang.code === activeLanguage ? 'active' : ''}`}
                          style={{
                            borderTopLeftRadius: index === 0 ? '10px' : '0',
                            borderBottomLeftRadius: index === 0 ? '10px' : '0',
                            borderTopRightRadius: index === config.languages.length - 1 ? '10px' : '0',
                            borderBottomRightRadius: index === config.languages.length - 1 ? '10px' : '0',
                            backgroundColor: lang.code === activeLanguage ? theme.primary.light : '#FFFFFF',
                            border: 'none',
                            width: '60px',
                            height: '30px',
                            padding: '5px',
                          }}
                          onClick={() => handleLanguageClick(lang.code)}
                        >
                          {lang.label}
                        </button>
                      ))}  */}

<button
                        
                         
                          className={`Sidemenu_button ${ activeLanguage === config?.languageCode1 ? 'active' : ''
                            }`}
                          style={{
                            borderTopLeftRadius:  '10px',
                            borderBottomLeftRadius: '10px' ,
                            borderTopRightRadius:
                             
                               '0',
                            borderBottomRightRadius:
                               '0',
                            backgroundColor:
                               activeLanguage === config?.languageCode1
                                ? theme.primary.light
                                : '#FFFFFF',
                            border: 'none',
                            width: '60px',
                            height: '30px',
                            padding: '5px',
                          }}
                          onClick={() => handleLanguageClick(config?.languageCode1)}>
                         {config?.languageName1}
                        </button>

                        <button
                          
                          className={`Sidemenu_button ${activeLanguage === config?.
                            languageCode2 ?'active' : ''
                            }`} 
                          style={{
                            borderTopLeftRadius:  '0',
                            borderBottomLeftRadius: '0',
                            borderTopRightRadius: '10px',
                            borderBottomRightRadius: '10px',
                            backgroundColor:
                            config?.
                            languageCode2  === activeLanguage
                                ? theme.primary.light
                                : '#FFFFFF',
                            border: 'none',
                            width: '60px',
                            height: '30px',
                            padding: '5px',
                          }}
                          onClick={() => handleLanguageClick(config?.
                            languageCode2)}>
                          {config?.languageName2}
                        </button>
                    </div>
                  </ListItemButton>
                </ListItem>
              )}

              {config.showProfileIcon && (
                <div>
                  <ListItem disablePadding sx={{ marginBottom: '10px' }}>
                    <ListItemButton sx={{ color: theme.primary.contrastText }}>
                      <ListItemIcon>
                        <AccountCircleIcon sx={{ color: theme.primary.contrastText, fontSize: '50px' }} />
                      </ListItemIcon>
                      <ListItemText primary={t('label.welcome')} sx={{ color: theme.primary.contrastText }} />
                    </ListItemButton>
                  </ListItem>
                  <Divider sx={{ backgroundColor: '#999' }} />
                </div>
              )}

              {config.links.map((link: any, index: number) => (
                <div key={index}>
                  <ListItem
                    disablePadding
                    sx={{
                      paddingTop: '10px',
                      paddingBottom: '10px',
                      color: theme.primary.contrastText,
                      marginTop: '10px',
                      marginBottom: '10px',
                    }}
                    onClick={() => {
                      handleItemClick();
                      router.push(`/${link.route}`);
                    }}
                  >
                    <ListItemButton>
                      <ListItemIcon sx={{ color: theme.primary.contrastText }}>
                        {getIconComponent(link.icon)}
                      </ListItemIcon>
                      <ListItemText primary={t(`label.${link.label}`)} sx={{ color: theme.primary.contrastText }} />
                      <ChevronRightIcon sx={{ fontSize: '35px' }} />
                    </ListItemButton>
                  </ListItem>
                  <Divider sx={{ backgroundColor: '#999' }} />
                </div>
              ))}

              {config.showLogoutButton && (
                <ListItem disablePadding>
                  <ListItemButton sx={{ color: theme.primary.contrastText, marginTop: '10px' }} onClick={logout}>
                    <ListItemIcon>
                      <LogoutIcon sx={{ color: theme.primary.contrastText, fontSize: '35px' }} />
                    </ListItemIcon>
                    <ListItemText primary={t('label.logout')} />
                    <ChevronRightIcon sx={{ fontSize: '35px' }} />
                  </ListItemButton>
                </ListItem>
              )}
            </List>
          )}
        </Box>
      </Drawer>
    </div>
  );
};

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'HistoryIcon':
      return <ChatBubbleOutlineIcon sx={{ fontSize: '35px' }} />;
    case 'HelpIcon':
      return <HelpIcon sx={{ fontSize: '35px' }} />;
    case 'FeedbackIcon':
      return <FeedbackIcon sx={{ fontSize: '35px' }} />;
    default:
      return null;
 

  }
};

export default Sidebar;



// <button
                        
                         
//                         className={`Sidemenu_button ${ activeLanguage==='en' ? 'active' : ''
//                           }`}
//                         style={{
//                           borderTopLeftRadius:  '10px',
//                           borderBottomLeftRadius: '10px' ,
//                           borderTopRightRadius:
                           
//                              '0',
//                           borderBottomRightRadius:
//                              '0',
//                           backgroundColor:
//                              activeLanguage ==='en'
//                               ? theme.primary.light
//                               : '#FFFFFF',
//                           border: 'none',
//                           width: '60px',
//                           height: '30px',
//                           padding: '5px',
//                         }}
//                         onClick={() => handleLanguageClick('en')}>
//                        ENG
//                       </button>

//                       <button
                        
//                         className={`Sidemenu_button ${activeLanguage === config?.
//                           languageCode2 ?'active' : ''
//                           }`} 
//                         style={{
//                           borderTopLeftRadius:  '0',
//                           borderBottomLeftRadius: '0',
//                           borderTopRightRadius:
                        
//                                '0',
//                           borderBottomRightRadius: '0',
//                           backgroundColor:
//                           config?.
//                           languageCode2  === activeLanguage
//                               ? theme.primary.light
//                               : '#FFFFFF',
//                           border: 'none',
//                           width: '60px',
//                           height: '30px',
//                           padding: '5px',
//                         }}
//                         onClick={() => handleLanguageClick(config?.
//                           languageCode2)}>
//                         {config?.languageName2}
//                       </button>
//                   </div>
//                 </ListItemButton>
//               </ListItem>
//             )}
