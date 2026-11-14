import React, { useState, useEffect } from 'react';
import { Compass } from 'lucide-react';

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
  fallbackSubject = 'Arsip Samudra',
  className = '',
  aspectRatioClass = 'aspect-[16/10]',
  loading = 'lazy',
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  // Natural abyss-to-teal fallback tones
  const fallbackStyles = [
    'from-[#091C25] via-[#17485A] to-[#061116]',
    'from-[#061116] via-[#102B38] to-[#091C25]',
    'from-[#102B38] via-[#367D7B]/40 to-[#061116]',
    'from-[#091C25] via-[#17485A]/80 to-[#061116]',
  ];
  const colorIndex = Math.abs(alt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % fallbackStyles.length;

  return (
    <div className={`relative overflow-hidden bg-[var(--bg-surface)] ${aspectRatioClass} ${className}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#091C25]/40 via-[#102B38]/40 to-[#091C25]/40 animate-pulse" />
      )}

      {!hasError ? (
        <img
          src={src}
          alt={alt}
          loading={loading}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-all duration-700 ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.03]'
          }`}
          {...rest}
        />
      ) : (
        <div className={`w-full h-full flex flex-col justify-end p-5 bg-gradient-to-br ${fallbackStyles[colorIndex]} text-[#EDEBE3] relative`}>
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#82AAA1_1px,transparent_1px)] [background-size:18px_18px]" />
          <div className="absolute inset-0 opacity-40 bg-gradient-to-t from-[#061116] via-transparent to-[#367D7B]/10 pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium uppercase tracking-widest text-[#82AAA1]">
              {fallbackSubject}
            </span>
            <Compass className="w-4 h-4 text-[#82AAA1]/70 shrink-0" />
          </div>
          <p className="relative z-10 text-xs font-medium text-[#EDEBE3]/90 mt-1 line-clamp-1">
            {alt}
          </p>
        </div>
      )}
    </div>
  );
};
