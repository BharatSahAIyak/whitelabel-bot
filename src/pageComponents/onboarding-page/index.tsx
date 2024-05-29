import { useEffect, useState } from 'react';
import OnBoarding from '../../components/onboarding';
import UserTypeSelector from '../../components/user-type-selector';
import WelcomePage from '../welcome-page';
import OptionSelector from '../../components/option-selector';
import LocationInput from '../../components/location-input';
import axios from 'axios';
import Head from 'next/head';
import { useLocalization } from '../../hooks';
import { useConfig } from '../../hooks/useConfig';
const OnBoardingPage = (props: any) => {
  const t = useLocalization();
  const config = useConfig("component", "botDetails");
  const [activeStep, setActiveStep] = useState(-1);
  const [steps] = useState(3);
  const [onboardingData, setOnboardingData] = useState<any>({});
  const [cropList, setCropList] = useState<any>(null);
  const [animalList, setAnimalList] = useState<any>([]);
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const fetchList = async (type: string) => {
    try {
      const res = await axios.post(
        process.env.NEXT_PUBLIC_DATASET_URL +
          '/dataset/execute/a656e812-224c-4e5b-b903-3113b3a25927',
        {
         sqlQuery: `SELECT * from "commodity" where "type"='${type}'`, 
        },
        {
          headers: {
            botId: process.env.NEXT_PUBLIC_BOT_ID || '',
            orgId: process.env.NEXT_PUBLIC_ORG_ID || '',
          },
        }
      );
      console.log({ res });
      if(type === 'crop'){
        setCropList(res?.data?.data);
      }else if(type === 'animal'){
        setAnimalList(res?.data?.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchList('crop');
    // fetchList('animal');
  }, []);

  useEffect(() => {
    console.log(activeStep);
    if (activeStep === steps) {
      props?.setUser((prevUser: any) => ({
        ...prevUser,
        data: {
          ...prevUser.data,
          profile: { ...onboardingData },
        },
      }));
    }
  }, [activeStep]);

  useEffect(() => {
    console.log(onboardingData);
  }, [onboardingData]);

  return (
    <div>
      <Head>
        <title>{t("label.tab_title")}</title>
        <link rel="icon" href={config?.favicon} />
      </Head>
      {activeStep === -1 ? (
        <WelcomePage handleNext={handleNext} />
      ) : (
        <OnBoarding
          containerStyle={{ width: '100%' }}
          variant="dots"
          activeStep={activeStep}
          steps={steps}>
          {activeStep === 0 && (
            <UserTypeSelector
              handleNext={handleNext}
              setOnboardingData={setOnboardingData}
            />
          )}
          {activeStep === 1 && (
            <LocationInput
              handleNext={handleNext}
              handleBack={handleBack}
              setOnboardingData={setOnboardingData}
            />
          )}
          {activeStep === 2 && (
            <OptionSelector
              handleNext={handleNext}
              handleBack={handleBack}
              setOnboardingData={setOnboardingData}
              commodityType="crop"
              entityList={cropList}
            />
          )}
          {/* {activeStep === 3 && (
            <OptionSelector
              handleNext={handleNext}
              handleBack={handleBack}
              setOnboardingData={setOnboardingData}
              commodityType="animal"
              entityList={animalList}
            />
          )} */}
        </OnBoarding>
      )}
    </div>
  );
};

export default OnBoardingPage;
