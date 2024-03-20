import { useState } from 'react'
import styles from './styles.module.css'
import toast from 'react-hot-toast'
import config from './config.json'
import Image from 'next/image'
import stop from '../../assets/icons/stop.gif';
import processing from '../../assets/icons/process.gif';
import error from '../../assets/icons/error.gif';
import start from '../../assets/icons/startIcon.png';

interface VoiceRecorder {
  setInputMsg: (msg: string) => void
  tapToSpeak: boolean
  includeDiv?: boolean
}

const VoiceRecorder: React.FC<VoiceRecorder> = ({
  setInputMsg,
  tapToSpeak,
  includeDiv = false,
}) => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [isErrorClicked, setIsErrorClicked] = useState(false)
  const [recorderStatus, setRecorderStatus] = useState('idle')

  const voiceMinDecibels: number = config.component.voiceMinDecibels
  const delayBetweenDialogs: number = config.component.delayBetweenDialogs
  const dialogMaxLength: number = config.component.dialogMaxLength
  const [isRecording,setIsRecording] = useState(config.component.isRecording)

const startRecording = () => {
  if (!isRecording) {
    setIsRecording(true);
    record();
  }
  }

  const stopRecording = () => {
    if (isRecording && mediaRecorder !== null) {
      setIsRecording(false);
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
  }
  
  function record() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      //start recording:
      const recorder = new MediaRecorder(stream)
      recorder.start()
      setMediaRecorder(recorder)

      //save audio chunks:
      const audioChunks: BlobPart[] = []
      recorder.addEventListener('dataavailable', (event) => {
        audioChunks.push(event.data)
      })

      //analysis:
      const audioContext = new AudioContext()
      const audioStreamSource = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.minDecibels = voiceMinDecibels
      audioStreamSource.connect(analyser)
      const bufferLength = analyser.frequencyBinCount
      const domainData = new Uint8Array(bufferLength)

      //loop:
      let time: Date = new Date()
      let startTime: number
      let lastDetectedTime: number = time.getTime()
      let anySoundDetected: boolean = false
      const detectSound = () => {
        //recording stopped by user:
        if (!isRecording) return

        time = new Date()
        const currentTime = time.getTime()

        //time out:
        if (currentTime > startTime + dialogMaxLength) {
          recorder.stop()
          return
        }

        //a dialog detected:
        if (
          anySoundDetected === true &&
          currentTime > lastDetectedTime + delayBetweenDialogs
        ) {
          recorder.stop()
          return
        }

        //check for detection:
        analyser.getByteFrequencyData(domainData)
        for (let i = 0; i < bufferLength; i++)
          if (domainData[i] > 0) {
            anySoundDetected = true
            time = new Date()
            lastDetectedTime = time.getTime()
          }

        //continue the loop:
        window?.requestAnimationFrame(detectSound)
      }
      window?.requestAnimationFrame(detectSound)

      //stop event:
      recorder.addEventListener('stop', () => {
        stream.getTracks().forEach((track) => track.stop());
        if (audioChunks.length > 0) {
          const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
           //send to server:
          makeComputeAPICall(audioBlob);
        }
      });
    })
  }
  

  const makeComputeAPICall = async (blob: Blob) => {
    try {
      setRecorderStatus('processing');
      console.log('base', blob);
      toast.success(`${config.component.waitMessage}`)

      // Define the API endpoint
      const apiEndpoint = process.env.NEXT_PUBLIC_BFF_API_URL;

      const phoneNumber = localStorage.getItem('phoneNumber');
      //check if phone number exists
      if (phoneNumber !== null) {
      // Create a FormData object
      const formData = new FormData();

      // Append the WAV file to the FormData object
      formData.append('file', blob, 'audio.wav');
      formData.append('phoneNumber', localStorage.getItem('phoneNumber'));

      // Send the WAV data to the API
      const resp = await fetch(apiEndpoint + '/aitools/asr', {
        method: 'POST',
        body: formData,
      });

      if (resp.ok) {
        const rsp_data = await resp.json();
        if (rsp_data.text === '')
          throw new Error('Unexpected end of JSON input');
        setInputMsg(rsp_data.text);
        sessionStorage.setItem('asrId', rsp_data.id);
      } else {
        toast.error(`${config.component.recorderErrorMessage}`)
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
    } else {
      // Handle the case where phone number is null
      console.error('Phone number is null.');
    }
    } catch (error) {
      console.error(error);
      setRecorderStatus('error');
      toast.error(`${config.component.recorderErrorMessage}`)
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
  };

  return (
    <div>
      <div>
        {mediaRecorder && mediaRecorder.state === 'recording' ? (
          <div className={styles.center}>
            <Image
              priority
              src={stop}
              alt="stopIcon"
              onClick={() => {
                stopRecording();
              }}
              style={{ cursor: 'pointer' }}
              layout="responsive"
            />
          </div>
        ) : (
          <div className={styles.center}>
            {recorderStatus === 'processing' ? (
              <Image
                priority
                src={processing}
                alt="processingIcon"
                style={{ cursor: 'pointer' }}
                layout="responsive"
              />
            ) : recorderStatus === 'error' ? (
              <Image
                priority
                src={error}
                alt="errorIcon"
                onClick={() => {
                  setIsErrorClicked(true);
                  startRecording();
                }}
                style={{ cursor: 'pointer' }}
                layout="responsive"
              />
            ) : (
              <>
                <Image
                  priority
                  src={start}
                  alt="startIcon"
                  onClick={() => {
                    setIsErrorClicked(true);
                    startRecording();
                  }}
                  style={{ cursor: 'pointer' }}
                  layout="responsive"
                />
                {tapToSpeak ? (
                  <p style={{ color: 'black', fontSize: '14px', marginTop: '4px' }}>
                    {config.component.recorderLabel}
                  </p>
                ) : (
                  <></>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VoiceRecorder
