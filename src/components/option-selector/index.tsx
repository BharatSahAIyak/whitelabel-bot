/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  Link,
  Paper,
  styled,
} from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import rice from "./assets/rice.jpeg";
import wheat from "./assets/wheat.png";
import more from "./assets/more.png";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { includes } from "lodash";
import { useConfig } from "../../hooks/useConfig";
import { useColorPalates } from "../../providers/theme-provider/hooks";
import Image from "next/image";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: "center",
  color: "#363A44",
  borderRadius: "5px",
  position: "relative",
}));
const OptionSelector = (props: any) => {
  const config = useConfig("component", "optionSelectorPage");
  const theme = useColorPalates();
  const [activeElements, setActiveElements] = React.useState<Array<any>>([]);
  const vegetables = [
    { id: 1, label: "गेहूँ", key: "गेहूँ", image: rice },
    { id: 2, label: "चावल", key: "चावल", image: wheat },
    { id: 3, label: "milk", key: "milk", image: rice },
    { id: 4, label: "आलू", key: "आलू", image: wheat },
    { id: 5, label: "गेहूँ", key: "गेहूँ", image: wheat },
    { id: 6, label: "चावल", key: "आलू", image: rice },
    { id: 7, label: "आलू", key: "आलू", image: wheat },
    { id: 8, label: "गेहूँ", key: "आलू", image: rice },
    { id: 9, label: "अन्य", key: "more", image: more },
  ];

  const onItemClick = useCallback(
    (item: any) => () => {
      if ((activeElements.length == (config?.optionSelectLength ?? 4 ))&& (!activeElements?.includes(item?.id))) {
        alert(`You can select only ${config?.optionSelectLength ?? 4 } items`);
        return;
      }
      setActiveElements((prev) =>
        prev?.includes(item?.id)
          ? prev?.filter((i) => i !== item?.id)
          : [...prev, item?.id]
      );
    },
    [activeElements, config?.optionSelectLength]
  );

  const selectedLabels = activeElements.map(id => {
    const vegetable = vegetables.find(v => v.id === id);
    return vegetable ? vegetable.label : null;
  }).filter(label => label !== null);
  
  return (
    <Container>
      <div className="d-flex pt-2 align-items-center justify-content-center mt-2">
        <IconButton
          aria-label="fingerprint"
          style={{
            height: '40px',
            width: '40px',
            borderRadius: "12px",
            border: "1px solid #E8ECF4",
          }}
          onClick={props?.handleBack}
        >
          <ArrowBackIosNewRoundedIcon />
        </IconButton>
        <div className="text-center w-100 pr-4">
          <p
            style={{
              fontWeight: "500",
              fontSize: "32px",
              color: theme?.primary?.main,
              margin: 0
            }}
          >
            {config?.topText}
          </p>
        </div>
      </div>

      <div className="text-center mt-4">
        <p style={{ color: "#51586B", fontSize: "24px" }}>
          {config?.centerText}
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "60dvh",
            overflow: 'auto'
          }}
        >
          <Grid
            container
            spacing={{ xs: 2, md: 3 }}
            columns={{ xs: 3, sm: 8, md: 12 }}
            style={{ marginTop: "10px" }}
          >
            {vegetables.map((_) => (
              <Grid item xs={1} sm={4} md={4}>
                <Item
                  onClick={onItemClick(_)}
                  style={{
                    border: includes(activeElements, _?.id)
                      ? `1px solid ${theme?.primary?.main}`
                      : "1px solid #B0B0B0",
                  }}
                >
                  {includes(activeElements, _?.id) && (
                    <div
                      className="rounded-circle position-absolute "
                      style={{
                        width: "20px",
                        height: "20px",
                        top: "0px",
                        left: "75%",
                      }}
                    >
                      <CheckCircleRoundedIcon color="success" />
                    </div>
                  )}
                  <div style={{
                    width: "70px",
                    height: "70px",
                    overflow: 'hidden',
                    borderRadius: "50%",
                    margin: 'auto',
                  }}>
                  <Image
                    src={_?.image}
                    height='100%'
                    width="100%"
                  />
                  </div>
                  <p style={{ fontSize: "20px" }} className="mt-1 mb-0">
                    {_?.label}
                  </p>
                </Item>
              </Grid>
            ))}
          </Grid>
        </div>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  textTransform: "none",
                  mt: 2,
                  mb: 2,
                  width: '80%',
                  height: '60px',
                  fontSize: '16px',
                  p: 1,
                  background: theme?.primary?.main,
                  borderRadius: "10px",
                }}
                onClick={() => {
                  props?.setOnboardingData((prev: any) => ({
                    ...prev,
                    crops: selectedLabels,
                  }))
                  props?.handleNext();
                }}
                endIcon={<ArrowForwardIcon />}
              >
               {config?.btnText}
              </Button>
              <Link
                component="button"
                variant="body2"
                onClick={props?.handleNext}
                className="mt-2"
                sx={{fontSize: '16px', color: '#6D6D6D'}}
              >
               {config?.helpingText1}
              </Link>
            </Box>
      </div>
    </Container>
  );
};

export default OptionSelector;