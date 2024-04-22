import React, { useCallback, useContext, useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import HomeIcon from '@mui/icons-material/Home'
import Typography from '@mui/material/Typography'
import AddCircle from '@mui/icons-material/AddCircle'
import { useRouter } from 'next/router'
import { useConfig } from '../../hooks/useConfig'
import Sidebar from '../../pageComponents/sidebar'
import { recordUserLocation } from '../../utils/location'
import { v4 as uuidv4 } from 'uuid'
import { AppContext } from '../../context'
import { useLocalization, useLogin } from '../../hooks'
import toast from 'react-hot-toast'
import { useColorPalates } from '../../providers/theme-provider/hooks'

const Navbar: React.FC = () => {
  const router = useRouter()
  const config = useConfig('component', 'navbar')
  const context = useContext(AppContext)
  const t = useLocalization()
  const theme = useColorPalates()
  const { isAuthenticated } = useLogin()
  const {
    showHamburgerMenu,
    logos: { showCenterLogos, centerLogoIcons, showRightLogos, rightLogoIcons },
  } = config

  const [isSidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    if (context?.isMsgReceiving) {
      toast.error(`${t('error.wait_new_chat')}`)
      return
    }
    setSidebarOpen(!isSidebarOpen)
  }

  const newChatHandler = useCallback(() => {
    if (context?.isMsgReceiving) {
      toast.error(`${t('error.wait_new_chat')}`)
      return
    }

    recordUserLocation()

    const newConversationId = uuidv4()
    sessionStorage.setItem('conversationId', newConversationId)
    if (context?.audioElement) context?.audioElement.pause()
    if (context?.setAudioPlaying) context?.setAudioPlaying(false)
    context?.setConversationId(newConversationId)
    context?.setMessages([])
    context?.setIsMsgReceiving(false)
    context?.setLoading(false)
    router.push('/')
  }, [context, t, router])

  return (
    <>
      <AppBar
        position="static"
        sx={{
          background: 'var(--bg-color)',
          boxShadow: 'none',
          borderBottom: '1px solid lightgray',
          height: router.pathname === '/login' ? '100px' : '70px',
        }}
      >
        <Toolbar
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            height: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {isAuthenticated && showHamburgerMenu && (
              <IconButton
                size="large"
                edge="start"
                color="primary"
                aria-label="open drawer"
                sx={{ mr: 2, width: '50px', height: '50px' }}
                onClick={toggleSidebar}
              >
                <MenuIcon sx={{ fontSize: '50px' }} />
              </IconButton>
            )}
            {router.pathname === '/chat' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <IconButton
                  color="primary"
                  size="large"
                  edge="start"
                  aria-label="home"
                  style={{
                    fontSize: '2rem',
                    width: '28px',
                    height: '28px',
                    margin: 0,
                  }} // Adjusted styling
                  onClick={newChatHandler}
                >
                  <AddCircle sx={{ fontSize: '30px' }} />
                </IconButton>
                <Typography
                  variant="body1"
                  color={config.textColor ? config.textColor : 'black'}
                  sx={{ fontSize: '15px' }}
                >
                  {t('label.new_chat')}
                </Typography>
              </div>
            )}

            {isAuthenticated &&
              router.pathname !== '/' &&
              router.pathname !== '/chat' && (
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

          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
            }}
          >
            {showCenterLogos &&
              centerLogoIcons.map((logo: any) => (
                <img
                  key={logo.id}
                  src={logo.src}
                  alt={`Logo ${logo.id}`}
                  style={{ maxHeight: config.logos.centerLogoSize }}
                />
              ))}

            {router.pathname === '/login' && (
              <div
                style={{
                  fontSize: '10px',
                  // color: theme?.primary?.dark || 'black',
                  color: config.logos.logoTitleColor
                    ? config.logos.logoTitleColor
                    : theme?.primary?.dark || 'black',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
                dangerouslySetInnerHTML={{ __html: t('label.title') }}
              />
            )}
          </div>

          {showRightLogos && (
            <div style={{ marginTop: '10px' }}>
              {rightLogoIcons.map((logo: any) => (
                <img
                  key={logo.id}
                  src={logo.src}
                  alt={`Right Logo ${logo.id}`}
                  style={{ maxHeight: '60px' }}
                />
              ))}
            </div>
          )}
        </Toolbar>
      </AppBar>

      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
    </>
  )
}

export default Navbar
