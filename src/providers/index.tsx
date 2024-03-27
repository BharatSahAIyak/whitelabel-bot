import React, { FC } from "react";
import { FlagsmithProvider } from "./flagsmith-provider";
import { LocaleProvider } from "./intl-provider";
import CustomThemeProvider from "./theme-provider";
import { CssBaseline } from "@mui/material";

const Provider: FC<any> = ({ children }) => {
  return (
    <>
        <FlagsmithProvider>
          <LocaleProvider>
            <CustomThemeProvider>
              {children}
              <CssBaseline />
            </CustomThemeProvider>
          </LocaleProvider>
        </FlagsmithProvider>
    </>
  );
};

export default Provider;