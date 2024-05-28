import React, {useContext} from "react";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { map } from "lodash";
import { useColorPalates } from "../../providers/theme-provider/hooks";
import { useConfig } from "../../hooks/useConfig";
import { AppContext } from "../../context";
const LanguagePicker = () => {
  const [activeLanguage, setActiveLanguage] = React.useState("en");
  const config = useConfig('component', 'sidebar');
  const context = useContext(AppContext);

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
        background: theme?.primary?.light,
        border: "none",
        borderRadius: "10px",
        height:'36px'
      }}
      size="small"
    >
      <Select
        value={activeLanguage}
        onChange={handleChange}
        displayEmpty
        inputProps={{ "aria-label": "Without label" }}
        sx={{
          color: theme.primary.dark,
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