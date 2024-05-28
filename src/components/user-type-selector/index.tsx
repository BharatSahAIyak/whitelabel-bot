import farmer from "./assets/farmer.jpeg";
import user from "./assets/user.svg";
import farmer2 from "./assets/farmer-op.svg";
import { useColorPalates } from "../../providers/theme-provider/hooks";
import LanguagePicker from "../language-picker";
import { useConfig } from "../../hooks/useConfig";
import Image from "next/image";

const UserTypeSelector = (props: any) => {
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
              fontWeight: "400",
              color: "#51586B",
            }}
          >
            {config?.title}
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: 'center',
              marginTop: "32px",
            }}
          >
            {/* Two cards/buttons */}
            <div
              onClick={() => {
                props?.setOnboardingData((prev: any) => ({
                  ...prev,
                  userType: config?.user1Text,
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
              <Image
                src={config?.user1Image || farmer2}
                alt="Farmer"
                style={{ maxWidth: "100%", height: "auto" }}
              />
              <p>{config?.user1Text} </p>
            </div>
            <p className="m-0">या</p>
            <div
              onClick={() => {
                props?.setOnboardingData((prev: any) => ({
                  ...prev,
                  userType: config?.user2Text,
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
              <Image
                src={config?.user2Image || user}
                alt="Worker"
                style={{ maxWidth: "100%", height: "auto" }}
              />
              <p>{config?.user2Text}</p>
            </div>
          </div>
        </div>
      </div>
        <div style={{height: '400px', width: '100%', overflow: 'hidden'}}>
          <Image
            src={config?.backgroundImage || farmer}
            alt="Farmer with vegetables"
            layout="responsive"
          />
        </div>
    </div>
  );
};

export default UserTypeSelector;