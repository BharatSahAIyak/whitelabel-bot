import { useEffect, useState } from 'react';
import localConfig from '../../app.config.json';
import axios from 'axios';
import { merge } from 'lodash'

//@ts-ignore
const deepMerge = (target, ...sources): any => {
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

const isObject = (item: any) => {
  return (item && typeof item === 'object' && !Array.isArray(item));
};

const fetchOverrideConfig = async () => {
  try {

    let deploymentIdConfig = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${process.env.NEXT_PUBLIC_PWA_DEPLOYER_URL}/deployment/whitelable-bot`,
      headers: {
        'accept': 'application/json'
      }
    };
    const deploymentResp = await axios.request(deploymentIdConfig);

    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${process.env.NEXT_PUBLIC_PWA_DEPLOYER_URL}/deployment/config/${deploymentResp?.data?.data?.deploymentId}`,
      headers: {
        'accept': 'application/json'
      }
    };

    const res = await axios.request(config);
    return res?.data?.data?.config;
  } catch (err) {
    console.error(err);
  }
  return {};
};

const mergeConfiguration = async () => {
  let overrideConfig: any = {};
  try {
    // const response = await axios.get('URL_TO_FETCH_OVERRIDE_CONFIG');
    overrideConfig = await fetchOverrideConfig();
    console.log("chula chula2:",{localConfig,overrideConfig})
    //overrideConfig = response.data;
  } catch (error) {
    console.error('Error fetching override configuration:', error);
    // Optionally handle error, such as falling back to default configs
  }

  const mergedConfig =await deepMerge({} ,localConfig,overrideConfig);

 // const mergedConfig = await merge(localConfig, overrideConfig);
  console.log("chula:", { overrideConfig ,mergedConfig})
  return mergedConfig
}
export default mergeConfiguration 