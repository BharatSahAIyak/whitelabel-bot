import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './index.module.css';
import CallIcon from '../../../assets/icons/call-icon';
import Image from 'next/image';
import { useFlags } from 'flagsmith/react';
import axios from 'axios';
import { useLocalization } from '../../../hooks';
import { useConfig } from '../../../hooks/useConfig';
import ComingSoonPage from '../../../pageComponents/coming-soon-page';

const FAQPage: React.FC = () => {
  const t = useLocalization();
  const flags = useFlags([
    'show_faq_page',
    'show_dialer',
    'dialer_number',
    'show_pdf_buttons',
    'manual_pdf_link',
  ]);
  // const [faqData, setFaqData] = useState<any[]>([]);
  console.log(flags);

  // useEffect(() => {

  //   const fetchData = async () => {
  //     let page = 1;
  //     let allData: any[] = [];

  //     while (true) {
  //       try {
  //         const response = await axios.get(
  //           `${process.env.NEXT_PUBLIC_BFF_API_URL}/faq?page=${page}`,
  //           {
  //             headers: {
  //               authorization: `Bearer ${localStorage.getItem('auth')}`,
  //             },
  //           }
  //         );
  //         const newData = response.data.faqs;

  //         if (!newData.length) {
  //           break; // no more data, exit loop
  //         }

  //         allData = [...allData, ...newData];
  //         page++;
  //       } catch (error) {
  //         console.log(error);
  //         break;
  //       }
  //     }
  //     setFaqData(allData);
  //   };

  //   fetchData();
  // }, []);

  const downloadPDFHandler = useCallback(
    () => {
      const link: any = flags?.[`manual_pdf_link`]?.value;
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

      window.open(link);

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
    },
    [flags]
  );

  const secondaryColorConfig = useConfig('theme','secondaryColor');
  const secondaryColor = useMemo(() => {
    return secondaryColorConfig?.value;
  }, [secondaryColorConfig]);

  if (!flags?.show_faq_page?.enabled) {
    return <ComingSoonPage />;
  } else
    return (
      <>
        <div className={styles.main}>
          <div className={styles.title} style={{color: secondaryColor}}>{t('label.faqs')}</div>
          {/* @ts-ignore */}
          {/* <Accordion allowMultiple>
            {faqData.map((faq, idx) => (
              <AccordionItem key={idx}>
                <h2>
                  <AccordionButton fontSize={'1.89vh'}>
                    <Box as="span" flex="1" textAlign="left">
                      {localStorage.getItem('locale') === 'or'
                        ? faq.question
                        : faq.questionInEnglish}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} fontSize={'1.89vh'}>
                  {localStorage.getItem('locale') === 'or'
                    ? faq.answer
                    : faq.answerInEnglish}
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion> */}
          <section className={styles.bottomSection}>
            {flags?.show_pdf_buttons?.enabled && (
              <div className={styles.manualButtons}>
                <button
                  onClick={downloadPDFHandler}
                  className={styles.submitButton} style={{background: secondaryColor}}>
                  {t('label.manual')}
                </button>
              </div>
            )}
            {flags?.show_dialer?.enabled && (
              <div className={styles.dialerBox}>
                <div className={styles.footer}>
                  {t('message.dial_description')}
                </div>
                <a
                  href={`tel:${flags.dialer_number.value}`}
                  className={styles.footerTitle} style={{color: secondaryColor}}>
                  <div className={styles.callIconBox}>
                    <CallIcon color={secondaryColor} />
                  </div>
                  {t('label.dial')} {flags.dialer_number.value}
                </a>
              </div>
            )}
          </section>
        </div>
      </>
    );
};

export default FAQPage;
