import React, { useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSubject?: string;
  className?: string;
  aspectRatioClass?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackSubject = 'Marine Life',
  className = '',
  aspectRatioClass = 'aspect-[16/10]',
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Safe fallback marine gradients
  const fallbackStyles = [
    'from-[#072435] via-[#0B526B] to-[#041520]',
    'from-[#051E2E] via-[#087F8C] to-[#031019]',
    'from-[#092C44] via-[#0D4B66] to-[#061B29]',
    'from-[#031A28] via-[#0B3A52] to-[#020D14]',
  ];
  const colorIndex = Math.abs(alt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % fallbackStyles.length;

  return (
    <div className={`relative overflow-hidden bg-[#0A2435] ${aspectRatioClass} ${className}`}>
      {/* Loading Skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#071F2E] via-[#0B364C] to-[#071F2E] animate-pulse" />
      )}

      {!hasError ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-all duration-700 ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
          {...rest}
        />
      ) : (
        /* Graceful Editorial Ocean Graphic Fallback */
        <div className={`w-full h-full flex flex-col justify-end p-5 bg-gradient-to-br ${fallbackStyles[colorIndex]} text-[#F4F7F5] relative`}>
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#35C6C0_1px,transparent_1px)] [background-size:16px_16px]" />
          
          {/* Subtle water caustics overlay */}
          <div className="absolute inset-0 opacity-30 bg-gradient-to-t from-black/80 via-transparent to-[#35C6C0]/10 pointer-events-none" />

          {/* Marine graphic silhouette badge */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#35C6C0]">
              {fallbackSubject}
            </span>
            <div className="w-8 h-8 rounded-full border border-[#35C6C0]/30 flex items-center justify-center text-[#9DE3D7]/80 text-xs">
              🌊
            </div>
          </div>
          <p className="relative z-10 text-xs font-medium text-[#F4F7F5]/90 mt-1 line-clamp-1">
            {alt}
          </p>
        </div>
      )}
    </div>
  );
};
