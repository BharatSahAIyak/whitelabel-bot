import React from 'react';

const SpeakerIcon = (props: any) => (
  <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_4_45948)">
      <path
        d="M0 5.54837H4.47746L11.2131 0.0585938V18.9418L4.47746 13.452H0V5.54837ZM13.7439 4.65287C15.0676 5.97665 15.7425 7.58593 15.7684 9.48074C15.7684 11.2977 15.0936 12.855 13.7439 14.1529L12.3811 12.7513C13.3156 11.8168 13.7828 10.7137 13.7828 9.44181C13.7828 8.144 13.3156 7.01492 12.3811 6.05452L13.7439 4.65287ZM16.0799 2.35574C18.0266 4.30246 19 6.65152 19 9.40287C19 12.1542 18.0266 14.5163 16.0799 16.4889L14.6393 15.0484C16.1967 13.517 16.9754 11.6416 16.9754 9.42238C16.9754 7.20312 16.1967 5.31479 14.6393 3.7574L16.0799 2.35574Z"
        fill={props.color}
      />
    </g>
    <defs>
      <clipPath id="clip0_4_45948">
        <rect width="19" height="19" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default SpeakerIcon;
