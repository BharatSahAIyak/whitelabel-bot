import React, { useContext, useMemo, useState } from 'react';
import Image from 'next/image';
import Loader from '../loader';
import Draggable from 'react-draggable';
import { useLocalization } from '../../hooks';
import ShareIcon from '../../assets/icons/share';
import DownloadIcon from '../../assets/icons/download';
import { toast } from 'react-hot-toast';
import { AppContext } from '../../context';
import axios from 'axios';
import { CircularProgress, Divider } from '@mui/material';
import { useColorPalates } from '../../providers/theme-provider/hooks';
import { useConfig } from '../../hooks/useConfig';
const ShareButtons = () => {
  const config = useConfig('component', 'chatUI');
  const theme = useColorPalates();
  const secondaryColor = useMemo(() => {
    return theme?.primary?.light;
  }, [theme?.primary?.light]);

  const t = useLocalization();
  const context = useContext(AppContext);
  const [shareLoader, setShareLoader] = useState(false);
  const [downloadLoader, setDownloadLoader] = useState(false);

  const downloadChat = async (type: string) => {
    const url = `${
      process.env.NEXT_PUBLIC_BFF_API_URL
    }/user/chathistory/generate-pdf/${sessionStorage.getItem(
      'conversationId'
    )}`;

    return axios.post(url, null, {
      headers: {
        authorization: `Bearer ${localStorage.getItem('auth')}`,
      },
    });
  };

  const downloadShareHandler = async (type: string) => {
    try {
      if (type === 'download') {
        setDownloadLoader(true);
      } else setShareLoader(true);

      const response = await downloadChat(type);
      const pdfUrl = response.data.pdfUrl;

      if (!pdfUrl) {
        toast.error(`${t('message.no_link')}`);
        return;
      }

      if (type === 'download') {
        setDownloadLoader(false);
        toast.success(`${t('message.downloading')}`);
        const link = document.createElement('a');

        link.href = pdfUrl;
        link.target = '_blank';
        // link.href = window.URL.createObjectURL(blob);

        link.download = 'Chat.pdf';
        link.click();
        setDownloadLoader(false);
        context?.downloadChat(pdfUrl);
      } else if (type === 'share') {
        setShareLoader(false);
        const response = await axios.get(pdfUrl, {
          responseType: 'arraybuffer',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const file = new File([blob], 'Chat.pdf', { type: blob.type });

        setShareLoader(false);

        if (!navigator.canShare) {
          //@ts-ignore
          if (window?.AndroidHandler?.shareUrl) {
            //@ts-ignore
            window.AndroidHandler.shareUrl(pdfUrl);
          } else {
            context?.shareChat(pdfUrl);
          }
        } else if (navigator.canShare({ files: [file] })) {
          toast.success(`${t('message.sharing')}`);
          console.log('hurray', file);
          await navigator
            .share({
              files: [file],
              title: 'Chat',
              text: 'Check out my chat with Bot!',
            })
            .catch((error) => {
              toast.error(error.message);
              console.error('Error sharing', error);
            });
        } else {
          toast.error(`${t('message.cannot_share')}`);
          console.error("Your system doesn't support sharing this file.");
        }
      } else {
        console.log(response.data);
        setDownloadLoader(false);
        setShareLoader(false);
      }
    } catch (error: any) {
      console.error(error);
      setDownloadLoader(false);
      setShareLoader(false);
      if (
        error.message ===
        "Cannot read properties of undefined (reading 'shareUrl')"
      ) {
        toast.success(`${t('message.shareUrl_android_error')}`);
      } else toast.error(error.message);

      console.error(error);
    }
  };
  return (
    // <Draggable axis="y">
    <>
      {(config?.allowDownloadChat || config?.allowShareChat) && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '40%',
            background: 'white',
            padding: '5px',
            borderRadius: '5px 0 0 5px',
            boxShadow:
              'rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px',
          }}>
          {config?.allowShareChat && (
            <div
              onClick={() => downloadShareHandler('share')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
              {/* Share */}
              {shareLoader ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '24px',
                    height: '24px',
                  }}>
                  <CircularProgress size="20px" />
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <ShareIcon color={secondaryColor} />
                </div>
              )}
              <p
                style={{
                  fontSize: '10px',
                  margin: 0,
                  // color: config?.theme.primaryColor.value,
                  fontFamily: 'Mulish-bold',
                }}>
                {config?.shareChatText}
              </p>
            </div>
          )}
          {/* Only render divider when both share and download allowed */}
          {config?.allowDownloadChat && config?.allowShareChat && <Divider />}
          {config?.allowDownloadChat && (
            <div
              onClick={() => downloadShareHandler('download')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
              {/* Download */}
              {downloadLoader ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '24px',
                    height: '24px',
                  }}>
                  <CircularProgress size="20px" />
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <DownloadIcon color={secondaryColor} />
                </div>
              )}
              <p
                style={{
                  fontSize: '10px',
                  margin: 0,
                  // color: config?.theme.primaryColor.value,
                  fontFamily: 'Mulish-bold',
                }}>
                {config?.downloadChatText}
              </p>
            </div>
          )}
        </div>
      )}
    </>
    // </Draggable>
  );
};

export default ShareButtons;
