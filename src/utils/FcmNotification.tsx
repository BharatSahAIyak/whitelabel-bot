import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { onMessageListener } from './firebase';

interface Notification {
  title: string;
  body: string;
  icon: string;
  featureDetails: any | null;
  clickActionUrl: string;
}

const FcmNotification: React.FC = () => {
  const [storedNotifications, setStoredNotifications] = useState<Notification[]>([]);

  const notify = (notificationData: Notification) => {
    toast(<ToastDisplay notification={notificationData} />, {
      style: {
        backgroundColor: '#add8e6',
        color: '#000000',
        borderRadius: 16,
        padding: '19px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      },
      duration: 8000,
      icon: notificationData.icon ? (
        <img src={notificationData.icon} alt="" width={70} height={70} />
      ) : null,
      position: 'top-right',
    });
  };

  const ToastDisplay: React.FC<{ notification: Notification }> = ({ notification }) => {
    const handleLinkClick = () => {
      if (notification.clickActionUrl) {
        window.open(notification.clickActionUrl, '_blank');
      }
    };

    const createMarkup = (body: string) => ({ __html: body });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start', justifyContent: 'space-between' }}>
        <p><b>{notification.title}</b></p>
        <p dangerouslySetInnerHTML={createMarkup(notification.body)} onClick={handleLinkClick}></p>
        {notification.featureDetails && (
          <div>
            <b>{notification.featureDetails.title}</b>
            <p>{notification.featureDetails.description}</p>
          </div>
        )}
      </div>
    );
  }

  // Notifications fetched from IndexedDB
  const loadNotificationsFromDB = async (): Promise<void> => {
    try {
      const db: IDBDatabase = await new Promise((resolve, reject) => {
        const request: IDBOpenDBRequest = indexedDB.open('notificationDataDB', 1);

        request.onsuccess = (event: Event) => {
          resolve((event.target as IDBOpenDBRequest).result as IDBDatabase);
        };

        request.onerror = (event: Event) => {
          reject((event.target as IDBOpenDBRequest).error);
        };
      });

      const transaction: IDBTransaction = db.transaction(['notificationDataStore'], 'readonly');
      const objectStore: IDBObjectStore = transaction.objectStore('notificationDataStore');

      const notifications: Notification[] = [];
      const cursorRequest: IDBRequest<IDBCursorWithValue | null> = objectStore.openCursor();

      cursorRequest.onsuccess = (cursorEvent: Event) => {
        const cursor: IDBCursorWithValue | null = (cursorEvent.target as IDBRequest<IDBCursorWithValue | null>).result;
        if (cursor) {
          notifications.push(cursor.value);
          cursor.continue();
        } else {
          setStoredNotifications(notifications);
        }
      };

      cursorRequest.onerror = (errorEvent: Event) => {
        console.error('Cursor request error:', (errorEvent.target as IDBRequest<IDBCursorWithValue | null>).error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    } catch (error) {
      console.error('Failed to load notifications from IndexedDB:', error);
    }
  }

  useEffect(() => {
    loadNotificationsFromDB();
  }, []);

  useEffect(() => {
    storedNotifications.forEach(notify);
  }, [storedNotifications]);

  useEffect(() => {
    const unsubscribe = onMessageListener().subscribe({
      next: (payload: any) => {
        const newNotification: Notification = {
          title: payload.notification?.title || '',
          body: payload.notification?.body || '',
          icon: payload.notification?.image || '',
          featureDetails: payload.data?.featureDetails || null,
          clickActionUrl: payload.data?.click_action_url || '',
        };
        notify(newNotification);
      },
      error: (error) => console.error('Error in notification listener:', error),
    });

    return () => {
      unsubscribe.unsubscribe();
    };
  }, []);

  return <Toaster />;
};

export default FcmNotification;
