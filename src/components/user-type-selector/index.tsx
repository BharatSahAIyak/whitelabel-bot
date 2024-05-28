import { useColorPalates } from "../../providers/theme-provider/hooks";
import LanguagePicker from "../language-picker";
import { useConfig } from "../../hooks/useConfig";
import { useLocalization } from "../../hooks";

const UserTypeSelector = (props: any) => {
  const t = useLocalization();
  const theme = useColorPalates();
  const config = useConfig("component", "userTypeSelectorPage");

  return (
    <div
      style={{
        color: "#333",
        margin: "auto",
        backgroundColor: "#fff",
        height: "100dvh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "16px",
          left: "calc(100% - 117px)",
          zIndex: 10
        }}
      >
        <LanguagePicker />
      </div>
      <div
        style={{
          position: "absolute",
          top: "50%", // Adjust this value to move the container up or down
          width: "100%",
          bottom: "0",
          backgroundColor: "#fff",
          borderTopLeftRadius: "30% 5%", // Adjust the curvature
          borderTopRightRadius: "30% 5%",
          overflow: "hidden", // Ensures content aligns with the curved edges
        }}
      >
        <div className="p-4">
          <p
            style={{
              marginTop: "24px",
              fontSize: "24px",
              color: "#51586B",
            }}
          >
            {t('label.who_are_you')}
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: 'center',
              marginTop: "32px",
              // height: '180px'
            }}
          >
            {/* Two cards/buttons */}
            <div
              onClick={() => {
                props?.setOnboardingData((prev: any) => ({
                  ...prev,
                  userType: t('label.user1'),
                }))
                props?.handleNext();
              }}
              style={{
                backgroundColor: "#F4F4F4",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                borderRadius: "16px",
                padding: "16px",
                width: "40%",
                textAlign: "center",
              }}
            >
              <img
                src={config?.user1Image}
                alt="user1"
                style={{ maxWidth: "100%", height: "auto" }}
              />
              <p className="m-0 mt-2">{t('label.user1')}</p>
            </div>
            <p className="m-0">{t('label.or')}</p>
            <div
              onClick={() => {
                props?.setOnboardingData((prev: any) => ({
                  ...prev,
                  userType: t('label.user2'),
                }))
                props?.handleNext();
              }}
              style={{
                backgroundColor: "#F4F4F4",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                borderRadius: "16px",
                padding: "16px",
                width: "40%",
                textAlign: "center",
              }}
            >
              <img
                src={config?.user2Image}
                alt="user2"
                style={{ maxWidth: "100%", height: "auto" }}
              />
              <p className="m-0 mt-2">{t('label.user2')}</p>
            </div>
          </div>
        </div>
      </div>
        <div style={{height: '400px', overflow: 'hidden', objectFit: 'cover'}}>
          <img
            src={config?.backgroundImage}
            alt="bgImage"
            width={'100%'}
          />
        </div>
    </div>
  );
};

export default UserTypeSelector;