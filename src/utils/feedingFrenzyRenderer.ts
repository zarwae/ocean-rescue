import {
  PlayableFishConfig,
  PowerUpKind,
  SpeciesConfig,
  SpeciesId,
  StageConfig,
} from './feedingFrenzyData';

export interface RenderFishParams {
  x: number;
  y: number;
  radius: number;
  facing: 1 | -1;
  tilt: number;
  tailPhase: number;
  chompAmount: number; // 0..1
  lookAngle: number;
  isFrozen?: boolean;
  isChasing?: boolean;
  isFleeing?: boolean;
  isEdibleHighlight?: boolean;
  isDangerous?: boolean;
  pufferInflateProgress?: number; // 0..1
}

export interface RenderClamParams {
  x: number;
  y: number;
  radius: number;
  openProgress: number; // 0 (closed) .. 1 (open)
  isBlackPearl: boolean;
  pearlCollected: boolean;
  isWarningClose: boolean;
  timeSec: number;
}

export interface RenderPowerUpParams {
  x: number;
  y: number;
  radius: number;
  kind: PowerUpKind;
  timeSec: number;
}

export interface ParticleFX {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
  kind: 'bubble' | 'spark' | 'ring' | 'chomp';
}

export interface FloatingPopup {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  scale: number;
  life: number;
  maxLife: number;
}

/**
 * Draws the painterly backdrop image (cover-fit) plus animated underwater caustics,
 * sunbeams, and subtle foreground seabed flora silhouettes.
 */
export function drawStageBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  stage: StageConfig,
  backdropImg: HTMLImageElement | null,
  timeSec: number,
  isFrenzyActive: boolean,
  isFrozenActive: boolean,
  isDarkMode: boolean = true
) {
  // Base ocean gradient fallback (sunlit turquoise in light mode, deep pelagic in dark mode)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  if (isDarkMode) {
    bgGrad.addColorStop(0, stage.ambientTop);
    bgGrad.addColorStop(1, stage.ambientBottom);
  } else {
    bgGrad.addColorStop(0, '#9AD9D7');
    bgGrad.addColorStop(0.55, '#4A9E9F');
    bgGrad.addColorStop(1, '#1C5B66');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // High-detail generated ecosystem painting (cover aspect fit)
  if (backdropImg && backdropImg.complete && backdropImg.naturalWidth > 0) {
    const imgRatio = backdropImg.naturalWidth / backdropImg.naturalHeight;
    const canvasRatio = width / height;
    let drawW = width;
    let drawH = height;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      drawW = width;
      drawH = width / imgRatio;
      offsetY = (height - drawH) * 0.5;
    } else {
      drawH = height;
      drawW = height * imgRatio;
      offsetX = (width - drawW) * 0.5;
    }

    ctx.save();
    ctx.globalAlpha = isDarkMode ? 0.88 : 0.94;
    ctx.drawImage(backdropImg, offsetX, offsetY, drawW, drawH);
    ctx.restore();
  }

  // Depth vignette (airy sunlit coastal wash in light mode, rich abyssal depth in dark mode)
  const depthTint = ctx.createLinearGradient(0, 0, 0, height);
  if (isDarkMode) {
    depthTint.addColorStop(0, 'rgba(8, 30, 42, 0.16)');
    depthTint.addColorStop(0.55, 'rgba(6, 20, 29, 0.12)');
    depthTint.addColorStop(1, 'rgba(4, 13, 19, 0.42)');
  } else {
    depthTint.addColorStop(0, 'rgba(232, 251, 250, 0.22)');
    depthTint.addColorStop(0.55, 'rgba(130, 214, 210, 0.06)');
    depthTint.addColorStop(1, 'rgba(18, 74, 84, 0.18)');
  }
  ctx.fillStyle = depthTint;
  ctx.fillRect(0, 0, width, height);

  // Volumetric angled sunlight caustic shafts
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 5; i++) {
    const sway = Math.sin(timeSec * 0.55 + i * 1.4) * 28;
    const baseX = width * (0.12 + i * 0.19) + sway;
    const topW = 36 + (i % 2) * 18;
    const bottomW = 125 + (i % 3) * 32;

    const rayGrad = ctx.createLinearGradient(baseX, 0, baseX + 55, height * 0.82);
    rayGrad.addColorStop(0, isDarkMode ? stage.rayColor : 'rgba(255, 252, 232, 0.28)');
    rayGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = rayGrad;
    ctx.beginPath();
    ctx.moveTo(baseX - topW * 0.5, 0);
    ctx.lineTo(baseX + topW * 0.5, 0);
    ctx.lineTo(baseX + 75 + bottomW * 0.5, height * 0.88);
    ctx.lineTo(baseX + 75 - bottomW * 0.5, height * 0.88);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Gentle water surface shimmer ribbon along top edge
  ctx.save();
  const surfaceGrad = ctx.createLinearGradient(0, 0, 0, 26);
  surfaceGrad.addColorStop(0, isDarkMode ? 'rgba(175, 236, 232, 0.24)' : 'rgba(255, 255, 255, 0.42)');
  surfaceGrad.addColorStop(1, 'rgba(175, 236, 232, 0)');
  ctx.fillStyle = surfaceGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(width, 0);
  for (let x = width; x >= 0; x -= 40) {
    const waveY = 14 + Math.sin(x * 0.018 + timeSec * 2.1) * 4.5;
    ctx.lineTo(x, waveY);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Freeze Current cool frost vignette
  if (isFrozenActive) {
    const frostGrad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.5,
      width * 0.25,
      width * 0.5,
      height * 0.5,
      width * 0.65
    );
    frostGrad.addColorStop(0, 'rgba(140, 225, 255, 0)');
    frostGrad.addColorStop(1, 'rgba(130, 220, 255, 0.22)');
    ctx.fillStyle = frostGrad;
    ctx.fillRect(0, 0, width, height);
  }

  // Feeding Frenzy! golden-teal edge aura
  if (isFrenzyActive) {
    const pulse = 0.14 + Math.sin(timeSec * 8) * 0.06;
    const frenzyGrad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.5,
      width * 0.3,
      width * 0.5,
      height * 0.5,
      width * 0.65
    );
    frenzyGrad.addColorStop(0, 'rgba(240, 198, 105, 0)');
    frenzyGrad.addColorStop(1, `rgba(240, 198, 105, ${pulse.toFixed(3)})`);
    ctx.fillStyle = frenzyGrad;
    ctx.fillRect(0, 0, width, height);
  }
}

/**
 * Draws the player's playable character with multi-part articulated fins,
 * shimmering scales, opening jaw, expressive eye, and active power-up shields.
 */
export function drawPlayableFish(
  ctx: CanvasRenderingContext2D,
  hero: PlayableFishConfig,
  params: RenderFishParams & {
    isDashing: boolean;
    hasShield: boolean;
    hasMagnet: boolean;
    isFrenzy: boolean;
    isInvulnerable: boolean;
    timeSec: number;
  }
) {
  const {
    x,
    y,
    radius,
    facing,
    tilt,
    tailPhase,
    chompAmount,
    isDashing,
    hasShield,
    hasMagnet,
    isFrenzy,
    isInvulnerable,
    timeSec,
  } = params;

  ctx.save();
  ctx.translate(x, y);

  // Magnet radial aura waves
  if (hasMagnet) {
    const waveR = radius * (1.85 + ((timeSec * 1.4) % 1) * 1.2);
    ctx.save();
    ctx.strokeStyle = 'rgba(130, 220, 210, 0.32)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, waveR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Frenzy halo behind player fish
  if (isFrenzy) {
    const haloGrad = ctx.createRadialGradient(0, 0, radius * 0.4, 0, 0, radius * 1.75);
    haloGrad.addColorStop(0, 'rgba(246, 203, 101, 0.36)');
    haloGrad.addColorStop(1, 'rgba(246, 203, 101, 0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.75, 0, Math.PI * 2);
    ctx.fill();
  }

  // Invulnerability blink after taking damage or evolving
  if (isInvulnerable && Math.floor(timeSec * 14) % 2 === 0) {
    ctx.globalAlpha = 0.55;
  }

  ctx.scale(facing, 1);
  ctx.rotate(tilt);

  const len = hero.id === 'orville' ? radius * 1.65 : radius * 1.38;
  const h = hero.id === 'andy' ? radius * 1.02 : radius * 0.88;
  const tailWag = Math.sin(tailPhase) * (isDashing ? 0.42 : 0.24);
  const finFlutter = Math.sin(tailPhase * 0.85 + 0.8) * 0.22;

  // Dash speed streaks behind tail
  if (isDashing) {
    ctx.save();
    ctx.strokeStyle = 'rgba(220, 250, 248, 0.65)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(-len * 1.15, i * h * 0.34);
      ctx.lineTo(-len * 1.75 - Math.abs(i) * 8, i * h * 0.38);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 1. Articulated Caudal Tail Fin
  ctx.save();
  ctx.translate(-len * 0.72, 0);
  ctx.rotate(tailWag);
  const tailGrad = ctx.createLinearGradient(0, -h * 0.7, -len * 0.65, h * 0.7);
  tailGrad.addColorStop(0, hero.finColor);
  tailGrad.addColorStop(1, hero.secondaryColor);
  ctx.fillStyle = tailGrad;
  ctx.strokeStyle = 'rgba(6, 17, 22, 0.55)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  if (hero.id === 'orville') {
    // Broad whale fluke silhouette
    ctx.moveTo(4, -h * 0.14);
    ctx.quadraticCurveTo(-len * 0.28, -h * 0.72, -len * 0.58, -h * 0.62);
    ctx.quadraticCurveTo(-len * 0.35, -h * 0.15, -len * 0.32, 0);
    ctx.quadraticCurveTo(-len * 0.35, h * 0.15, -len * 0.58, h * 0.62);
    ctx.quadraticCurveTo(-len * 0.28, h * 0.72, 4, h * 0.14);
  } else {
    // Sweeping reef forked streamer tail
    ctx.moveTo(4, -h * 0.16);
    ctx.quadraticCurveTo(-len * 0.3, -h * 0.68, -len * 0.64, -h * 0.78);
    ctx.quadraticCurveTo(-len * 0.36, -h * 0.12, -len * 0.34, 0);
    ctx.quadraticCurveTo(-len * 0.36, h * 0.12, -len * 0.64, h * 0.78);
    ctx.quadraticCurveTo(-len * 0.3, h * 0.68, 4, h * 0.16);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 2. Sweeping Dorsal & Anal Streamer Fins
  ctx.save();
  ctx.fillStyle = hero.finColor;
  ctx.strokeStyle = 'rgba(6, 17, 22, 0.5)';
  ctx.lineWidth = 1.25;
  // Dorsal fin
  ctx.beginPath();
  if (hero.id === 'andy') {
    ctx.moveTo(len * 0.12, -h * 0.64);
    ctx.quadraticCurveTo(-len * 0.22, -h * 1.28, -len * 0.75, -h * 0.92);
    ctx.quadraticCurveTo(-len * 0.45, -h * 0.56, -len * 0.48, -h * 0.42);
  } else if (hero.id === 'orville') {
    ctx.moveTo(len * 0.08, -h * 0.64);
    ctx.quadraticCurveTo(-len * 0.12, -h * 1.32, -len * 0.34, -h * 1.22);
    ctx.quadraticCurveTo(-len * 0.22, -h * 0.8, -len * 0.32, -h * 0.52);
  } else {
    ctx.moveTo(len * 0.18, -h * 0.58);
    ctx.quadraticCurveTo(-len * 0.18, -h * 1.05, -len * 0.54, -h * 0.74);
    ctx.lineTo(-len * 0.45, -h * 0.42);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Ventral / Anal fin
  ctx.beginPath();
  ctx.moveTo(-len * 0.05, h * 0.62);
  ctx.quadraticCurveTo(-len * 0.32, h * 1.06, -len * 0.66, h * 0.78);
  ctx.quadraticCurveTo(-len * 0.44, h * 0.48, -len * 0.48, h * 0.36);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 3. Main Torso & Hinged Jaw
  const jawDrop = chompAmount * h * 0.36;
  const bodyGrad = ctx.createLinearGradient(0, -h * 0.85, 0, h * 0.85);
  bodyGrad.addColorStop(0, hero.primaryColor);
  bodyGrad.addColorStop(0.55, hero.primaryColor);
  bodyGrad.addColorStop(1, hero.bellyColor);

  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = '#07161E';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  // Snout upper lip -> crown -> tail peduncle
  ctx.moveTo(len * 0.88, -jawDrop * 0.22);
  ctx.bezierCurveTo(len * 0.72, -h * 0.86, -len * 0.12, -h * 0.96, -len * 0.72, -h * 0.2);
  ctx.lineTo(-len * 0.72, h * 0.2);
  // Underbelly back to lower jaw hinge
  ctx.bezierCurveTo(-len * 0.12, h * 0.96, len * 0.45, h * 0.86, len * 0.44, h * 0.28);
  // Inner open mouth cavity if chomping!
  if (chompAmount > 0.06) {
    // Draw lower jaw extending forward & down
    ctx.lineTo(len * 0.84, jawDrop * 0.95 + h * 0.1);
    ctx.lineTo(len * 0.38, h * 0.06);
  } else {
    ctx.quadraticCurveTo(len * 0.74, h * 0.34, len * 0.88, h * 0.04);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red mouth interior + subtle teeth glint when chomping
  if (chompAmount > 0.08) {
    ctx.save();
    ctx.fillStyle = '#8F2D36';
    ctx.beginPath();
    ctx.moveTo(len * 0.86, -jawDrop * 0.16);
    ctx.lineTo(len * 0.38, h * 0.06);
    ctx.lineTo(len * 0.82, jawDrop * 0.9 + h * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Species-specific surface markings
  ctx.save();
  if (hero.id === 'andy') {
    // Golden-ivory angelfish vertical reef bands
    ctx.fillStyle = hero.secondaryColor;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.ellipse(len * 0.12, 0, len * 0.075, h * 0.62, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = hero.bellyColor;
    ctx.beginPath();
    ctx.ellipse(-len * 0.22, 0, len * 0.065, h * 0.56, -0.08, 0, Math.PI * 2);
    ctx.fill();
  } else if (hero.id === 'orville') {
    // Classic Orca white eye patch & saddle markings
    ctx.fillStyle = '#F7F9FA';
    ctx.beginPath();
    ctx.ellipse(len * 0.26, -h * 0.22, len * 0.15, h * 0.13, -0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.ellipse(-len * 0.16, -h * 0.3, len * 0.18, h * 0.2, -0.35, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Kuro gold-vermilion scale shimmer arcs
    ctx.strokeStyle = hero.secondaryColor;
    ctx.lineWidth = 1.4;
    ctx.globalAlpha = 0.65;
    for (let s = -1; s <= 1; s++) {
      ctx.beginPath();
      ctx.arc(len * (s * 0.16), -h * 0.06, radius * 0.26, -0.9, 0.9);
      ctx.stroke();
    }
  }
  ctx.restore();

  // Subtle curved gill plate
  ctx.save();
  ctx.strokeStyle = 'rgba(7, 22, 30, 0.48)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(len * 0.26, h * 0.02, h * 0.34, Math.PI * 0.68, Math.PI * 1.28);
  ctx.stroke();
  ctx.restore();

  // 4. Articulated Pectoral Fin (flutters as player swims)
  ctx.save();
  ctx.translate(len * 0.14, h * 0.16);
  ctx.rotate(finFlutter);
  ctx.fillStyle = hero.finColor;
  ctx.strokeStyle = 'rgba(7, 22, 30, 0.55)';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-len * 0.28, h * 0.35, -len * 0.34, h * 0.06);
  ctx.quadraticCurveTo(-len * 0.18, -h * 0.12, 0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 5. Glossy Expressive Eye
  const eyeX = len * 0.52;
  const eyeY = -h * 0.22;
  const eyeR = Math.max(3.6, radius * 0.19);
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#061116';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, eyeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pupil tracking slightly forward
  ctx.fillStyle = '#07131A';
  ctx.beginPath();
  ctx.arc(eyeX + eyeR * 0.26, eyeY, eyeR * 0.52, 0, Math.PI * 2);
  ctx.fill();

  // Crisp eye catchlight
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(eyeX + eyeR * 0.42, eyeY - eyeR * 0.28, eyeR * 0.22, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // 6. Iridescent Bubble Shield around entire player
  if (hasShield) {
    ctx.save();
    ctx.translate(x, y);
    const shieldR = radius * 1.65;
    const shieldGrad = ctx.createRadialGradient(-shieldR * 0.3, -shieldR * 0.3, shieldR * 0.2, 0, 0, shieldR);
    shieldGrad.addColorStop(0, 'rgba(210, 250, 255, 0.06)');
    shieldGrad.addColorStop(0.75, 'rgba(130, 220, 210, 0.22)');
    shieldGrad.addColorStop(1, 'rgba(200, 250, 255, 0.65)');
    ctx.fillStyle = shieldGrad;
    ctx.strokeStyle = 'rgba(220, 255, 252, 0.78)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, shieldR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Specular bubble arc highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, 0, shieldR * 0.84, -Math.PI * 0.82, -Math.PI * 0.46);
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Draws any AI marine species with species-specific anatomy, markings, articulated jaw/fins,
 * pufferfish inflation spines, jellyfish bell/tentacles, or chained sea mines.
 */
export function drawSpeciesEntity(
  ctx: CanvasRenderingContext2D,
  species: SpeciesConfig,
  params: RenderFishParams & { timeSec: number }
) {
  if (species.id === 'jellyfish') {
    drawJellyfish(ctx, species, params);
    return;
  }
  if (species.id === 'sea_mine') {
    drawSeaMine(ctx, species, params);
    return;
  }

  const {
    x,
    y,
    radius,
    facing,
    tilt,
    tailPhase,
    chompAmount,
    isFrozen,
    isChasing,
    isFleeing,
    isEdibleHighlight,
    isDangerous,
    pufferInflateProgress = 0,
    timeSec,
  } = params;

  ctx.save();
  ctx.translate(x, y);

  // Subtle glow ring if Magnet is actively pulling this edible fish
  if (isEdibleHighlight) {
    ctx.save();
    ctx.strokeStyle = 'rgba(130, 220, 200, 0.48)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Danger Warning badge (!) above chasing predators (non-hue-only affordance!)
  if (isDangerous && isChasing) {
    const bob = Math.sin(timeSec * 12) * 2.5;
    ctx.save();
    ctx.translate(0, -radius * 1.15 + bob);
    ctx.fillStyle = '#D96D56';
    ctx.strokeStyle = '#061116';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FFFDF7';
    ctx.font = '700 12px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', 0, 0.5);
    ctx.restore();
  }

  // Panic sweat/bubble glyph when tiny prey is fleeing
  if (isFleeing) {
    ctx.save();
    ctx.fillStyle = 'rgba(235, 248, 250, 0.72)';
    ctx.beginPath();
    ctx.arc(-facing * radius * 0.9, -radius * 0.65, 2.3, 0, Math.PI * 2);
    ctx.arc(-facing * radius * 1.15, -radius * 0.9, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.scale(facing, 1);
  ctx.rotate(tilt);

  const inflateScale = species.id === 'pufferfish' ? 1 + pufferInflateProgress * 0.55 : 1;
  const rx = radius * (species.aspectRatio * 0.68) * (species.id === 'pufferfish' ? 1 + pufferInflateProgress * 0.22 : 1);
  const ry = radius * 0.85 * inflateScale;
  const tailWag = Math.sin(tailPhase) * (isChasing || isFleeing ? 0.36 : 0.2);
  const finFlutter = Math.sin(tailPhase * 0.9 + 0.5) * 0.2;

  // Pufferfish radial defensive spikes when inflating!
  if (species.id === 'pufferfish' && pufferInflateProgress > 0.12) {
    ctx.save();
    const spikeLen = radius * 0.42 * pufferInflateProgress;
    ctx.fillStyle = '#EDE0BC';
    ctx.strokeStyle = '#4B3A18';
    ctx.lineWidth = 1.1;
    const spikes = 12;
    for (let i = 0; i < spikes; i++) {
      const a = (i / spikes) * Math.PI * 2;
      const sx = Math.cos(a) * rx * 0.92;
      const sy = Math.sin(a) * ry * 0.92;
      const tx = Math.cos(a) * (rx * 0.92 + spikeLen);
      const ty = Math.sin(a) * (ry * 0.92 + spikeLen);
      ctx.beginPath();
      ctx.moveTo(sx - Math.sin(a) * 3.5, sy + Math.cos(a) * 3.5);
      ctx.lineTo(tx, ty);
      ctx.lineTo(sx + Math.sin(a) * 3.5, sy - Math.cos(a) * 3.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  // 1. Tail Fin
  ctx.save();
  ctx.translate(-rx * 0.82, 0);
  ctx.rotate(tailWag);
  ctx.fillStyle = isFrozen ? '#A8DCEB' : species.finColor;
  ctx.strokeStyle = 'rgba(6, 17, 22, 0.55)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  if (species.tailStyle === 'crescent') {
    ctx.moveTo(2, -ry * 0.14);
    ctx.quadraticCurveTo(-rx * 0.28, -ry * 0.82, -rx * 0.58, -ry * 0.78);
    ctx.quadraticCurveTo(-rx * 0.25, 0, -rx * 0.24, 0);
    ctx.quadraticCurveTo(-rx * 0.25, 0, -rx * 0.58, ry * 0.78);
    ctx.quadraticCurveTo(-rx * 0.28, ry * 0.82, 2, ry * 0.14);
  } else if (species.tailStyle === 'fan') {
    ctx.moveTo(2, -ry * 0.18);
    ctx.quadraticCurveTo(-rx * 0.48, -ry * 0.65, -rx * 0.52, 0);
    ctx.quadraticCurveTo(-rx * 0.48, ry * 0.65, 2, ry * 0.18);
  } else {
    ctx.moveTo(2, -ry * 0.15);
    ctx.lineTo(-rx * 0.52, -ry * 0.65);
    ctx.lineTo(-rx * 0.28, 0);
    ctx.lineTo(-rx * 0.52, ry * 0.65);
    ctx.lineTo(2, ry * 0.15);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 2. Dorsal Fin (species specific: shark fin, lionfish plumes, etc.)
  ctx.save();
  ctx.fillStyle = isFrozen ? '#9CD2E3' : species.finColor;
  ctx.strokeStyle = 'rgba(6, 17, 22, 0.5)';
  ctx.lineWidth = 1.1;
  if (species.pattern === 'lion') {
    // Lionfish venomous dorsal ray plumes
    for (let r = 0; r < 5; r++) {
      const bx = rx * (0.25 - r * 0.18);
      const angle = -0.35 - r * 0.18;
      ctx.beginPath();
      ctx.moveTo(bx, -ry * 0.65);
      ctx.lineTo(bx + Math.sin(angle) * ry * 0.85, -ry * 0.65 - Math.cos(angle) * ry * 0.82);
      ctx.lineTo(bx - rx * 0.1, -ry * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  } else if (species.pattern === 'shark') {
    ctx.beginPath();
    ctx.moveTo(rx * 0.14, -ry * 0.72);
    ctx.quadraticCurveTo(-rx * 0.08, -ry * 1.55, -rx * 0.34, -ry * 1.38);
    ctx.quadraticCurveTo(-rx * 0.18, -ry * 0.88, -rx * 0.28, -ry * 0.65);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(rx * 0.16, -ry * 0.68);
    ctx.quadraticCurveTo(-rx * 0.12, -ry * 1.18, -rx * 0.45, -ry * 0.8);
    ctx.lineTo(-rx * 0.38, -ry * 0.48);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  // 3. Body Silhouette (Swordfish rostrum, shark torpedo, or plump reef body)
  const jawOpen = chompAmount * ry * 0.38;
  const bodyGrad = ctx.createLinearGradient(0, -ry, 0, ry);
  bodyGrad.addColorStop(0, isFrozen ? '#9BD6E8' : species.primaryColor);
  bodyGrad.addColorStop(0.62, isFrozen ? '#BCE6F2' : species.primaryColor);
  bodyGrad.addColorStop(1, isFrozen ? '#E6F8FC' : species.bellyColor);

  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = '#061116';
  ctx.lineWidth = species.tier >= 3 ? 1.6 : 1.25;

  ctx.beginPath();
  const snoutX = species.id === 'swordfish' ? rx * 1.48 : rx * 0.96;
  ctx.moveTo(snoutX, -jawOpen * 0.18);
  if (species.id === 'swordfish') {
    ctx.lineTo(rx * 0.86, -ry * 0.28);
  }
  ctx.bezierCurveTo(rx * 0.65, -ry * 1.05, -rx * 0.25, -ry * 1.05, -rx * 0.84, -ry * 0.22);
  ctx.lineTo(-rx * 0.84, ry * 0.22);
  ctx.bezierCurveTo(-rx * 0.25, ry * 1.05, rx * 0.42, ry * 0.95, rx * 0.48, ry * 0.34);

  if (chompAmount > 0.08) {
    ctx.lineTo(rx * 0.88, jawOpen + ry * 0.16);
    ctx.lineTo(rx * 0.42, ry * 0.08);
  } else {
    ctx.quadraticCurveTo(rx * 0.78, ry * 0.4, species.id === 'swordfish' ? rx * 0.88 : snoutX, ry * 0.06);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Jagged shark/barracuda teeth when chasing or chomping!
  if ((species.pattern === 'shark' || species.id === 'barracuda') && chompAmount > 0.12) {
    ctx.save();
    ctx.fillStyle = '#8A2532';
    ctx.beginPath();
    ctx.moveTo(rx * 0.9, -jawOpen * 0.12);
    ctx.lineTo(rx * 0.42, ry * 0.08);
    ctx.lineTo(rx * 0.85, jawOpen + ry * 0.12);
    ctx.closePath();
    ctx.fill();

    // Sharp white teeth
    ctx.fillStyle = '#FFFFFF';
    for (let t = 0; t < 4; t++) {
      const tx = rx * (0.48 + t * 0.09);
      ctx.beginPath();
      ctx.moveTo(tx, -jawOpen * 0.04);
      ctx.lineTo(tx + 2.5, ry * 0.14);
      ctx.lineTo(tx + 5, -jawOpen * 0.04);
      ctx.fill();
    }
    ctx.restore();
  }

  // 4. Species-specific stripes / spots / bioluminescent photophores / gill slits
  ctx.save();
  if (species.pattern === 'clown') {
    ctx.fillStyle = species.secondaryColor;
    ctx.strokeStyle = '#0D1317';
    ctx.lineWidth = 1.1;
    [0.32, -0.15].forEach((offset) => {
      ctx.beginPath();
      ctx.ellipse(rx * offset, 0, rx * 0.11, ry * 0.74, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  } else if (species.pattern === 'stripes' || species.pattern === 'lion') {
    ctx.fillStyle = species.secondaryColor;
    ctx.globalAlpha = 0.75;
    [0.38, 0.06, -0.26].forEach((offset) => {
      ctx.beginPath();
      ctx.ellipse(rx * offset, 0, rx * 0.065, ry * 0.65, 0.12, 0, Math.PI * 2);
      ctx.fill();
    });
    if (species.id === 'butterflyfish') {
      // Signature false-eye spot near tail
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = '#18242C';
      ctx.beginPath();
      ctx.arc(-rx * 0.45, -ry * 0.18, Math.max(2.5, radius * 0.14), 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFF9DF';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  } else if (species.pattern === 'tiger') {
    ctx.strokeStyle = species.secondaryColor;
    ctx.lineWidth = 1.6;
    ctx.globalAlpha = 0.65;
    for (let b = -2; b <= 2; b++) {
      ctx.beginPath();
      ctx.moveTo(rx * b * 0.18, -ry * 0.58);
      ctx.lineTo(rx * b * 0.18 - rx * 0.06, ry * 0.05);
      ctx.stroke();
    }
  } else if (species.pattern === 'spots' || species.pattern === 'puffer') {
    ctx.fillStyle = species.secondaryColor;
    ctx.globalAlpha = 0.55;
    [
      [-0.1, -0.25],
      [-0.32, 0.08],
      [0.12, -0.18],
      [-0.22, -0.34],
    ].forEach(([sx, sy]) => {
      ctx.beginPath();
      ctx.arc(rx * sx, ry * sy, Math.max(1.8, radius * 0.11), 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (species.pattern === 'glow') {
    // Lanternfish bioluminescent belly photophores
    ctx.fillStyle = species.secondaryColor;
    for (let g = -2; g <= 2; g++) {
      ctx.beginPath();
      ctx.arc(rx * (g * 0.18), ry * 0.42, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (species.pattern === 'shark') {
    // 4 curved shark gill slits
    ctx.strokeStyle = 'rgba(10, 20, 26, 0.65)';
    ctx.lineWidth = 1.4;
    for (let g = 0; g < 4; g++) {
      const gx = rx * (0.28 - g * 0.08);
      ctx.beginPath();
      ctx.arc(gx, 0, ry * 0.34, Math.PI * 0.72, Math.PI * 1.25);
      ctx.stroke();
    }
  }
  ctx.restore();

  // Pectoral fin
  ctx.save();
  ctx.translate(rx * 0.14, ry * 0.2);
  ctx.rotate(finFlutter);
  ctx.fillStyle = isFrozen ? '#A8DCEB' : species.finColor;
  ctx.strokeStyle = 'rgba(6, 17, 22, 0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-rx * 0.28, ry * 0.42, -rx * 0.34, ry * 0.08);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Hammerhead cephalofoil crest cue
  if (species.id === 'hammerhead') {
    ctx.fillStyle = species.primaryColor;
    ctx.strokeStyle = '#061116';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.roundRect(rx * 0.62, -ry * 0.66, rx * 0.24, ry * 1.32, 5);
    ctx.fill();
    ctx.stroke();
  }

  // Expressive Eye
  const eyeX = species.id === 'hammerhead' ? rx * 0.72 : rx * 0.54;
  const eyeY = species.id === 'hammerhead' ? -ry * 0.52 : -ry * 0.22;
  const eyeR = Math.max(2.6, radius * 0.18);
  ctx.fillStyle = isChasing && isDangerous ? '#FFE4DC' : '#FFFFFF';
  ctx.strokeStyle = '#061116';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, eyeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isChasing && isDangerous ? '#9B1D1D' : '#061116';
  ctx.beginPath();
  ctx.arc(eyeX + eyeR * 0.24, eyeY, eyeR * 0.52, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(eyeX + eyeR * 0.38, eyeY - eyeR * 0.25, eyeR * 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawJellyfish(
  ctx: CanvasRenderingContext2D,
  species: SpeciesConfig,
  params: RenderFishParams & { timeSec: number }
) {
  const { x, y, radius, timeSec } = params;
  const pulse = Math.sin(timeSec * 3.4 + x * 0.02);
  const bellW = radius * (1.05 + pulse * 0.1);
  const bellH = radius * (0.78 - pulse * 0.08);

  ctx.save();
  ctx.translate(x, y);

  // Soft bioluminescent halo
  const glow = ctx.createRadialGradient(0, -bellH * 0.2, 2, 0, 0, radius * 1.7);
  glow.addColorStop(0, 'rgba(225, 145, 210, 0.36)');
  glow.addColorStop(1, 'rgba(225, 145, 210, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 1.7, 0, Math.PI * 2);
  ctx.fill();

  // 6 Undulating stinging tentacles
  ctx.lineCap = 'round';
  for (let i = -2; i <= 2; i++) {
    const startX = i * (bellW * 0.28);
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(235, 165, 220, 0.82)' : 'rgba(145, 232, 245, 0.78)';
    ctx.lineWidth = i % 2 === 0 ? 2.2 : 1.6;
    ctx.beginPath();
    ctx.moveTo(startX, bellH * 0.2);
    const wave1 = Math.sin(timeSec * 4.5 + i + y * 0.03) * 8;
    const wave2 = Math.cos(timeSec * 3.8 + i * 1.4) * 10;
    ctx.bezierCurveTo(
      startX + wave1,
      bellH * 0.85,
      startX - wave2,
      radius * 1.45,
      startX + wave1 * 0.7,
      radius * 1.95
    );
    ctx.stroke();
  }

  // Translucent dome bell
  const bellGrad = ctx.createRadialGradient(-bellW * 0.2, -bellH * 0.55, 2, 0, -bellH * 0.2, bellW);
  bellGrad.addColorStop(0, '#FCE3F5');
  bellGrad.addColorStop(0.55, species.primaryColor);
  bellGrad.addColorStop(1, 'rgba(130, 88, 155, 0.88)');

  ctx.fillStyle = bellGrad;
  ctx.strokeStyle = 'rgba(255, 225, 248, 0.85)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-bellW, bellH * 0.25);
  ctx.bezierCurveTo(-bellW * 1.05, -bellH * 1.05, bellW * 1.05, -bellH * 1.05, bellW, bellH * 0.25);
  ctx.quadraticCurveTo(bellW * 0.45, bellH * 0.45, 0, bellH * 0.22);
  ctx.quadraticCurveTo(-bellW * 0.45, bellH * 0.45, -bellW, bellH * 0.25);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawSeaMine(
  ctx: CanvasRenderingContext2D,
  species: SpeciesConfig,
  params: RenderFishParams & { timeSec: number }
) {
  const { x, y, radius, timeSec } = params;
  const swayAngle = Math.sin(timeSec * 1.4 + x * 0.01) * 0.08;

  ctx.save();
  ctx.translate(x, y);

  // Subtle anchor chain descending downward
  ctx.strokeStyle = 'rgba(135, 155, 165, 0.55)';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(0, radius * 0.9);
  ctx.lineTo(Math.sin(timeSec) * 6, radius * 3.4);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.rotate(swayAngle);

  // 8 Detonation spikes
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const tipX = Math.cos(a) * radius * 1.32;
    const tipY = Math.sin(a) * radius * 1.32;
    ctx.strokeStyle = '#1E282E';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * radius * 0.72, Math.sin(a) * radius * 0.72);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();

    ctx.fillStyle = i % 2 === 0 && Math.sin(timeSec * 5) > 0 ? '#E8735A' : '#708490';
    ctx.beginPath();
    ctx.arc(tipX, tipY, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Iron sphere body
  const mineGrad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.35, 3, 0, 0, radius);
  mineGrad.addColorStop(0, '#6F828D');
  mineGrad.addColorStop(0.65, species.primaryColor);
  mineGrad.addColorStop(1, '#1A2226');

  ctx.fillStyle = mineGrad;
  ctx.strokeStyle = '#091014';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.88, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Blinking warning diode
  const blink = Math.sin(timeSec * 6) > 0;
  ctx.fillStyle = blink ? '#FF7B5C' : '#6A2D22';
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.24, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draws the seabed Giant Oyster Clam with glowing White or Black Pearl inside.
 */
export function drawGiantClam(ctx: CanvasRenderingContext2D, clam: RenderClamParams) {
  const { x, y, radius, openProgress, isBlackPearl, pearlCollected, isWarningClose, timeSec } = clam;
  const trembleX = isWarningClose ? Math.sin(timeSec * 45) * 3 : 0;

  ctx.save();
  ctx.translate(x + trembleX, y);

  // Soft seabed shadow
  ctx.fillStyle = 'rgba(4, 12, 16, 0.45)';
  ctx.beginPath();
  ctx.ellipse(0, radius * 0.45, radius * 1.2, radius * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bottom shell
  const shellGrad = ctx.createLinearGradient(0, -radius * 0.2, 0, radius * 0.55);
  shellGrad.addColorStop(0, '#C7A9B8');
  shellGrad.addColorStop(1, '#685060');
  ctx.fillStyle = shellGrad;
  ctx.strokeStyle = '#2A1E28';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, radius * 0.18, radius * 1.12, radius * 0.42, 0, 0, Math.PI);
  ctx.lineTo(-radius * 1.12, radius * 0.18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Pearlescent pink-cream inner mantle
  if (openProgress > 0.15) {
    ctx.fillStyle = '#E89EB0';
    ctx.beginPath();
    ctx.ellipse(0, radius * 0.14, radius * 0.88, radius * 0.22 * openProgress, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Pearl inside when open & uncollected!
  if (openProgress > 0.3 && !pearlCollected) {
    const py = -radius * 0.12 * openProgress;
    const pr = radius * 0.28 * Math.min(1, openProgress * 1.15);

    // Radiant aura
    const glow = ctx.createRadialGradient(0, py, 2, 0, py, pr * 2.5);
    glow.addColorStop(0, isBlackPearl ? 'rgba(180, 145, 255, 0.65)' : 'rgba(255, 248, 215, 0.72)');
    glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, py, pr * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Pearl sphere
    const pGrad = ctx.createRadialGradient(-pr * 0.3, py - pr * 0.3, 1, 0, py, pr);
    if (isBlackPearl) {
      pGrad.addColorStop(0, '#D4C2FF');
      pGrad.addColorStop(0.55, '#3E2E5C');
      pGrad.addColorStop(1, '#140E21');
    } else {
      pGrad.addColorStop(0, '#FFFFFF');
      pGrad.addColorStop(0.65, '#EFE7D4');
      pGrad.addColorStop(1, '#BFB096');
    }
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.arc(0, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Hinged top shell lifting upward by openProgress
  ctx.save();
  const hingeY = radius * 0.15;
  ctx.translate(0, hingeY);
  const topScaleY = 1 - openProgress * 0.75;
  const topOffsetY = -openProgress * radius * 0.58;

  const topGrad = ctx.createLinearGradient(0, topOffsetY - radius * 0.65, 0, 0);
  topGrad.addColorStop(0, '#E3CAD6');
  topGrad.addColorStop(1, '#7D6073');
  ctx.fillStyle = topGrad;
  ctx.strokeStyle = '#2A1E28';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, topOffsetY, radius * 1.12, Math.max(8, radius * 0.56 * topScaleY), 0, Math.PI, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Shell ribs
  ctx.strokeStyle = 'rgba(42, 30, 40, 0.35)';
  ctx.lineWidth = 1.1;
  for (let r = -2; r <= 2; r++) {
    ctx.beginPath();
    ctx.moveTo(0, topOffsetY + 2);
    ctx.lineTo(r * radius * 0.32, topOffsetY - Math.max(6, radius * 0.48 * topScaleY));
    ctx.stroke();
  }
  ctx.restore();

  ctx.restore();
}

/**
 * Draws Power-up, Star Bonus, and +Time collectible bubbles.
 */
export function drawBubbleCollectible(ctx: CanvasRenderingContext2D, item: RenderPowerUpParams) {
  const { x, y, radius, kind, timeSec } = item;
  const bob = Math.sin(timeSec * 3.2 + x * 0.03) * 3;

  const palette: Record<PowerUpKind, { tint: string; label: string }> = {
    speed: { tint: '#F6C95E', label: '⚡' },
    magnet: { tint: '#79E6D8', label: 'U' },
    shield: { tint: '#8CC9FF', label: '◆' },
    freeze: { tint: '#BBE9FF', label: '❄' },
    star: { tint: '#F5DA78', label: '★' },
    time: { tint: '#9AF0C2', label: '+5s' },
  };

  const { tint, label } = palette[kind];

  ctx.save();
  ctx.translate(x, y + bob);

  // Outer bubble sheen
  const bGrad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, 2, 0, 0, radius);
  bGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
  bGrad.addColorStop(0.6, 'rgba(130, 210, 220, 0.16)');
  bGrad.addColorStop(1, tint);

  ctx.fillStyle = bGrad;
  ctx.strokeStyle = tint;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Inner icon / symbol
  ctx.fillStyle = '#FFFFFF';
  ctx.font = kind === 'time' ? '700 11px "DM Sans", sans-serif' : '700 14px "DM Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 0, 1);

  // Specular bubble highlight dot
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.arc(-radius * 0.38, -radius * 0.38, radius * 0.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
