import {
  Bubble,
  Image as Img,
  ScrollView,
  List,
  ListItem,
  FileCard,
  Typing,
} from '@samagra-x/chatui';
import {
  FC,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import styles from './index.module.css';
import RightIcon from './assets/right';
import SpeakerIcon from './assets/speaker.svg';
import MsgThumbsUp from './assets/msg-thumbs-up';
import MsgThumbsDown from './assets/msg-thumbs-down';
import { MessageItemPropType } from './index.d';
const jsonToTable = require('json-to-table');
import moment from 'moment';
import { useColorPalates } from '../../providers/theme-provider/hooks';
import { useConfig } from '../../hooks/useConfig';
import { useLocalization } from '../../hooks';
import { AppContext } from '../../context';
// import BlinkingSpinner from '../blinking-spinner/index';

const MessageItem: FC<MessageItemPropType> = ({ message }) => {
  const config = useConfig('component', 'chatUI');
  const context = useContext(AppContext);
  const t = useLocalization();
  const theme = useColorPalates();
  const secondaryColor = useMemo(() => {
    return theme?.primary?.light;
  }, [theme?.primary?.light]);

  const contrastText = useMemo(() => {
    return theme?.primary?.contrastText;
  }, [theme?.primary?.contrastText]);

  const [reaction, setReaction] = useState(message?.content?.data?.reaction);
  // @ts-ignore
  const [optionDisabled, setOptionDisabled] = useState(
    message?.content?.data?.optionClicked || false
  );

  useEffect(() => {
    setReaction(message?.content?.data?.reaction);
  }, [message?.content?.data?.reaction]);

  const feedbackHandler = useCallback(
    ({ like }: { like: 0 | 1 | -1; msgId: string }) => {
      if (reaction === 0) {
        return setReaction(like);
      }
      if (reaction === 1 && like === -1) {
        return setReaction(-1);
      }
      if (reaction === -1 && like === 1) {
        return setReaction(1);
      }
      setReaction(0);
    },
    [reaction]
  );

  const getLists = useCallback(
    ({ choices }: { choices: any }) => {
      console.log('qwer12:', { choices, optionDisabled });
      return (
        <List className={`${styles.list}`}>
          {choices?.map((choice: any, index: string) => (
            // {_.map(choices ?? [], (choice, index) => (
            <ListItem
              key={`${index}_${choice?.key}`}
              className={`${styles.onHover} ${styles.listItem}`}
              //@ts-ignore
              style={
                optionDisabled
                  ? {
                      background: 'var(--lightgrey)',
                      color: 'var(--font)',
                      boxShadow: 'none',
                    }
                  : {cursor: 'pointer'}
              }
              onClick={(e: any): void => {
                e.preventDefault();
                if (optionDisabled) {
                  toast.error(`${t('message.cannot_answer_again')}`);
                } else {
                  context?.sendMessage(choice?.text);
                  setOptionDisabled(true);
                }
              }}>
              <div
                className="onHover"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color:
                    content?.data?.position === 'right'
                      ? 'white'
                      : optionDisabled
                      ? 'var(--font)'
                      : secondaryColor,
                }}>
                <div>{choice?.text}</div>
                <div style={{ marginLeft: 'auto' }}>
                  <RightIcon
                    width="30px"
                    color={
                      optionDisabled ? 'var(--font)' : secondaryColor
                    }
                  />
                </div>
              </div>
            </ListItem>
          ))}
        </List>
      );
    },
    [context, t]
  );

  const { content, type } = message;

  console.log('here', content);

  const handleAudio = useCallback((url: any) => {
    // console.log(url)
    if (!url) {
      toast.error('No audio');
      return;
    }
    // Write logic for handling audio here
  }, []);

  switch (type) {
    case 'loader':
      return <Typing />;
    case 'text':
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            maxWidth: '90vw',
          }}>
          <div
            className={
              content?.data?.position === 'right'
                ? styles.messageTriangleRight
                : styles.messageTriangleLeft
            }
            style={
              content?.data?.position === 'right'
                ? {
                    borderColor: `${secondaryColor} transparent transparent transparent`,
                  }
                : {
                    borderColor: `${contrastText} transparent transparent transparent`,
                  }
            }></div>
          <Bubble
            type="text"
            style={
              content?.data?.position === 'right'
                ? {
                    background: secondaryColor,
                    boxShadow: '0 3px 8px rgba(0,0,0,.24)',
                  }
                : {
                    background: contrastText,
                    boxShadow: '0 3px 8px rgba(0,0,0,.24)',
                  }
            }>
            <span
              style={{
                fontWeight: 600,
                fontSize: '1rem',
                color:
                  content?.data?.position === 'right'
                    ? contrastText
                    : secondaryColor,
              }}>
              {content?.text}{' '}
              {/* {
                content?.data?.position === 'right'
                  ? null
                  : !content?.data?.isEnd
                && <BlinkingSpinner />
              } */}
            </span>
            {getLists({
              choices:
                content?.data?.payload?.buttonChoices ?? content?.data?.choices,
            })}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
              }}>
              <span
                style={{
                  color:
                    content?.data?.position === 'right'
                      ? contrastText
                      : secondaryColor,
                  fontSize: '10px',
                }}>
                {moment(
                  content?.data?.sentTimestamp ||
                    content?.data?.repliedTimestamp
                ).format('hh:mm A DD/MM/YYYY')}
              </span>
            </div>
          </Bubble>
          {content?.data?.btns ? (
            <div className={styles.offlineBtns}>
              <button
                onClick={() => window?.location?.reload()}
                style={{
                  border: `2px solid ${secondaryColor}`,
                }}>
                Refresh
              </button>
            </div>
          ) : (
            content?.data?.position === 'left' && (
              <div
                style={{
                  display: 'flex',
                  position: 'relative',
                  top: '-10px',
                  justifyContent: 'space-between',
                }}>
                {config?.allowTextToSpeech && (
                  <div style={{ display: 'flex' }}>
                    <div
                      className={styles.msgSpeaker}
                      onClick={handleAudio}
                      style={
                        // !content?.data?.isEnd
                        //   ? {
                        //       pointerEvents: 'none',
                        //       filter: 'grayscale(100%)',
                        //       opacity: '0.5',
                        //       border: `1px solid ${secondaryColor}`,
                        //     }
                        //   :
                        {
                          pointerEvents: 'auto',
                          opacity: '1',
                          filter: 'grayscale(0%)',
                          border: `1px solid ${secondaryColor}`,
                        }
                      }>
                      <Image src={SpeakerIcon} width={15} height={15} alt="" />

                      <p
                        style={{
                          fontSize: '11px',
                          // color: contrastText,
                          fontFamily: 'Mulish-bold',
                          display: 'flex',
                          alignItems: 'flex-end',
                          marginRight: '1px',
                          padding: '0 5px',
                        }}>
                        {config?.textToSpeechLabel}
                      </p>
                    </div>
                  </div>
                )}
                {config?.allowFeedback && (
                  <div className={styles.msgFeedback}>
                    <div
                      className={styles.msgFeedbackIcons}
                      style={{
                        border: `1px solid ${secondaryColor}`,
                      }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          flexDirection: 'column',
                          paddingRight: '6px',
                        }}
                        onClick={() =>
                          feedbackHandler({
                            like: 1,
                            msgId: content?.data?.messageId,
                          })
                        }>
                        <MsgThumbsUp fill={reaction === 1} width="20px" />
                        <p
                          style={{
                            fontSize: '11px',
                            fontFamily: 'Mulish-bold',
                          }}>
                          {config?.positiveFeedbackText}
                        </p>
                      </div>
                      <div
                        style={{
                          height: '32px',
                          width: '1px',
                          backgroundColor: secondaryColor,
                          margin: '6px 0',
                        }}></div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          flexDirection: 'column',
                        }}
                        onClick={() =>
                          feedbackHandler({
                            like: -1,
                            msgId: content?.data?.messageId,
                          })
                        }>
                        <MsgThumbsDown fill={reaction === -1} width="20px" />
                        <p
                          style={{
                            fontSize: '11px',
                            fontFamily: 'Mulish-bold',
                          }}>
                          {config?.negativeFeedbackText}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      );

    case 'image': {
      const url = content?.data?.payload?.media?.url || content?.data?.imageUrl;
      return (
        <>
          {content?.data?.position === 'left' && (
            <div
              style={{
                width: '40px',
                marginRight: '4px',
                textAlign: 'center',
              }}></div>
          )}
          <Bubble type="image">
            <div style={{ padding: '7px' }}>
              <Img src={url} width="299" height="200" alt="image" lazy fluid />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'self-end',
                }}>
                <span
                  style={{
                    color: contrastText,
                    fontSize: '10px',
                  }}>
                  {moment(
                    content?.data?.sentTimestamp ||
                      content?.data?.repliedTimestamp
                  ).format('hh:mm A DD/MM/YYYY')}
                </span>
              </div>
            </div>
          </Bubble>
        </>
      );
    }

    case 'file': {
      const url = content?.data?.payload?.media?.url || content?.data?.fileUrl;
      return (
        <>
          {content?.data?.position === 'left' && (
            <div
              style={{
                width: '40px',
                marginRight: '4px',
                textAlign: 'center',
              }}></div>
          )}
          <Bubble type="image">
            <div style={{ padding: '7px' }}>
              <FileCard file={url} extension="pdf" />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'self-end',
                }}>
                <span
                  style={{
                    color: contrastText,
                    fontSize: '10px',
                  }}>
                  {moment(
                    content?.data?.sentTimestamp ||
                      content?.data?.repliedTimestamp
                  ).format('hh:mm A DD/MM/YYYY')}
                </span>
              </div>
            </div>
          </Bubble>
        </>
      );
    }

    case 'video': {
      const url = content?.data?.payload?.media?.url || content?.data?.videoUrl;
      const videoId = url.split('=')[1];
      return (
        <>
          <Bubble type="image">
            <div style={{ padding: '7px' }}>
              <iframe
                width="100%"
                height="fit-content"
                src={`https://www.youtube.com/embed/` + videoId}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen></iframe>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'self-end',
                }}>
                <span
                  style={{
                    color: contrastText,
                    fontSize: '10px',
                  }}>
                  {moment(
                    content?.data?.sentTimestamp ||
                      content?.data?.repliedTimestamp
                  ).format('hh:mm A DD/MM/YYYY')}
                </span>
              </div>
            </div>
          </Bubble>
        </>
      );
    }
    case 'options': {
      return (
        <>
          <Bubble type="text" className={styles.textBubble}>
            <div style={{ display: 'flex' }}>
              <span className={styles.optionsText}>
                {content?.data?.payload?.text}
              </span>
            </div>
            {getLists({
              choices:
                content?.data?.payload?.buttonChoices ?? content?.data?.choices,
            })}
          </Bubble>
        </>
      );
    }

    case 'table': {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            maxWidth: '90vw',
          }}>
          <div
            className={
              content?.data?.position === 'right'
                ? styles.messageTriangleRight
                : styles.messageTriangleLeft
            }></div>
          <Bubble type="text">
            <div className={styles.tableContainer}>
              {jsonToTable(JSON.parse(content?.text)?.table)}
            </div>
            <span
              style={{
                fontWeight: 600,
                fontSize: '1rem',
                color:
                  content?.data?.position === 'right'
                    ? secondaryColor
                    : contrastText,
              }}>
              {`\n` +
                JSON.parse(content?.text)?.generalAdvice +
                `\n\n` +
                JSON.parse(content?.text)?.buttonDescription}
              {getLists({
                choices: JSON.parse(content?.text)?.buttons,
              })}
            </span>
          </Bubble>
        </div>
      );
    }
    default:
      return (
        <ScrollView
          data={[]}
          // @ts-ignore
          renderItem={(item): ReactElement => <Button label={item.text} />}
        />
      );
  }
};

export default MessageItem;
