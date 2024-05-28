import logo from "./assets/main.png";
import cm from "./assets/cm.png";
import bottom from "./assets/bottom.png";
import LanguagePicker from "../../components/language-picker";
import { Container, IconButton } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useConfig } from "../../hooks/useConfig";
import { useColorPalates } from "../../providers/theme-provider/hooks";
import Image from "next/image";

const WelcomePage = (props: any) => {
  const config = useConfig('component', 'welcomePage');
  const theme = useColorPalates();
  return (
    <Container
      className="p-2"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between", 
        height: "100dvh", 
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
        className="p-2"
      >
       {config?.showTopLeftLogo && <Image src={config?.topLeftLogo || logo} height={ config?.topLeftLogoHeight } width={ config?.topLeftLogoWidth } />}
        <LanguagePicker />
      </div>
      <div className="text-center">
        <div className="mt-4">
         {config?.showCenterImage && <Image src={cm} alt="" width={config?.centerImageWidth} height={config?.centerImageHeight}  />}
        </div>
        <div style={{
              marginTop: '8px'
        }}>
          <text
            style={{
              fontSize: "32px",
              color: theme.primary.main,
              lineHeight: "42px",
              fontWeight: "600",
            }}
          >
           {config?.centerText}
          </text>
        </div>
      {config?.showCenterBottomImage &&  <div style={{marginTop: '8px'}}><Image src={config?.centerBottomImage || bottom} height={config?.centerBottomImageHeight} width={config?.centerBottomImageWidth } /></div>}
      </div>
     {config?.showProceedBtn && <div className="text-center mt-4">
        <IconButton
          aria-label="fingerprint"
          style={{ background: config?.proceedBtnColor || theme.primary.main, height: '76px', width: '76px' }}
          onClick={props?.handleNext}
        >
          <ArrowForwardIcon style={{ color: "white", height: '36px', width: '36px' }} />
        </IconButton>
      </div>}
    </Container>
  );
};

export default WelcomePage;