import React, { FC } from "react";
import { ReduxProvider } from "./redux-provider";
import { FlagsmithProvider } from "./flagsmith-provider";
import { LocaleProvider } from "./intl-provider";
import CustomThemeProvider from "./theme-provider";
import { CssBaseline } from "@mui/material";

const Provider: FC<any> = ({ children }) => {
  return (
    <>
      <ReduxProvider>
        <FlagsmithProvider>
          <LocaleProvider>
            <CustomThemeProvider>
              {children}
              <CssBaseline />
            </CustomThemeProvider>
          </LocaleProvider>
        </FlagsmithProvider>
      </ReduxProvider>
    </>
  );
};

export default Provider;
