import { FC, useCallback, useEffect, useState } from 'react';
import styles from './index.module.css';
import { List } from '../../components/list';
import ForumIcon from '@mui/icons-material/Forum';
import InfoIcon from '@mui/icons-material/Info';
import CallIcon from '@mui/icons-material/Call';
import _ from 'underscore';
import { map } from 'lodash';
import { useColorPalates } from '../../providers/theme-provider/hooks';
import { FullPageLoader } from '../../components/fullpage-loader';
import { useLocalization } from '../../hooks';
import ComingSoonPage from '../coming-soon-page';
import { useConfig } from '../../hooks/useConfig';
import Menu from '../../components/menu';

const NotificationsPage: FC = () => {
  const [isFetching, setIsFetching] = useState(true);
  const theme = useColorPalates();
  const [notifications, setNotifications] = useState<any>([]);
  const t = useLocalization();

  const config = useConfig('component', 'notificationsPage');

  const faqConfig = useConfig('component', 'faqPage');

  const downloadPDFHandler = useCallback(() => {
    const link: any = faqConfig?.faqManualPdfLink;
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

    // window.open(link);

    fetch(proxyUrl + link, {
      method: 'GET',
      headers: {},
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = link;
        a.download = `User_Manual_For_VAWs.pdf`;

        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [faqConfig?.faqManualPdfLink]);

  const handleContactClick = useCallback(() => {
    const phoneNumber = `tel:${faqConfig?.faqPhoneNumber}`;
    window.location.href = phoneNumber;
  }, [faqConfig?.faqPhoneNumber]);

  const handleClick = useCallback((activeItem: any) => {
    console.log(activeItem);
    switch (activeItem?.action) {
      case 'downloadManual':
        downloadPDFHandler();
        break;
      case 'callCenter':
        handleContactClick();
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = () => {
    setIsFetching(true);

    const notificationList = map(
      [
        {
          label: t('label.notification1_label'),
          secondaryLabel: t('label.notification1_description'),
          icon: <InfoIcon style={{ color: theme?.primary?.main }} />,
          action: 'downloadManual',
        },
        {
          label: t('label.notification2_label'),
          secondaryLabel: t('label.notification2_description'),
          icon: <CallIcon style={{ color: theme?.primary?.main }} />,
          action: 'callCenter',
        },
      ],
      (item: any) => {
        return {
          label: item?.label,
          secondaryLabel: item?.secondaryLabel,
          icon: item?.icon,
          action: item?.action,
          onClick: handleClick,
          isDivider: true,
        };
      }
    );
    setNotifications(notificationList);
    setIsFetching(false);
  };

  if (!config?.showNotificationsPage) {
    return <ComingSoonPage />;
  }
  return (
    <>
      <div className={styles.main}>
        <FullPageLoader
          loading={isFetching}
          color={theme?.primary?.main}
          label="Fetching Notifications"
        />
        <div
          className={styles.title}
          style={{ color: theme?.primary?.main }}
          data-testid="notifications-title"
        >
          {t('label.notifications')}
        </div>
        <div className={styles.list} data-testid="notifications-list">
          <List
            items={notifications}
            noItem={{
              label: t('label.no_notifications'),
              icon: <ForumIcon style={{ color: theme?.primary?.light }} />,
            }}
          />
        </div>
        <Menu />
      </div>
    </>
  );
};

export default NotificationsPage;
