import { FC } from 'react';
import { Backdrop, Stack } from '@mui/material';
import styles from './style.module.css';
import { FullPageLoader as FullPageLoader2 } from '@samagra-x/stencil-molecules/lib/fullpage-loader';

export const FullPageLoader: FC<{
  loading: boolean;
  color?: string;
  background?: string;
  label?: string;
}> = ({ loading, color = '#25b09b', background = 'rgba(0, 0, 0, 0.5)', label }) => (
  <FullPageLoader2 loading={loading} color={color} background={background} label={label} />
);
