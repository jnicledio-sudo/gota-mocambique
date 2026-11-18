import React from 'react';

interface GotaLogoProps {
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export default function GotaLogo({
  animated = false,
  size = 'md',
  showText = true,
  className = '',
}: GotaLogoProps) {
  const sizeMap = {
    sm: { icon: 28, height: 32, text: 'text-base font-bold' },
    md: { icon: 38, height: 44, text: 'text-xl font-bold' },
    lg: { icon: 54, height: 64, text: 'text-3xl font-extrabold' },
    xl: { icon: 84, height: 96, text: 'text-5xl font-extrabold' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {animated ? (
        /* ========================================================
           ANIMAÇÃO REAL: GOTA A CAIR E ONDULAÇÕES NA ÁGUA
           ======================================================== */
        <div
          className="relative flex items-center justify-center shrink-0"
          style={{ width: currentSize.icon, height: currentSize.height }}
          aria-label="Animação da gota a cair"
        >
          <svg
            viewBox="0 0 64 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible"
          >
            <defs>
              {/* Gradiente da gota de água */}
              <linearGradient id="dropFallingGrad" x1="32" y1="0" x2="32" y2="24" gradientUnits="userSpaceOnUse">
                <stop stopColor="#62D6BE" />
                <stop offset="0.4" stopColor="#20B8D5" />
                <stop offset="1" stopColor="#123B5D" />
              </linearGradient>

              {/* Superfície da poça de água na base */}
              <linearGradient id="poolGrad" x1="16" y1="64" x2="48" y2="64" gradientUnits="userSpaceOnUse">
                <stop stopColor="#20B8D5" stopOpacity="0.1" />
                <stop offset="0.5" stopColor="#20B8D5" stopOpacity="0.4" />
                <stop offset="1" stopColor="#20B8D5" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Superfície suave de água na base */}
            <ellipse cx="32" cy="65" rx="26" ry="6" fill="url(#poolGrad)" />

            {/* 1.ª Ondulação concêntrica na água (impacto) */}
            <ellipse
              cx="32"
              cy="65"
              rx="24"
              ry="5.5"
              stroke="#20B8D5"
              strokeWidth="1.8"
              fill="none"
              className="anim-water-ripple-1"
            />

            {/* 2.ª Ondulação secundária (eco) */}
            <ellipse
              cx="32"
              cy="65"
              rx="18"
              ry="4.2"
              stroke="#62D6BE"
              strokeWidth="1.4"
              fill="none"
              className="anim-water-ripple-2"
            />

            {/* Gotícula que se forma e cai acelerando */}
            <g className="anim-drop-falling">
              <path
                d="M32 0 C32 0 25 9 25 15 C25 18.8 28.1 22 32 22 C35.9 22 39 18.8 39 15 C39 9 32 0 32 0 Z"
                fill="url(#dropFallingGrad)"
              />
              {/* Brilho de reflexo de luz na gota em queda */}
              <ellipse cx="29" cy="13" rx="1.5" ry="3.5" fill="#FFFFFF" fillOpacity="0.8" transform="rotate(-18 29 13)" />
            </g>

            {/* Respingo sutil de ressalto após impacto */}
            <circle cx="32" cy="20" r="2.2" fill="#20B8D5" className="anim-splash-rebound" />
          </svg>
        </div>
      ) : (
        /* ========================================================
           SÍMBOLO ESTÁTICO CRISTALINO PARA NAVEGAÇÃO E CABEÇALHOS
           ======================================================== */
        <div
          className="relative flex items-center justify-center shrink-0"
          style={{ width: currentSize.icon, height: currentSize.icon }}
        >
          <svg
            viewBox="0 0 64 74"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-xs"
            aria-label="Símbolo da Gota"
          >
            <defs>
              <linearGradient id="staticDropGrad" x1="16" y1="6" x2="48" y2="68" gradientUnits="userSpaceOnUse">
                <stop stopColor="#20B8D5" />
                <stop offset="0.65" stopColor="#123B5D" />
              </linearGradient>
              <linearGradient id="staticDropHighlight" x1="24" y1="18" x2="36" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#62D6BE" stopOpacity="0.85" />
                <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.15" />
              </linearGradient>
            </defs>

            {/* Silhueta da gota de água */}
            <path
              d="M32 4C32 4 10 32 10 48C10 60.15 19.85 70 32 70C44.15 70 54 60.15 54 48C54 32 32 4 32 4Z"
              fill="url(#staticDropGrad)"
            />

            {/* Reflexo cáustico de luz */}
            <path
              d="M32 12C32 12 18 35 18 47C18 53 21 57 24 59C22 56 21 51 22 45C23.5 36 32 20 32 12Z"
              fill="url(#staticDropHighlight)"
            />
          </svg>
        </div>
      )}

      {showText && (
        <span className={`tracking-tight text-[#123B5D] ${currentSize.text} font-black flex items-center gap-1`}>
          Gota
          <span className="w-1.5 h-1.5 rounded-full bg-[#20B8D5] inline-block" />
        </span>
      )}
    </div>
  );
}
