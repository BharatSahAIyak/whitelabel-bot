import React, {useContext} from "react";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { map } from "lodash";
import { useColorPalates } from "../../providers/theme-provider/hooks";
import { useConfig } from "../../hooks/useConfig";
import { AppContext } from "../../context";
const LanguagePicker = () => {
  const config = useConfig('component', 'sidebar');
  const botConfig = useConfig('component', 'botDetails');
  const context = useContext(AppContext);
  const [activeLanguage, setActiveLanguage] = React.useState(localStorage.getItem('locale') || botConfig?.defaultLanguage || "en");

  const handleChange = (event: SelectChangeEvent) => {
    setActiveLanguage(event.target.value);
    localStorage.setItem('locale', event.target.value);
    context?.setLocale(event.target.value);
  };
  const theme = useColorPalates();

  const languages = [
    { name: config?.languageName1, value: config?.languageCode1 },
    { name: config?.languageName2, value: config?.languageCode2 },
  ];
  return (
    <FormControl
      sx={{
        m: 1,
        background: theme?.primary?.main,
        border: "none",
        borderRadius: "10px",
        height:'36px'
      }}
      size="small"
      data-testid="language-picker"
    >
      <Select
        value={activeLanguage}
        onChange={handleChange}
        displayEmpty
        inputProps={{ "aria-label": "Without label" }}
        sx={{
          color: theme?.primary?.contrastText,
          border: "none",
          borderRadius: "10px",
          width: "85px",
          height:'36px'
        }}
      >
        {map(languages, (lang) => (
          <MenuItem value={lang?.value}>{lang?.name}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LanguagePicker;