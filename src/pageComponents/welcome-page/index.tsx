import LanguagePicker from "../../components/language-picker";
import { Container, IconButton } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useConfig } from "../../hooks/useConfig";
import { useColorPalates } from "../../providers/theme-provider/hooks";
import { useLocalization } from "../../hooks";

const WelcomePage = (props: any) => {
  const t = useLocalization();
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
          alignItems: 'center',
          width: "100%",
        }}
        className="p-2"
      >
       {config?.showTopLeftLogo && <img src={config?.topLeftLogo} height={config?.topLeftLogoHeight} width={config?.topLeftLogoWidth} />}
        <LanguagePicker />
      </div>
      <div className="text-center">
        <div className="mt-4">
         {config?.showCenterImage && <img src={config?.centerImage} width={config?.centerImageWidth} height={config?.centerImageHeight} />}
        </div>
        <div style={{
              marginTop: '8px'
        }}>
          <text
            style={{
              fontSize: "32px",
              color: theme?.primary?.main,
              lineHeight: "42px",
              fontWeight: "600",
            }}
          >
           {t("label.subtitle")}
          </text>
        </div>
      {config?.showCenterBottomImage &&  <div style={{marginTop: '8px'}}><img src={config?.centerBottomImage} height={config?.centerBottomImageHeight} width={config?.centerBottomImageWidth} /></div>}
        <div style={{
              marginTop: '8px'
        }}>
          <text
            style={{
              fontSize: "24px",
              color: 'var(--font)',
              fontWeight: "600",
            }}
          >
           {t("label.connect_with_us")}
          </text>
        </div>
      </div>
     {<div className="text-center mt-4">
        <IconButton
          aria-label="fingerprint"
          style={{ background: theme?.primary?.main, height: '76px', width: '76px' }}
          onClick={props?.handleNext}
        >
          <ArrowForwardIcon style={{ color: "white", height: '36px', width: '36px' }} />
        </IconButton>
      </div>}
    </Container>
  );
};

export default WelcomePage;