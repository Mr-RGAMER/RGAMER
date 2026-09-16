import React from 'react';

interface LogoIconProps {
  size?: number;
  className?: string;
  withGlow?: boolean;
  animated?: boolean;
}

export function LogoIcon({ 
  size = 32, 
  className = '',
  withGlow = true,
  animated = false
}: LogoIconProps) {
  // Unique gradient and filter IDs to prevent DOM collision across instances
  const idSuffix = React.useId().replace(/:/g, '_');

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-all duration-300 ${
        animated ? 'animate-pulse-glow hover:scale-105' : ''
      } ${
        withGlow ? 'drop-shadow-[0_0_12px_rgba(0,245,255,0.7)] hover:drop-shadow-[0_0_20px_rgba(168,85,247,0.9)]' : ''
      } ${className}`}
    >
      <defs>
        {/* Hypersonic Cyber R Gradient - Vibrant Cyan -> Electric Indigo -> Cyber Violet */}
        <linearGradient id={`rGrad_${idSuffix}`} x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00F5FF" />
          <stop offset="35%" stopColor="#38BDF8" />
          <stop offset="68%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>

        {/* Kick Leg Secondary High-Speed Gradient */}
        <linearGradient id={`kickGrad_${idSuffix}`} x1="50" y1="52" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>

        {/* Outer Shield Hex / Diamond Gradient */}
        <linearGradient id={`shieldGrad_${idSuffix}`} x1="50" y1="4" x2="50" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00F5FF" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#6366F1" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#A855F7" stopOpacity="0.85" />
        </linearGradient>

        {/* Internal Glow on R Shield */}
        <radialGradient id={`coreGlow_${idSuffix}`} cx="50" cy="50" r="45" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00F5FF" stopOpacity="0.32" />
          <stop offset="55%" stopColor="#6366F1" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        {/* Specular White-to-Cyan Edge Highlight */}
        <linearGradient id={`highlightGrad_${idSuffix}`} x1="30" y1="20" x2="80" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#00F5FF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
        </linearGradient>

        {/* Cyber Optic Power Accent Gradient */}
        <linearGradient id={`powerGrad_${idSuffix}`} x1="72" y1="20" x2="84" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00F5FF" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>

      {/* Outer Cyber Battlestation Polygon Shield */}
      <polygon 
        points="50,6 88,26 88,74 50,94 12,74 12,26" 
        fill="#0a0a0f" 
        stroke={`url(#shieldGrad_${idSuffix})`} 
        strokeWidth="2.5" 
        strokeLinejoin="round" 
      />

      {/* Inner ambient glow */}
      <polygon 
        points="50,10 84,28 84,72 50,90 16,72 16,28" 
        fill={`url(#coreGlow_${idSuffix})`}
      />

      {/* Inner Micro Grid lines / Circuit accents for Sci-Fi depth */}
      <line x1="28" y1="20" x2="22" y2="26" stroke="#00F5FF" strokeWidth="1" opacity="0.4" />
      <line x1="72" y1="80" x2="78" y2="74" stroke="#A855F7" strokeWidth="1" opacity="0.4" />

      {/* Futuristic Coder Bracket < on left edge */}
      <path 
        d="M21 38L16 50L21 62" 
        stroke="#00F5FF" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        opacity="0.9" 
      />

      {/* Futuristic Coder Bracket > on right edge */}
      <path 
        d="M79 38L84 50L79 62" 
        stroke="#A855F7" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        opacity="0.9" 
      />

      {/* ========================================================= */}
      {/* THE OFFICIAL CYBER "R" MONOGRAM (CHISELED AERODYNAMIC ARCHITECTURE) */}
      {/* ========================================================= */}

      {/* Combined Single-Path "R" Monogram with EvenOdd hollow cutout */}
      <path 
        d="
          M 28 26
          L 34 20
          H 62
          C 74 20, 81.5 26.5, 81.5 37.5
          C 81.5 47, 75 53, 64.5 54.5
          L 77 73.5
          L 73.5 77
          H 61
          L 49.5 56
          H 41
          V 77
          H 28
          Z

          M 41 29
          V 46.5
          H 60.5
          C 66.5 46.5, 70 43, 70 37.5
          C 70 32, 66.5 29, 60.5 29
          Z
        " 
        fillRule="evenodd"
        fill={`url(#rGrad_${idSuffix})`} 
      />

      {/* Hypersonic Kick Blade Accent Wing (Adds 3D layered speed & depth) */}
      <path 
        d="M 52.5 56 L 64.5 54.5 L 77 73.5 L 73.5 77 L 61 77 Z" 
        fill={`url(#kickGrad_${idSuffix})`} 
        opacity="0.85"
      />

      {/* Top Titanium Specular Highlight along the upper bevel & loop curve */}
      <path 
        d="M 33 21 H 62 C 73 21, 79.5 27, 79.5 37" 
        stroke={`url(#highlightGrad_${idSuffix})`} 
        strokeWidth="1.8" 
        strokeLinecap="round" 
      />

      {/* Laser-Cut Speed Groove on the kick blade (Cyber Stencil Vibe) */}
      <line 
        x1="55" 
        y1="60" 
        x2="69" 
        y2="74" 
        stroke="#00F5FF" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        opacity="0.85"
      />

      {/* Left Stem Sharp Bevel Highlight */}
      <line 
        x1="29" 
        y1="28" 
        x2="29" 
        y2="76" 
        stroke="#FFFFFF" 
        strokeWidth="1" 
        strokeLinecap="round" 
        opacity="0.35" 
      />

      {/* Cyber Corner Optic Power Accent (Geometric, Clean - No Flowers/Stars) */}
      <rect 
        x="77" 
        y="18" 
        width="5" 
        height="5" 
        rx="1" 
        transform="rotate(45 79.5 20.5)"
        fill={`url(#powerGrad_${idSuffix})`}
      />
    </svg>
  );
}

export default LogoIcon;
