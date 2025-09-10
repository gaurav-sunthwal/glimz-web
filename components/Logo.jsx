import * as React from "react";
const Logo = (props) => (
  <svg
    id="Layer_1"
    data-name="Layer 1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 1080 1080"
    {...props}
  >
    <defs>
      <style>
        {
          "\n      .cls-1 {\n        fill: url(#linear-gradient-2);\n      }\n\n      .cls-2 {\n        fill: url(#linear-gradient);\n      }\n    "
        }
      </style>
      <linearGradient
        id="linear-gradient"
        x1={415.95}
        y1={550.63}
        x2={662.22}
        y2={550.63}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} stopColor="#901786" />
        <stop offset={1} stopColor="#f20040" />
      </linearGradient>
      <linearGradient
        id="linear-gradient-2"
        x1={84.88}
        y1={544.51}
        x2={943.2}
        y2={544.51}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} stopColor="#0039ed" />
        <stop offset={0.03} stopColor="#0836e6" />
        <stop offset={0.39} stopColor="#6b1fa0" />
        <stop offset={0.69} stopColor="#b30e6c" />
        <stop offset={0.9} stopColor="#e0044c" />
        <stop offset={1} stopColor="#f20040" />
      </linearGradient>
    </defs>
    <path
      className="cls-2"
      d="M660.59,554.31l-54.23,30.93-106,60.45-79.59,45.38c-2.15,1.22-4.82-.33-4.82-2.79v-275.28c0-2.48,2.69-4.03,4.84-2.79l127.94,73.9,111.88,64.63c2.15,1.24,2.15,4.35-.02,5.57Z"
    />
    <path
      className="cls-1"
      d="M943.2,547.74v425.93h-225.87v-248.85c24.3-27.52,43.09-60.01,54.67-95.78,8.29-25.63,12.88-52.95,13.14-81.3h158.05ZM256.49,629.05c-8.55-26.4-13.17-54.58-13.17-83.85,0-90.31,43.96-170.23,111.63-219.52,44.69-32.56,99.73-51.75,159.29-51.75,55.15,0,106.41,16.46,149.18,44.73h217.1c-70.75-114.53-193.59-193.32-335.56-203.31h-61.45c-213.7,15.05-384.08,185.95-398.64,400.05v59.59c14.21,208.96,176.86,376.77,383.35,398.68h195.89v-202.42c-42.91,28.56-94.43,45.2-149.88,45.2-120.52,0-222.52-78.58-257.75-187.41Z"
    />
  </svg>
);
export default Logo;
