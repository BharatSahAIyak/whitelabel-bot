import { useEffect, useState } from "react";
import OnBoarding from "../../components/onboarding";
import UserTypeSelector from "../../components/user-type-selector";
import WelcomePage from "../welcome-page";
import OptionSelector from "../../components/option-selector";
import LocationInput from "../../components/location-input";
const OnBoardingPage = (props: any) => {
  const [activeStep, setActiveStep] = useState(-1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [steps] = useState(3);
  const [onboardingData, setOnboardingData] = useState<any>({});
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  useEffect(() => {
    console.log(activeStep)
    if(activeStep === steps){
      props?.setUser((prevUser: any) => ({
        ...prevUser,
        data: {
          ...prevUser.data,
          profile: {...onboardingData}
        }
      }));
    }
  }, [activeStep])

  useEffect(() => {
    console.log(onboardingData)
  }, [onboardingData])
  

  return (
    <div>
    
      {activeStep === -1 ? (
        <WelcomePage handleNext={handleNext}/>
      ) : (
        <OnBoarding
          containerStyle={{ width: "100%" }}
          variant="dots"
          activeStep={activeStep}
          steps={steps}
        >
          
          {activeStep === 0 && <UserTypeSelector handleNext={handleNext} setOnboardingData={setOnboardingData} />}
          {activeStep === 1 && <LocationInput handleNext={handleNext} handleBack={handleBack} setOnboardingData={setOnboardingData} />}
          {activeStep === 2 && <OptionSelector handleNext={handleNext} handleBack={handleBack} setOnboardingData={setOnboardingData} />}
        </OnBoarding>
      )}
    </div>
  );
};

export default OnBoardingPage;