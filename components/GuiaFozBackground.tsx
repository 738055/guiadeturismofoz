// components/GuiaFozBackground.tsx
import React from 'react';

export const GuiaFozBackground: React.FC = () => {
  return (
    <svg
      className="absolute inset-0 w-full h-full -z-10"
      viewBox="0 0 1200 800"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="gradFoz" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#006837" stopOpacity="0.4" /> {/* Verde Principal */}
          <stop offset="100%" stopColor="#00AEEF" stopOpacity="0.4" /> {/* Azul Foz */}
        </linearGradient>
        
        <symbol id="pin-icon" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </symbol>
      </defs>

      <rect width="100%" height="100%" fill="transparent" />

      <g fill="url(#gradFoz)">
        <use href="#pin-icon" x="100" y="100" width="50" height="50" opacity="0.2">
          <animate attributeName="y" values="100;90;100" dur="4s" repeatCount="indefinite" />
        </use>
        <use href="#pin-icon" x="800" y="200" width="80" height="80" opacity="0.15">
           <animate attributeName="y" values="200;210;200" dur="5s" repeatCount="indefinite" />
        </use>
        <use href="#pin-icon" x="500" y="600" width="60" height="60" opacity="0.1">
           <animate attributeName="y" values="600;590;600" dur="6s" repeatCount="indefinite" />
        </use>
      </g>
      
      {/* Ondas representando os rios/cataratas */}
      <path
        d="M -100 400 Q 300 350 600 500 T 1300 450"
        stroke="url(#gradFoz)"
        strokeWidth="2"
        fill="none"
        opacity="0.1"
      />
      <path
        d="M -100 450 Q 300 400 600 550 T 1300 500"
        stroke="url(#gradFoz)"
        strokeWidth="2"
        fill="none"
        opacity="0.15"
      />
    </svg>
  );
};