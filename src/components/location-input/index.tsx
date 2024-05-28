/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from "react";
import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  TextField
} from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SearchIcon from "@mui/icons-material/Search";
import { useConfig } from "../../hooks/useConfig";
import { useColorPalates } from "../../providers/theme-provider/hooks";
import LocationPermissionModal from "./LocationPermissionModal";
import { useLocalization } from "../../hooks";

const LocationInput = (props: any) => {
  const t = useLocalization();
  const [inputValue, setInputValue] = React.useState("");
  const [location, setLocation] = React.useState<any>(null);
  const theme = useColorPalates();

  useEffect(() => {
    if (location) {
      props?.setOnboardingData((prev: any) => ({
        ...prev,
        location,
      }))
      props?.handleNext();
    }
  }, [location])

  return (
    <Container>
      <LocationPermissionModal setLocation={setLocation} />
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
            {t('label.current_location')}
          </p>
        </div>
      </div>

      <div className="text-center mt-4">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "70dvh",
          }}
        >
          <TextField
            id="search-bar"
            className="text"
            onInput={(e) => {
              setInputValue((e.target as HTMLInputElement).value);
            }}
            value={inputValue}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{width: '36px', height: '36px'}}/>
                </InputAdornment>
              ),
              sx: {
                fontSize: '20px',
                fontWeight: '400',
                fontFamily: 'NotoSans-Regular',
              }
            }}
            variant="outlined"
            placeholder={t('label.enter_location')}
            size="medium"
          />
        </div>
        <div>
            <Box sx={{ mt: 1 }}>
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
                    location: inputValue,
                  }))
                  props?.handleNext();
                }}
                endIcon={<ArrowForwardIcon/>}
              >
               {t('label.confirm')}
              </Button>
            </Box>
          </div>
      </div>
    </Container>
  );
};

export default LocationInput;