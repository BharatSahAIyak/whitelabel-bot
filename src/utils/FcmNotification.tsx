import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { onMessageListener } from './firebase';

const FcmNotification = () => {
  const [notification, setNotification] = useState<any>({
    title: '',
    body: '',
    icon: '',
    featureDetails: null,
    clickActionUrl: '',
  });

  const notify = () =>
    toast(<ToastDisplay />, {
      style: {
        backgroundColor:  '#add8e6',
        color:  '#000000',
          borderRadius: 15,
        padding: '19px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      },
      duration: 8000,
      icon: notification.icon ? (
        <img src={notification.icon} alt="" width={70} height={70} />
      ) : null,
      position: 'top-right',
    });

  function ToastDisplay() {
    const handleLinkClick = () => {
      if (notification.clickActionUrl) {
        window.open(notification.clickActionUrl, '_blank');  
      }
    };

    const createMarkup = (body: string) => ({ __html: body });  

    return (
      <div style={{   alignItems: 'center', justifyContent: 'space-between' }}>
        <p>
          <b>{notification?.title}</b>
        </p>
       
        <p dangerouslySetInnerHTML={createMarkup(notification?.body)} onClick={handleLinkClick}></p>
        {notification?.featureDetails && (
          <div>
            <b>{notification.featureDetails.title}</b>
            <p>{notification.featureDetails.description}</p>
          </div>
        )}
      </div>
    );
  }

  useEffect(() => {
    if (notification.title) {
      notify();
    }
  }, [notification]);

  useEffect(() => {
    const handleMessage = async (payload: any) => {
      console.log('Notification payload:', payload);
      const featureDetailsData = payload.data?.['gcm.notification.featureDetails'];
      if (featureDetailsData) {
        try {
          const featureDetails = JSON.parse(featureDetailsData);
          if (featureDetails.description !== '' && featureDetails.title !== '') {
            setNotification({
              title: payload.notification?.title || '',
              body: payload.notification?.body || '',
              icon: payload.notification?.image || '',
              featureDetails,
              clickActionUrl: payload.data?.click_action_url || '', 
            });
          }
        } catch (error) {
          console.error('Error parsing featureDetails:', error);
        }
      } else {
        setNotification({
          title: payload.notification?.title || '',
          body: payload.notification?.body || '',
          icon: payload.notification?.image || '',
          featureDetails: null,
          clickActionUrl: payload.data?.click_action || '',  
        });
      }
    };

    const setupNotificationListener = async () => {
      try {
        const observable = await onMessageListener();
        if (observable && typeof observable.subscribe === 'function') {
          const subscription = observable.subscribe({
            next: handleMessage,
            error: (error: any) => {
              console.error('Error in notification listener:', error);
            },
          });
          return subscription;
        } else {
          console.error('Invalid observable:', observable);
        }
      } catch (error) {
        console.error('Error setting up notification listener:', error);
      }
    };

    const unsubscribe = setupNotificationListener();

    return () => {
      if (unsubscribe && typeof unsubscribe.then === 'function') {
        unsubscribe.then((subscription: any) => subscription.unsubscribe());
      }
    };
  }, []);

  return <Toaster />;
};

export default FcmNotification;