import React from 'react';

interface FlagProps {
  className?: string;
  rounded?: boolean;
}

export const ColombiaFlag: React.FC<FlagProps> = ({ className = 'w-10 h-7', rounded = true }) => {
  return (
    <svg
      viewBox="0 0 900 600"
      className={`${className} ${rounded ? 'rounded-md shadow-xs overflow-hidden' : ''}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="900" height="300" fill="#FCD116" />
      <rect y="300" width="900" height="150" fill="#003893" />
      <rect y="450" width="900" height="150" fill="#CE1126" />
    </svg>
  );
};

export const VenezuelaFlag: React.FC<FlagProps> = ({ className = 'w-10 h-7', rounded = true }) => {
  // Venezuela flag with 8 white stars arc on the blue stripe
  return (
    <svg
      viewBox="0 0 900 600"
      className={`${className} ${rounded ? 'rounded-md shadow-xs overflow-hidden' : ''}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="900" height="200" fill="#FCD116" />
      <rect y="200" width="900" height="200" fill="#00247D" />
      <rect y="400" width="900" height="200" fill="#CF142B" />
      {/* 8 white stars in an arc */}
      <g fill="#FFFFFF" transform="translate(450, 310)">
        {[-70, -50, -30, -10, 10, 30, 50, 70].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const r = 85;
          const x = r * Math.sin(rad);
          const y = -r * Math.cos(rad) + 20;
          return (
            <polygon
              key={i}
              points="0,-12 3.5,-3.7 11.4,-3.7 5.1,1.4 7.5,9.7 0,4.6 -7.5,9.7 -5.1,1.4 -11.4,-3.7 -3.5,-3.7"
              transform={`translate(${x}, ${y}) scale(0.9)`}
            />
          );
        })}
      </g>
    </svg>
  );
};
