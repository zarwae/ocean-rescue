import React, { useEffect, useRef, useState } from 'react';

interface ClickSplash {
  id: number;
  x: number;
  y: number;
  mode: 'fish' | 'net';
}

function normalizeAngleDiff(target: number, current: number): number {
  let diff = target - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, textarea, select, summary, [tabindex]:not([tabindex="-1"]), label';

export const FishCursor: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [splashes, setSplashes] = useState<ClickSplash[]>([]);

  const fishAnchorRef = useRef<HTMLDivElement | null>(null);
  const fishBodyRef = useRef<HTMLDivElement | null>(null);
  const tailFinRef = useRef<SVGGElement | null>(null);
  const leftFinRef = useRef<SVGGElement | null>(null);
  const rightFinRef = useRef<SVGGElement | null>(null);
  const hoverRingRef = useRef<HTMLSpanElement | null>(null);

  const netAnchorRef = useRef<HTMLDivElement | null>(null);
  const netRigRef = useRef<HTMLDivElement | null>(null);
  const netHoverRingRef = useRef<HTMLSpanElement | null>(null);

  const splashIdRef = useRef(0);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const finePointerQuery = window.matchMedia('(pointer: fine)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const syncCapabilities = () => {
      const shouldEnable = finePointerQuery.matches && !reducedMotionQuery.matches;
      setEnabled(shouldEnable);
    };

    syncCapabilities();
    finePointerQuery.addEventListener('change', syncCapabilities);
    reducedMotionQuery.addEventListener('change', syncCapabilities);

    return () => {
      finePointerQuery.removeEventListener('change', syncCapabilities);
      reducedMotionQuery.removeEventListener('change', syncCapabilities);
    };
  }, []);

  useEffect(() => {
    const rootEl = document.documentElement;
    if (!enabled) {
      rootEl.classList.remove('fish-cursor-active');
      return;
    }

    rootEl.classList.add('fish-cursor-active');

    let rafId = 0;
    let isVisible = false;
    let isHoveringInteractive = false;
    let cursorMode: 'fish' | 'net' | 'hidden' = 'fish';

    let targetX = -200;
    let targetY = -200;
    let posX = -200;
    let posY = -200;
    let prevPosX = -200;
    let prevPosY = -200;

    let currentAngle = -Math.PI / 6;
    let targetAngle = -Math.PI / 6;
    let smoothedSpeed = 0;
    let smoothedVx = 0;
    let tailPhase = 0;
    let clickImpulse = 0;

    const syncAnchorVisibility = () => {
      if (fishAnchorRef.current) {
        fishAnchorRef.current.style.opacity = isVisible && cursorMode === 'fish' ? '1' : '0';
      }
      if (netAnchorRef.current) {
        netAnchorRef.current.style.opacity = isVisible && cursorMode === 'net' ? '1' : '0';
      }
    };

    const detectCursorMode = (targetEl: HTMLElement | null): 'fish' | 'net' | 'hidden' => {
      const modeHost = targetEl?.closest('[data-cursor-mode]') as HTMLElement | null;
      const mode = modeHost?.dataset.cursorMode;
      if (mode === 'net') return 'net';
      if (mode === 'hidden') return 'hidden';
      return 'fish';
    };

    const updateVisibilityVisual = (visible: boolean) => {
      isVisible = visible;
      syncAnchorVisibility();
    };

    const updateHoverVisual = (hovering: boolean) => {
      if (isHoveringInteractive === hovering) return;
      isHoveringInteractive = hovering;
      if (hoverRingRef.current) {
        hoverRingRef.current.style.opacity = hovering ? '1' : '0';
        hoverRingRef.current.style.transform = hovering
          ? 'translate(-50%, -50%) scale(1)'
          : 'translate(-50%, -50%) scale(0.5)';
      }
      if (netHoverRingRef.current) {
        netHoverRingRef.current.style.opacity = hovering ? '1' : '0';
        netHoverRingRef.current.style.transform = hovering
          ? 'translate(-50%, -50%) scale(1)'
          : 'translate(-50%, -50%) scale(0.7)';
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      const targetEl = e.target as HTMLElement | null;
      const nextMode = detectCursorMode(targetEl);
      if (nextMode !== cursorMode) {
        cursorMode = nextMode;
        syncAnchorVisibility();
      }

      if (!isVisible) {
        posX = targetX;
        posY = targetY;
        prevPosX = targetX;
        prevPosY = targetY;
        updateVisibilityVisual(true);
      }

      const interactive = Boolean(targetEl?.closest(INTERACTIVE_SELECTOR));
      updateHoverVisual(interactive);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      targetX = e.clientX;
      targetY = e.clientY;
      clickImpulse = 1;

      const targetEl = e.target as HTMLElement | null;
      const clickMode = detectCursorMode(targetEl);
      if (clickMode !== cursorMode) {
        cursorMode = clickMode;
        syncAnchorVisibility();
      }

      if (clickMode === 'hidden') {
        return;
      }

      const id = ++splashIdRef.current;
      setSplashes((prev) => [...prev.slice(-5), { id, x: e.clientX, y: e.clientY, mode: clickMode }]);

      const timer = window.setTimeout(() => {
        setSplashes((prev) => prev.filter((item) => item.id !== id));
        timersRef.current = timersRef.current.filter((t) => t !== timer);
      }, 680);
      timersRef.current.push(timer);
    };

    const handleMouseLeave = () => {
      updateVisibilityVisual(false);
    };

    const handleWindowBlur = () => {
      updateVisibilityVisual(false);
    };

    const animate = () => {
      if (isVisible) {
        // High-responsiveness pointer tracking for zero-lag aiming
        posX += (targetX - posX) * 0.68;
        posY += (targetY - posY) * 0.68;

        const dx = posX - prevPosX;
        const dy = posY - prevPosY;
        prevPosX = posX;
        prevPosY = posY;

        const instSpeed = Math.hypot(dx, dy);
        smoothedSpeed = smoothedSpeed * 0.84 + Math.min(instSpeed, 36) * 0.16;
        smoothedVx = smoothedVx * 0.8 + Math.max(-24, Math.min(24, dx)) * 0.2;

        if (instSpeed > 0.65) {
          targetAngle = Math.atan2(dy, dx);
        }

        const angleDiff = normalizeAngleDiff(targetAngle, currentAngle);
        currentAngle += angleDiff * 0.2;

        if (clickImpulse > 0.005) {
          clickImpulse *= 0.85;
        } else {
          clickImpulse = 0;
        }

        if (cursorMode === 'fish') {
          const speedNorm = Math.min(smoothedSpeed / 18, 1);
          const phaseStep = 0.085 + speedNorm * 0.28 + clickImpulse * 0.24;
          tailPhase += phaseStep;

          const tailAmp = 7 + speedNorm * 16 + clickImpulse * 14;
          const tailAngleDeg = Math.sin(tailPhase) * tailAmp;
          const finAngleDeg =
            Math.sin(tailPhase * 0.85 + 0.6) * (4 + speedNorm * 10 + clickImpulse * 8);

          const dartPx = Math.sin(clickImpulse * Math.PI) * 5.5;
          const bodyScale = (isHoveringInteractive ? 1.07 : 1) + clickImpulse * 0.08;
          const angleDeg = (currentAngle * 180) / Math.PI;

          if (fishAnchorRef.current) {
            fishAnchorRef.current.style.transform = `translate3d(${posX.toFixed(2)}px, ${posY.toFixed(2)}px, 0) rotate(${angleDeg.toFixed(2)}deg)`;
          }

          if (fishBodyRef.current) {
            const gentleTilt = Math.sin(tailPhase) * (0.9 + speedNorm * 1.8);
            fishBodyRef.current.style.transform = `translate3d(${dartPx.toFixed(2)}px, 0, 0) rotate(${gentleTilt.toFixed(2)}deg) scale(${bodyScale.toFixed(3)})`;
          }

          if (tailFinRef.current) {
            tailFinRef.current.setAttribute('transform', `rotate(${tailAngleDeg.toFixed(2)} 19 17)`);
          }

          if (leftFinRef.current) {
            leftFinRef.current.setAttribute('transform', `rotate(${(-finAngleDeg).toFixed(2)} 33 13)`);
          }

          if (rightFinRef.current) {
            rightFinRef.current.setAttribute('transform', `rotate(${finAngleDeg.toFixed(2)} 33 21)`);
          }
        } else {
          // Skimmer Net ("Penangkap Sampah") Physics inside Game Area
          if (netAnchorRef.current) {
            netAnchorRef.current.style.transform = `translate3d(${posX.toFixed(2)}px, ${posY.toFixed(2)}px, 0)`;
          }

          if (netRigRef.current) {
            const dragTilt = Math.max(-15, Math.min(15, -smoothedVx * 0.95));
            // Energetic scooping dip motion on click (dip down then lift forward)
            const scoopSwing = Math.sin(clickImpulse * Math.PI * 1.35) * -28;
            const scoopDipX = Math.sin(clickImpulse * Math.PI) * -4;
            const scoopDipY = Math.sin(clickImpulse * Math.PI) * 7;
            const netScale = (isHoveringInteractive ? 1.08 : 1) + Math.sin(clickImpulse * Math.PI) * 0.1;

            netRigRef.current.style.transform = `translate3d(${scoopDipX.toFixed(2)}px, ${scoopDipY.toFixed(2)}px, 0) rotate(${(dragTilt + scoopSwing).toFixed(2)}deg) scale(${netScale.toFixed(3)})`;
          }
        }
      }

      rafId = window.requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('blur', handleWindowBlur);

    rafId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('blur', handleWindowBlur);
      rootEl.classList.remove('fish-cursor-active');
      timersRef.current.forEach((t) => window.clearTimeout(t));
      timersRef.current = [];
    };
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
      aria-hidden="true"
    >
      {/* Click Water Ripples & Rising Air Bubbles */}
      {splashes.map((splash) => (
        <div
          key={splash.id}
          className="fixed w-0 h-0 pointer-events-none"
          style={{ left: splash.x, top: splash.y }}
        >
          {/* Expanding concentric ocean ripples */}
          <span
            className={`fish-cursor-ripple absolute left-0 top-0 rounded-full border ${
              splash.mode === 'net'
                ? 'w-10 h-10 border-[#82AAA1]/85'
                : 'w-7 h-7 border-[var(--accent-teal)]/75'
            }`}
          />
          <span className="fish-cursor-ripple absolute left-0 top-0 w-4 h-4 rounded-full border border-[var(--accent-sand)]/70 [animation-delay:80ms]" />

          {/* Rising mini bubbles */}
          <span className="fish-cursor-bubble fish-cursor-bubble-1 absolute -left-1 -top-1 w-2 h-2 rounded-full border border-[var(--accent-teal)]/85 bg-[var(--accent-teal)]/25" />
          <span className="fish-cursor-bubble fish-cursor-bubble-2 absolute left-0 -top-1 w-1.5 h-1.5 rounded-full border border-[var(--accent-sand)]/85 bg-[var(--accent-sand)]/25" />
          <span className="fish-cursor-bubble fish-cursor-bubble-3 absolute -left-0.5 -top-0.5 w-1.5 h-1.5 rounded-full bg-[var(--accent-teal)]/55" />
          <span className="fish-cursor-bubble fish-cursor-bubble-4 absolute left-1 top-0 w-1 h-1 rounded-full bg-[var(--accent-sand)]/65" />
        </div>
      ))}

      {/* MODE 1: Maritime Fish Cursor Rig (Snout anchored cleanly at 0,0) */}
      <div
        ref={fishAnchorRef}
        className="fixed left-0 top-0 w-0 h-0 opacity-0 will-change-transform transition-opacity duration-150"
      >
        <span
          ref={hoverRingRef}
          className="absolute left-0 top-0 w-3.5 h-3.5 rounded-full border border-[var(--accent-sand)]/85 bg-[var(--accent-teal)]/20 opacity-0 transition-[opacity,transform] duration-150"
        />

        <div
          ref={fishBodyRef}
          className="-ml-[48px] -mt-[17px] w-[54px] h-[34px] origin-[48px_17px] will-change-transform"
        >
          <svg
            viewBox="0 0 54 34"
            fill="none"
            className="w-full h-full overflow-visible drop-shadow-[0_3px_8px_rgba(6,17,22,0.28)]"
          >
            <defs>
              <linearGradient id="fishBodyGrad" x1="12" y1="17" x2="49" y2="17" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1D6664" />
                <stop offset="55%" stopColor="#367D7B" />
                <stop offset="100%" stopColor="#82AAA1" />
              </linearGradient>
              <linearGradient id="fishFinGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#82AAA1" stopOpacity="0.92" />
                <stop offset="100%" stopColor="#C7B99E" stopOpacity="0.72" />
              </linearGradient>
            </defs>

            <g ref={tailFinRef}>
              <path
                d="M19.5 17 C 14 14, 9 9.5, 4.5 7.5 C 7 12.5, 8.2 15, 9.8 17 C 8.2 19, 7 21.5, 4.5 26.5 C 9 24.5, 14 20, 19.5 17 Z"
                fill="url(#fishFinGrad)"
                stroke="var(--bg-canvas)"
                strokeWidth="1.05"
                strokeLinejoin="round"
              />
            </g>

            <g ref={leftFinRef}>
              <path
                d="M34 13 C 31.5 7, 25.5 4.8, 22 6.8 C 24.5 9.8, 27.5 12.2, 31 13.6 Z"
                fill="url(#fishFinGrad)"
                stroke="var(--bg-canvas)"
                strokeWidth="0.95"
                strokeLinejoin="round"
              />
            </g>
            <g ref={rightFinRef}>
              <path
                d="M34 21 C 31.5 27, 25.5 29.2, 22 27.2 C 24.5 24.2, 27.5 21.8, 31 20.4 Z"
                fill="url(#fishFinGrad)"
                stroke="var(--bg-canvas)"
                strokeWidth="0.95"
                strokeLinejoin="round"
              />
            </g>

            <path
              d="M48.5 17 C 45.2 11.4, 37.5 9.4, 28.5 11.8 C 23.5 13.2, 20.2 15.2, 18 16.3 L 18 17.7 C 20.2 18.8, 23.5 20.8, 28.5 22.2 C 37.5 24.6, 45.2 22.6, 48.5 17 Z"
              fill="url(#fishBodyGrad)"
              stroke="var(--bg-canvas)"
              strokeWidth="1.25"
              strokeLinejoin="round"
            />

            <path
              d="M22.5 17 C 28.5 16.4, 35.5 16.5, 42.5 17"
              stroke="#C7B99E"
              strokeOpacity="0.88"
              strokeWidth="1.35"
              strokeLinecap="round"
            />

            <path
              d="M38.2 12.6 C 36.8 14, 36.8 15.2, 37.8 16.1"
              stroke="var(--bg-canvas)"
              strokeOpacity="0.5"
              strokeWidth="0.9"
              strokeLinecap="round"
            />
            <path
              d="M38.2 21.4 C 36.8 20, 36.8 18.8, 37.8 17.9"
              stroke="var(--bg-canvas)"
              strokeOpacity="0.5"
              strokeWidth="0.9"
              strokeLinecap="round"
            />

            <circle cx="42.4" cy="14.2" r="1.25" fill="#061116" />
            <circle cx="42.75" cy="13.9" r="0.45" fill="#EDEBE3" />
            <circle cx="42.4" cy="19.8" r="1.25" fill="#061116" />
            <circle cx="42.75" cy="19.5" r="0.45" fill="#EDEBE3" />
          </svg>
        </div>
      </div>

      {/* MODE 2: Ocean Skimmer Net ("Penangkap Sampah") Cursor Rig inside Game Stage */}
      <div
        ref={netAnchorRef}
        className="fixed left-0 top-0 w-0 h-0 opacity-0 will-change-transform transition-opacity duration-150"
      >
        {/* Hover Capture Ring centered inside skimmer hoop */}
        <span
          ref={netHoverRingRef}
          className="absolute left-0 top-0 w-9 h-9 rounded-full border border-dashed border-[#C7B99E]/90 bg-[#82AAA1]/15 opacity-0 transition-[opacity,transform] duration-150"
        />

        {/* Skimmer Net SVG: Hoop center (24, 24) aligned directly at (0, 0) */}
        <div
          ref={netRigRef}
          className="-ml-[24px] -mt-[24px] w-[68px] h-[68px] origin-[24px_24px] will-change-transform"
        >
          <svg
            viewBox="0 0 68 68"
            fill="none"
            className="w-full h-full overflow-visible drop-shadow-[0_4px_10px_rgba(2,8,12,0.45)]"
          >
            <defs>
              <linearGradient id="skimmerRimGrad" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#EDEBE3" />
                <stop offset="55%" stopColor="#82AAA1" />
                <stop offset="100%" stopColor="#367D7B" />
              </linearGradient>
              <linearGradient id="skimmerHandleGrad" x1="36" y1="36" x2="62" y2="62" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#82AAA1" />
                <stop offset="45%" stopColor="#C7B99E" />
                <stop offset="100%" stopColor="#876B3A" />
              </linearGradient>
              <radialGradient id="skimmerMeshFill" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#82AAA1" stopOpacity="0.14" />
                <stop offset="75%" stopColor="#367D7B" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#17485A" stopOpacity="0.42" />
              </radialGradient>
            </defs>

            {/* Translucent Woven Net Pocket */}
            <ellipse cx="24" cy="24.5" rx="15.5" ry="15" fill="url(#skimmerMeshFill)" />
            <path
              d="M12 18 Q24 25 36 18 M10 24 Q24 31 38 24 M12 30 Q24 37 36 30"
              stroke="#EDEBE3"
              strokeOpacity="0.42"
              strokeWidth="0.9"
              strokeLinecap="round"
            />
            <path
              d="M18 11 Q24 24 18 37 M24 9.5 Q27 24 24 38.5 M30 11 Q25 24 30 37"
              stroke="#EDEBE3"
              strokeOpacity="0.42"
              strokeWidth="0.9"
              strokeLinecap="round"
            />

            {/* Handle Collar & Grip */}
            <path
              d="M36 36 L60 60"
              stroke="#061116"
              strokeOpacity="0.45"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M36 36 L60 60"
              stroke="url(#skimmerHandleGrad)"
              strokeWidth="4.2"
              strokeLinecap="round"
            />
            <path
              d="M48 48 L60 60"
              stroke="#367D7B"
              strokeWidth="4.8"
              strokeLinecap="round"
            />
            <circle cx="35.5" cy="35.5" r="2.6" fill="#C7B99E" stroke="#061116" strokeWidth="0.8" />

            {/* Crisp Skimmer Hoop Ring */}
            <circle
              cx="24"
              cy="24"
              r="16.2"
              stroke="#061116"
              strokeOpacity="0.35"
              strokeWidth="4.2"
            />
            <circle
              cx="24"
              cy="24"
              r="16.2"
              stroke="url(#skimmerRimGrad)"
              strokeWidth="2.6"
            />

            {/* Subtle Center Aim Crosshair Dot */}
            <circle cx="24" cy="24" r="1.6" fill="#EDEBE3" fillOpacity="0.85" />
          </svg>
        </div>
      </div>
    </div>
  );
};
