import React, { ReactNode, useCallback, useState } from "react";
import {
  ThemeProvider as MuiThemeProvider,
  Theme,
  createTheme,
} from "@mui/material/styles";
import { initialTheme } from "./theme";
import { Color, ThemeContext } from "./theme-context";


interface CustomThemeProviderProps {
  children: ReactNode;
}

const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  const modifyTheme = (changes: Partial<Theme>) => {
    setTheme((prevTheme) => createTheme({ ...prevTheme, ...changes }));
  };

  const modifyPaletes = useCallback((palette: Color) => {
    setTheme((prevTheme) => createTheme({ ...prevTheme, palette: { ...prevTheme.palette, primary: { ...palette } } }))
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, modifyTheme, modifyPaletes }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};


export default CustomThemeProvider


