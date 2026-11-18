import { useCallback, useEffect, useRef, useState } from 'react';

interface FullscreenDocument extends Document {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
}

interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void;
}

export function useGameFullscreen() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [isFallbackFullscreen, setIsFallbackFullscreen] = useState(false);

  const isFullscreen = isNativeFullscreen || isFallbackFullscreen;

  useEffect(() => {
    const syncNative = () => {
      const doc = document as FullscreenDocument;
      const activeEl = doc.fullscreenElement || doc.webkitFullscreenElement || null;
      const matchesContainer = Boolean(activeEl && containerRef.current && activeEl === containerRef.current);
      setIsNativeFullscreen(matchesContainer);
    };

    document.addEventListener('fullscreenchange', syncNative);
    document.addEventListener('webkitfullscreenchange', syncNative);
    return () => {
      document.removeEventListener('fullscreenchange', syncNative);
      document.removeEventListener('webkitfullscreenchange', syncNative);
    };
  }, []);

  useEffect(() => {
    if (!isFallbackFullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFallbackFullscreen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFallbackFullscreen]);

  const enterFullscreen = useCallback(async () => {
    const el = containerRef.current as FullscreenElement | null;
    if (!el) return;

    try {
      if (el.requestFullscreen) {
        await el.requestFullscreen();
        setIsNativeFullscreen(true);
        setIsFallbackFullscreen(false);
        return;
      }
      if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
        setIsNativeFullscreen(true);
        setIsFallbackFullscreen(false);
        return;
      }
    } catch {
      // Sandboxed iframes or iOS Safari can reject requestFullscreen; fall back smoothly.
    }

    setIsFallbackFullscreen(true);
  }, []);

  const exitFullscreen = useCallback(async () => {
    const doc = document as FullscreenDocument;
    if (doc.fullscreenElement || doc.webkitFullscreenElement) {
      try {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        }
      } catch {
        // Ignore browser exit rejections
      }
    }
    setIsNativeFullscreen(false);
    setIsFallbackFullscreen(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      void exitFullscreen();
    } else {
      void enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  return {
    containerRef,
    isFullscreen,
    isNativeFullscreen,
    isFallbackFullscreen,
    toggleFullscreen,
    exitFullscreen,
  };
}
