import React, { useState, useContext, useEffect } from 'react';
import { Button } from '@mui/material';
import toast from 'react-hot-toast';
import { useLocalization } from '../../hooks';
import { useConfig } from '../../hooks/useConfig';
import { v4 as uuidv4 } from 'uuid';
import { AppContext } from '../../context';
import saveTelemetryEvent from '../../utils/telemetry';
import { LiveAudioVisualizer } from 'react-audio-visualize'; // Import the LiveAudioVisualizer component
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const RenderVoiceRecorder = ({ setInputMsg, tapToSpeak, onCloseModal }) => {
  // Added onCloseModal prop
  const t = useLocalization();
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recorderStatus, setRecorderStatus] = useState('idle');
  const [isErrorClicked, setIsErrorClicked] = useState(false);
  const config = useConfig('component', 'voiceRecorder');
  const context = useContext(AppContext);

  let VOICE_MIN_DECIBELS = -35;
  let DELAY_BETWEEN_DIALOGS = config?.delayBetweenDialogs || 2500;
  let DIALOG_MAX_LENGTH = 60 * 1000;
  let IS_RECORDING = false;

  useEffect(() => {
    startRecording();
    // Cleanup on component unmount
    return () => stopRecording();
  }, []);

  const startRecording = async () => {
    saveTelemetryEvent('0.1', 'E044', 'micAction', 'micTap', {
      botId: process.env.NEXT_PUBLIC_BOT_ID || '',
      orgId: process.env.NEXT_PUBLIC_ORG_ID || '',
      userId: localStorage.getItem('userID') || '',
      phoneNumber: localStorage.getItem('phoneNumber') || '',
      conversationId: sessionStorage.getItem('conversationId') || '',
    });
    IS_RECORDING = true;
    record();
  };

  const stopRecording = () => {
    IS_RECORDING = false;
    if (mediaRecorder !== null) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setMediaRecorder(null); // Set mediaRecorder state to null after stopping
    }
  };

  // Record function:
  function record() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      // Start recording:
      const recorder = new MediaRecorder(stream);
      recorder.start();
      setMediaRecorder(recorder);

      // Save audio chunks:
      const audioChunks = [];
      recorder.addEventListener('dataavailable', (event) => {
        audioChunks.push(event.data);
      });

      // Analysis:
      const audioContext = new AudioContext();
      const audioStreamSource = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.minDecibels = VOICE_MIN_DECIBELS;
      audioStreamSource.connect(analyser);
      const bufferLength = analyser.frequencyBinCount;
      const domainData = new Uint8Array(bufferLength);

      // Loop:
      let time = new Date();
      let startTime,
        lastDetectedTime = time.getTime();
      let anySoundDetected = false;
      const detectSound = () => {
        // Recording stopped by user:
        if (!IS_RECORDING) return;

        time = new Date();
        let currentTime = time.getTime();

        // Timeout:
        if (currentTime > startTime + DIALOG_MAX_LENGTH) {
          recorder.stop();
          return;
        }

        // A dialog detected:
        if (
          anySoundDetected === true &&
          currentTime > lastDetectedTime + DELAY_BETWEEN_DIALOGS
        ) {
          recorder.stop();
          return;
        }

        // Check for detection:
        analyser.getByteFrequencyData(domainData);
        for (let i = 0; i < bufferLength; i++)
          if (domainData[i] > 0) {
            anySoundDetected = true;
            time = new Date();
            lastDetectedTime = time.getTime();
          }

        // Continue the loop:
        window.requestAnimationFrame(detectSound);
      };
      window.requestAnimationFrame(detectSound);

      // Stop event:
      recorder.addEventListener('stop', () => {
        // Stop all the tracks:
        stream.getTracks().forEach((track) => track.stop());
        if (!anySoundDetected) return;

        // Send to server:
        const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
        makeComputeAPICall(audioBlob);
      });
    });
  }

  const makeComputeAPICall = async (blob) => {
    const startTime = Date.now();
    const s2tMsgId = uuidv4();
    console.log('s2tMsgId:', s2tMsgId);
    try {
      setRecorderStatus('processing');
      console.log('base', blob);
      toast.success(`${t('message.recorder_wait')}`);

      // Define the API endpoint
      const apiEndpoint =
        process.env.NEXT_PUBLIC_AI_TOOLS_API + '/speech-to-text';

      // Create a FormData object
      const formData = new FormData();

      // Append the WAV file to the FormData object
      formData.append('file', blob, 'audio.wav');
      formData.append('messageId', s2tMsgId);
      formData.append(
        'conversationId',
        sessionStorage.getItem('conversationId') || ''
      );
      formData.append('language', localStorage.getItem('locale') || 'en');

      // Send the WAV data to the API
      const resp = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          botId: process.env.NEXT_PUBLIC_BOT_ID || '',
          orgId: process.env.NEXT_PUBLIC_ORG_ID || '',
          userId: localStorage.getItem('userID') || '',
        },
        body: formData,
      });

      if (resp.ok) {
        const rsp_data = await resp.json();
        console.log('hi', rsp_data);
        if (rsp_data.text === '')
          throw new Error('Unexpected end of JSON input');
        setInputMsg(rsp_data.text);
        const endTime = Date.now();
        const latency = endTime - startTime;
        await saveTelemetryEvent(
          '0.1',
          'E046',
          'aiToolProxyToolLatency',
          's2tLatency',
          {
            botId: process.env.NEXT_PUBLIC_BOT_ID || '',
            orgId: process.env.NEXT_PUBLIC_ORG_ID || '',
            userId: localStorage.getItem('userID') || '',
            phoneNumber: localStorage.getItem('phoneNumber') || '',
            conversationId: sessionStorage.getItem('conversationId') || '',
            timeTaken: latency,
            messageId: s2tMsgId,
            createdAt: Math.floor(startTime / 1000),
          }
        );
      } else {
        toast.error(`${t('message.recorder_error')}`);
        console.log(resp);
        // Set isErrorClicked to true when an error occurs
        setIsErrorClicked(false);

        // Automatically change back to startIcon after 3 seconds
        setTimeout(() => {
          // Check if the user has not clicked the error icon again
          if (!isErrorClicked) {
            setRecorderStatus('idle');
          }
        }, 2500);
      }
      setRecorderStatus('idle');
    } catch (error) {
      console.error(error);
      setRecorderStatus('error');
      toast.error(`${t('message.recorder_error')}`);
      // Set isErrorClicked to true when an error occurs
      setIsErrorClicked(false);
      const endTime = Date.now();
      const latency = endTime - startTime;
      await saveTelemetryEvent(
        '0.1',
        'E046',
        'aiToolProxyToolLatency',
        's2tLatency',
        {
          botId: process.env.NEXT_PUBLIC_BOT_ID || '',
          orgId: process.env.NEXT_PUBLIC_ORG_ID || '',
          userId: localStorage.getItem('userID') || '',
          phoneNumber: localStorage.getItem('phoneNumber') || '',
          conversationId: sessionStorage.getItem('conversationId') || '',
          timeTaken: latency,
          messageId: s2tMsgId,
          createdAt: Math.floor(startTime / 1000),
          error: error?.message || t('message.recorder_error'),
        }
      );

      // Automatically change back to startIcon after 3 seconds
      setTimeout(() => {
        if (!isErrorClicked) {
          setRecorderStatus('idle');
        }
      }, 2500);
    }
    context?.sets2tMsgId((prev) => (prev = s2tMsgId));
  };

  if (config?.showVoiceRecorder === false) {
    return null;
  }

  return (
    <>
      {mediaRecorder && (
        <LiveAudioVisualizer
          mediaRecorder={mediaRecorder}
          width={250}
          height={75}
          gap={2}
          barColor="white"
        />
      )}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Button
          variant="contained"
          style={{ backgroundColor: 'white', color: 'green' }}
          onClick={() => {
            stopRecording();
          }}
          endIcon={<ArrowForwardIcon />}
        >
          {t('label.askMe')}
        </Button>
      </div>
    </>
  );
};

export default RenderVoiceRecorder;
