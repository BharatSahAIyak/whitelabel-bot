import { useEffect, useState} from 'react';
import localConfig from '../../app.config.json';
import axios from 'axios';
import {merge} from 'lodash'

//@ts-ignore
const deepMerge = (target, ...sources):any => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
};

const isObject = (item:any) => {
  return (item && typeof item === 'object' && !Array.isArray(item));
};

const fetchOverrideConfig = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        theme:{
          "primaryColor": {
            "allowOverride": true,
            "value": "#fffff"
          },
        }
      });
    }, 100); // Simulate a 1 second network delay
  });
};

const mergeConfiguration =async ()=>{
  let overrideConfig:any ={};
  try {
    // const response = await axios.get('URL_TO_FETCH_OVERRIDE_CONFIG');
    overrideConfig = await fetchOverrideConfig();
    //overrideConfig = response.data;
  } catch (error) {
    console.error('Error fetching override configuration:', error);
    // Optionally handle error, such as falling back to default configs
  }

  // const mergedConfig =await deepMerge({} ,localConfig,overrideConfig);
  console.log("hola:",{overrideConfig})
  const mergedConfig = await merge(localConfig,overrideConfig);

  return mergedConfig
} 
export default mergeConfiguration 