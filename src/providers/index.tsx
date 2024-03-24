import React, { FC } from 'react';
import CustomThemeProvider from './theme-provider';
import { CssBaseline } from '@mui/material';

const Provider: FC<any> = ({ children }) => {
  return (
    <>
      <CustomThemeProvider>
        {children}
        <CssBaseline />
      </CustomThemeProvider>
    </>
  );
};

export default Provider;
