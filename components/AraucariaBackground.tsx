import React from 'react';

// Este é um Server Component por padrão. Nenhuma mudança necessária.
export const AraucariaBackground: React.FC = () => {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-10 -z-10"
      viewBox="0 0 1200 800"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c9a66b" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#c9a66b" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Animação sutil da árvore */}
      <g className="araucaria-tree">
        <path
          d="M 600 700 L 600 400"
          stroke="#3a5a40"
          strokeWidth="12"
          fill="none"
          opacity="0.6"
        />
        <circle cx="600" cy="350" r="150" fill="#6a7c49" opacity="0.3">
          <animate
            attributeName="r"
            values="150;155;150"
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>
        <g className="branches">
          <path
            d="M 600 500 Q 500 450 450 420"
            stroke="#6a7c49"
            strokeWidth="6"
            fill="none"
            opacity="0.5"
          >
            <animate
              attributeName="d"
              values="M 600 500 Q 500 450 450 420; M 600 500 Q 505 448 455 418; M 600 500 Q 500 450 450 420"
              dur="3s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M 600 500 Q 700 450 750 420"
            stroke="#6a7c49"
            strokeWidth="6"
            fill="none"
            opacity="0.5"
          >
            <animate
              attributeName="d"
              values="M 600 500 Q 700 450 750 420; M 600 500 Q 695 448 745 418; M 600 500 Q 700 450 750 420"
              dur="3s"
              repeatCount="indefinite"
            />
          </path>
          {/* ...outros galhos... */}
        </g>
      </g>

      {/* Animação do caminho */}
      <path
        d="M 100 600 Q 300 580 600 550 T 1100 600"
        stroke="url(#pathGradient)"
        strokeWidth="3"
        fill="none"
        strokeDasharray="10 5"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="30"
          dur="2s"
          repeatCount="indefinite"
        />
      </path>

      {/* Animação do pássaro */}
      <circle cx="200" cy="400" r="3" fill="#3b5998" opacity="0.6">
        <animate
          attributeName="cy"
          values="400;390;400"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="cx"
          values="200;250;200"
          dur="4s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
};