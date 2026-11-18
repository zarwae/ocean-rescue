import {
  FischIsland,
  FischRod,
  FischSpecies,
  FischTimeOfDay,
  FischWeather,
  RARITY_COLORS,
} from './fischData';

export type FischPhase = 'idle' | 'charging' | 'casting' | 'waiting' | 'biting' | 'reeling';

export interface FischRenderFrame {
  width: number;
  height: number;
  timeSec: number;
  isDarkMode: boolean;
  island: FischIsland;
  rod: FischRod;
  timeOfDay: FischTimeOfDay;
  weather: FischWeather;
  auroraActive: boolean;
  phase: FischPhase;
  castPower: number; // 0..1
  bobberProgress: number; // 0..1 animation during cast
  bobberWaveOffset: number;
  shakeCount: number;
  reelBarCenter: number; // 0..1
  reelBarWidth: number; // 0.14..0.58
  reelFishPos: number; // 0..1
  reelProgress: number; // 0..1
  reelOnTarget: boolean;
  hookedSpecies: FischSpecies | null;
  ambientFish: Array<{ x: number; y: number; size: number; speed: number; dir: 1 | -1; color: string }>;
  splashes: Array<{ x: number; y: number; age: number; maxAge: number }>;
}

export function drawFischScene(ctx: CanvasRenderingContext2D, frame: FischRenderFrame): void {
  const { width, height, timeSec, isDarkMode, island, timeOfDay, weather, auroraActive } = frame;
  const horizonY = height * 0.56;

  // 1. Sky Gradient (Light vs Dark + Day vs Night)
  const isNight = timeOfDay === 'Night';
  const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
  if (isNight || isDarkMode) {
    skyGrad.addColorStop(0, isNight ? '#040914' : island.skyTopDark);
    skyGrad.addColorStop(1, isNight ? '#0E2236' : island.skyBottomDark);
  } else {
    skyGrad.addColorStop(0, island.skyTopLight);
    skyGrad.addColorStop(1, island.skyBottomLight);
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, horizonY + 2);

  // Stars at Night or Dark Mode
  if (isNight || isDarkMode) {
    ctx.save();
    for (let i = 0; i < 36; i += 1) {
      const sx = ((i * 197) % 100) / 100 * width;
      const sy = ((i * 89) % 100) / 100 * (horizonY * 0.78);
      const twinkle = 0.25 + 0.55 * Math.abs(Math.sin(timeSec * 1.4 + i));
      ctx.fillStyle = `rgba(237, 235, 227, ${isNight ? twinkle : twinkle * 0.35})`;
      ctx.beginPath();
      ctx.arc(sx, sy, (i % 3 === 0 ? 1.5 : 0.9), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Sun or Moon Celestial Body
  const celX = width * 0.78;
  const celY = height * 0.18;
  ctx.save();
  if (isNight) {
    ctx.fillStyle = 'rgba(237, 235, 227, 0.92)';
    ctx.shadowColor = 'rgba(168, 245, 227, 0.45)';
    ctx.shadowBlur = 22;
    ctx.beginPath();
    ctx.arc(celX, celY, 22, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = isDarkMode ? 'rgba(246, 196, 83, 0.86)' : 'rgba(255, 242, 184, 0.96)';
    ctx.shadowColor = 'rgba(246, 196, 83, 0.5)';
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(celX, celY, 24, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Aurora Borealis Ribbon
  if (auroraActive || weather === 'Aurora') {
    ctx.save();
    for (let band = 0; band < 3; band += 1) {
      const grad = ctx.createLinearGradient(0, 20, width, horizonY * 0.7);
      grad.addColorStop(0, 'rgba(86, 240, 181, 0.05)');
      grad.addColorStop(0.5, band % 2 === 0 ? 'rgba(86, 240, 181, 0.34)' : 'rgba(130, 170, 245, 0.28)');
      grad.addColorStop(1, 'rgba(183, 148, 244, 0.06)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 18 - band * 4;
      ctx.beginPath();
      for (let x = 0; x <= width; x += 24) {
        const y =
          horizonY * (0.28 + band * 0.11) +
          Math.sin(x * 0.008 + timeSec * 0.7 + band) * 18 +
          Math.cos(x * 0.015 - timeSec * 0.4) * 9;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // 2. Island Landmark Silhouettes on Horizon
  drawIslandSilhouette(ctx, island, width, horizonY, isDarkMode, isNight, timeSec);

  // 3. Water Body Gradient
  const waterGrad = ctx.createLinearGradient(0, horizonY, 0, height);
  if (isDarkMode || isNight) {
    waterGrad.addColorStop(0, island.waterTopDark);
    waterGrad.addColorStop(1, island.waterBottomDark);
  } else {
    waterGrad.addColorStop(0, island.waterTopLight);
    waterGrad.addColorStop(1, island.waterBottomLight);
  }
  ctx.fillStyle = waterGrad;
  ctx.fillRect(0, horizonY, width, height - horizonY);

  // Animated underwater fish silhouettes swimming passively
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, horizonY + 8, width, height - horizonY - 8);
  ctx.clip();

  for (const fish of frame.ambientFish) {
    const fx = fish.x * width;
    const fy = horizonY + 26 + fish.y * (height - horizonY - 46);
    ctx.save();
    ctx.translate(fx, fy);
    ctx.scale(fish.dir, 1);
    ctx.fillStyle = fish.color;
    ctx.globalAlpha = isDarkMode ? 0.32 : 0.26;
    ctx.beginPath();
    ctx.ellipse(0, 0, fish.size * 1.1, fish.size * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-fish.size * 0.9, 0);
    ctx.lineTo(-fish.size * 1.45, -fish.size * 0.42);
    ctx.lineTo(-fish.size * 1.45, fish.size * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  // Animated Water Surface Shimmer & Wave Crest
  ctx.save();
  ctx.strokeStyle = island.id === 'roslit_volcano'
    ? 'rgba(255, 194, 102, 0.55)'
    : isDarkMode
    ? 'rgba(130, 170, 161, 0.45)'
    : 'rgba(255, 255, 255, 0.65)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= width; x += 12) {
    const wave = Math.sin(x * 0.025 + timeSec * 2.1) * 3.2 + Math.cos(x * 0.045 - timeSec * 1.3) * 1.6;
    if (x === 0) ctx.moveTo(x, horizonY + wave);
    else ctx.lineTo(x, horizonY + wave);
  }
  ctx.stroke();

  // Secondary caustic sheen lines
  ctx.strokeStyle = isDarkMode ? 'rgba(168, 245, 227, 0.14)' : 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1.2;
  for (let r = 0; r < 3; r += 1) {
    const ry = horizonY + 18 + r * 26;
    ctx.beginPath();
    for (let x = 20; x < width - 20; x += 64) {
      const seg = 22 + Math.sin(timeSec * 1.5 + x * 0.02 + r) * 8;
      ctx.moveTo(x, ry + Math.sin(timeSec + r + x) * 1.8);
      ctx.lineTo(x + seg, ry + Math.sin(timeSec + r + x) * 1.8);
    }
    ctx.stroke();
  }
  ctx.restore();

  // 4. Wooden Pier & Angler + Equipped Rod
  const dockRightX = Math.min(width * 0.24, 210);
  const dockTopY = horizonY - 14;
  drawPierAndAngler(ctx, dockRightX, dockTopY, height, frame);

  // 5. Weather Overlays (Rain, Storm, Foggy)
  if (weather === 'Rain' || weather === 'Storm') {
    ctx.save();
    ctx.strokeStyle = isDarkMode ? 'rgba(180, 220, 235, 0.28)' : 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.2;
    const drops = weather === 'Storm' ? 52 : 30;
    for (let i = 0; i < drops; i += 1) {
      const rx = ((i * 73 + timeSec * 220) % width);
      const ry = ((i * 119 + timeSec * 520) % height);
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 6, ry + 14);
      ctx.stroke();
    }
    ctx.restore();
  } else if (weather === 'Foggy') {
    ctx.fillStyle = isDarkMode ? 'rgba(130, 170, 161, 0.14)' : 'rgba(247, 246, 241, 0.28)';
    ctx.fillRect(0, horizonY - 38, width, 74);
  }

  // 6. Splash Ripples
  for (const sp of frame.splashes) {
    const p = sp.age / sp.maxAge;
    ctx.save();
    ctx.strokeStyle = `rgba(237, 235, 227, ${(1 - p) * 0.75})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(sp.x, sp.y, 8 + p * 34, 3 + p * 10, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 7. Cast Power Gauge (charging phase)
  if (frame.phase === 'charging') {
    drawCastPowerGauge(ctx, dockRightX + 24, dockTopY - 96, frame.castPower, isDarkMode);
  }

  // 8. Authentic Fisch Reel Minigame Bar
  if (frame.phase === 'reeling') {
    drawReelMinigame(ctx, frame);
  }
}

function drawIslandSilhouette(
  ctx: CanvasRenderingContext2D,
  island: FischIsland,
  width: number,
  horizonY: number,
  isDarkMode: boolean,
  isNight: boolean,
  timeSec: number
) {
  ctx.save();
  const baseFill = isDarkMode || isNight ? '#0A1E29' : '#588285';
  const farFill = isDarkMode || isNight ? 'rgba(15, 42, 56, 0.65)' : 'rgba(116, 158, 160, 0.55)';

  // Distant Mountain Range
  ctx.fillStyle = farFill;
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  ctx.lineTo(width * 0.18, horizonY - 38);
  ctx.lineTo(width * 0.36, horizonY - 14);
  ctx.lineTo(width * 0.58, horizonY - 46);
  ctx.lineTo(width * 0.82, horizonY - 22);
  ctx.lineTo(width, horizonY - 36);
  ctx.lineTo(width, horizonY);
  ctx.closePath();
  ctx.fill();

  // Island-Specific Landmark on Right/Center
  ctx.fillStyle = baseFill;
  if (island.silhouetteType === 'volcano') {
    ctx.beginPath();
    ctx.moveTo(width * 0.52, horizonY);
    ctx.lineTo(width * 0.67, horizonY - 92);
    ctx.lineTo(width * 0.75, horizonY - 92);
    ctx.lineTo(width * 0.92, horizonY);
    ctx.closePath();
    ctx.fill();
    // Lava glow peak
    ctx.fillStyle = 'rgba(255, 112, 67, 0.8)';
    ctx.beginPath();
    ctx.ellipse(width * 0.71, horizonY - 92, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (island.silhouetteType === 'statue') {
    // Statue of Sovereignty silhouette with raised trident
    const sx = width * 0.72;
    ctx.fillRect(sx - 18, horizonY - 28, 36, 28);
    ctx.fillRect(sx - 10, horizonY - 82, 20, 54);
    ctx.beginPath();
    ctx.arc(sx, horizonY - 90, 9, 0, Math.PI * 2);
    ctx.fill();
    // Trident
    ctx.strokeStyle = isDarkMode ? '#82AAA1' : '#267472';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sx + 16, horizonY - 30);
    ctx.lineTo(sx + 16, horizonY - 104);
    ctx.moveTo(sx + 10, horizonY - 94);
    ctx.lineTo(sx + 22, horizonY - 94);
    ctx.stroke();
  } else if (island.silhouetteType === 'swamp') {
    // Giant glowing mushrooms
    const mx = width * 0.72;
    ctx.fillRect(mx - 4, horizonY - 46, 8, 46);
    ctx.fillStyle = isDarkMode ? '#2E7D67' : '#3E7A69';
    ctx.beginPath();
    ctx.ellipse(mx, horizonY - 48, 34, 16, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(168, 245, 227, 0.65)';
    ctx.beginPath();
    ctx.arc(mx - 12, horizonY - 54, 3, 0, Math.PI * 2);
    ctx.arc(mx + 10, horizonY - 52, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (island.silhouetteType === 'ice') {
    ctx.fillStyle = isDarkMode ? '#3B6E8C' : '#EBF6FC';
    ctx.beginPath();
    ctx.moveTo(width * 0.58, horizonY);
    ctx.lineTo(width * 0.66, horizonY - 72);
    ctx.lineTo(width * 0.74, horizonY - 34);
    ctx.lineTo(width * 0.83, horizonY - 84);
    ctx.lineTo(width * 0.94, horizonY);
    ctx.closePath();
    ctx.fill();
  } else if (island.silhouetteType === 'sunstone') {
    // Merlin's spire tower
    const tx = width * 0.74;
    ctx.fillRect(tx - 14, horizonY - 76, 28, 76);
    ctx.beginPath();
    ctx.moveTo(tx - 18, horizonY - 76);
    ctx.lineTo(tx, horizonY - 108);
    ctx.lineTo(tx + 18, horizonY - 76);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(246, 196, 83, ${0.5 + 0.35 * Math.sin(timeSec * 3)})`;
    ctx.beginPath();
    ctx.arc(tx, horizonY - 58, 4.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (island.silhouetteType === 'abyss') {
    // Submariner Beacon Buoy
    const bx = width * 0.78;
    ctx.fillStyle = '#2A3945';
    ctx.fillRect(bx - 6, horizonY - 34, 12, 34);
    ctx.fillStyle = `rgba(102, 252, 241, ${0.5 + 0.4 * Math.sin(timeSec * 4)})`;
    ctx.beginPath();
    ctx.arc(bx, horizonY - 38, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawPierAndAngler(
  ctx: CanvasRenderingContext2D,
  dockRightX: number,
  dockTopY: number,
  height: number,
  frame: FischRenderFrame
) {
  const { width, timeSec, rod, phase, bobberProgress, isDarkMode } = frame;
  const horizonY = height * 0.56;

  // Pier Pilings & Planks
  ctx.save();
  ctx.fillStyle = isDarkMode ? '#3D2B1F' : '#6E4E37';
  ctx.fillRect(28, dockTopY, 10, height - dockTopY);
  ctx.fillRect(dockRightX - 24, dockTopY, 10, height - dockTopY);
  ctx.fillStyle = isDarkMode ? '#5C402D' : '#8E6648';
  ctx.fillRect(0, dockTopY - 7, dockRightX, 11);
  ctx.restore();

  // Angler Character Standing Near Dock Edge
  const ax = dockRightX - 34;
  const ay = dockTopY - 7;
  ctx.save();
  // Legs & Torso
  ctx.fillStyle = isDarkMode ? '#1F3A4D' : '#1D6664';
  ctx.fillRect(ax - 7, ay - 28, 14, 28);
  // Head
  ctx.fillStyle = '#F2C9A5';
  ctx.beginPath();
  ctx.arc(ax, ay - 36, 7.5, 0, Math.PI * 2);
  ctx.fill();
  // Bucket Hat
  ctx.fillStyle = '#C7B99E';
  ctx.fillRect(ax - 11, ay - 43, 22, 3.5);
  ctx.fillRect(ax - 7, ay - 49, 14, 6);
  ctx.restore();

  // Equipped Fishing Rod
  const handX = ax + 7;
  const handY = ay - 20;
  let rodAngle = -0.72;
  let rodBend = 0;
  if (phase === 'charging') {
    rodAngle = -1.65 - frame.castPower * 0.45;
  } else if (phase === 'casting') {
    rodAngle = -1.4 + bobberProgress * 1.1;
  } else if (phase === 'reeling') {
    rodAngle = -0.95 + Math.sin(timeSec * 14) * 0.06;
    rodBend = 14;
  } else if (phase === 'biting') {
    rodAngle = -0.62 + Math.sin(timeSec * 22) * 0.08;
    rodBend = 10;
  }

  const rodLen = 68;
  const tipX = handX + Math.cos(rodAngle) * rodLen;
  const tipY = handY + Math.sin(rodAngle) * rodLen + rodBend;

  ctx.save();
  ctx.strokeStyle = rod.colorHex;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(handX, handY);
  ctx.quadraticCurveTo(
    handX + Math.cos(rodAngle) * rodLen * 0.55,
    handY + Math.sin(rodAngle) * rodLen * 0.55,
    tipX,
    tipY
  );
  ctx.stroke();

  // Rod Accent Tip
  ctx.strokeStyle = rod.accentHex;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(tipX - Math.cos(rodAngle) * 12, tipY - Math.sin(rodAngle) * 12);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();
  ctx.restore();

  // Fishing Line & Bobber when cast
  if (phase === 'casting' || phase === 'waiting' || phase === 'biting' || phase === 'reeling') {
    const targetBobberX = Math.min(width * 0.78, dockRightX + 120 + frame.castPower * (width * 0.36));
    const waterBobY = horizonY + Math.sin(timeSec * 2.5) * 3.5;

    let bx = targetBobberX;
    let by = waterBobY;

    if (phase === 'casting') {
      const t = bobberProgress;
      bx = tipX + (targetBobberX - tipX) * t;
      by = tipY + (waterBobY - tipY) * t - Math.sin(t * Math.PI) * 75;
    } else if (phase === 'biting') {
      by += 6 + Math.sin(timeSec * 28) * 4;
    } else if (phase === 'reeling') {
      bx = targetBobberX - (targetBobberX - (dockRightX + 45)) * (frame.reelProgress * 0.65);
      by = waterBobY + 4 + Math.sin(timeSec * 18) * 3;
    }

    // Fishing Line Curve
    ctx.save();
    ctx.strokeStyle = isDarkMode ? 'rgba(237, 235, 227, 0.55)' : 'rgba(11, 30, 39, 0.5)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.quadraticCurveTo((tipX + bx) * 0.5, Math.max(tipY, by) + (phase === 'reeling' ? 0 : 14), bx, by);
    ctx.stroke();

    // Red/White Fisch Bobber
    ctx.fillStyle = '#E04F5F';
    ctx.beginPath();
    ctx.arc(bx, by, 5.5, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(bx, by, 5.5, 0, Math.PI);
    ctx.fill();

    // Exclamation Alert on Bite
    if (phase === 'biting') {
      ctx.fillStyle = '#F6C453';
      ctx.font = 'bold 24px "DM Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', bx, by - 18);
    }
    ctx.restore();
  }
}

function drawCastPowerGauge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  power: number,
  isDarkMode: boolean
) {
  const w = 14;
  const h = 92;
  ctx.save();
  ctx.fillStyle = isDarkMode ? 'rgba(6, 17, 22, 0.85)' : 'rgba(255, 255, 255, 0.9)';
  ctx.strokeStyle = isDarkMode ? 'rgba(130, 170, 161, 0.55)' : 'rgba(11, 30, 39, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 7);
  ctx.fill();
  ctx.stroke();

  // Perfect sweet spot zone (0.78 .. 0.94)
  ctx.fillStyle = 'rgba(72, 187, 120, 0.35)';
  ctx.fillRect(x + 2, y + h * 0.06, w - 4, h * 0.16);

  const fillH = Math.max(4, (h - 6) * power);
  ctx.fillStyle = power >= 0.78 && power <= 0.94 ? '#48BB78' : '#367D7B';
  ctx.beginPath();
  ctx.roundRect(x + 3, y + h - 3 - fillH, w - 6, fillH, 4);
  ctx.fill();

  ctx.fillStyle = isDarkMode ? '#EDEBE3' : '#0B1E27';
  ctx.font = '600 10px "DM Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.round(power * 100)}%`, x + w / 2, y - 6);
  ctx.restore();
}

function drawReelMinigame(ctx: CanvasRenderingContext2D, frame: FischRenderFrame) {
  const { width, height, isDarkMode, reelBarCenter, reelBarWidth, reelFishPos, reelProgress, reelOnTarget, hookedSpecies } =
    frame;

  const trackW = Math.min(width - 48, 520);
  const trackH = 34;
  const trackX = (width - trackW) / 2;
  const trackY = height - 86;

  ctx.save();
  // Container Frame
  ctx.fillStyle = isDarkMode ? 'rgba(6, 17, 22, 0.88)' : 'rgba(247, 246, 241, 0.94)';
  ctx.strokeStyle = reelOnTarget
    ? '#48BB78'
    : isDarkMode
    ? 'rgba(130, 170, 161, 0.45)'
    : 'rgba(11, 30, 39, 0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(trackX - 10, trackY - 30, trackW + 20, 82, 14);
  ctx.fill();
  ctx.stroke();

  // Header Instruction & Rarity Tag
  const rarityHex = hookedSpecies
    ? isDarkMode
      ? RARITY_COLORS[hookedSpecies.rarity].dark
      : RARITY_COLORS[hookedSpecies.rarity].light
    : '#82AAA1';

  ctx.fillStyle = isDarkMode ? '#EDEBE3' : '#0B1E27';
  ctx.font = '600 11px "DM Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('TAHAN KLIK / SPASI untuk menggeser bar ke kanan', trackX, trackY - 11);

  ctx.fillStyle = rarityHex;
  ctx.textAlign = 'right';
  ctx.fillText(
    hookedSpecies ? `Tarikan ${hookedSpecies.rarity} · ${Math.round(reelProgress * 100)}%` : `${Math.round(reelProgress * 100)}%`,
    trackX + trackW,
    trackY - 11
  );

  // Inner Track Slot
  ctx.fillStyle = isDarkMode ? '#0C212C' : '#DCEAE8';
  ctx.beginPath();
  ctx.roundRect(trackX, trackY, trackW, trackH, 9);
  ctx.fill();

  // Player White Control Bar
  const barPxW = Math.max(38, reelBarWidth * trackW);
  const clampedCenter = Math.max(reelBarWidth / 2, Math.min(1 - reelBarWidth / 2, reelBarCenter));
  const barLeft = trackX + (clampedCenter - reelBarWidth / 2) * trackW;

  ctx.fillStyle = reelOnTarget
    ? isDarkMode
      ? 'rgba(237, 235, 227, 0.94)'
      : 'rgba(255, 255, 255, 0.96)'
    : isDarkMode
    ? 'rgba(203, 213, 225, 0.65)'
    : 'rgba(255, 255, 255, 0.72)';
  ctx.strokeStyle = reelOnTarget ? '#38B2AC' : '#94A3B8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(barLeft, trackY + 3, barPxW, trackH - 6, 6);
  ctx.fill();
  ctx.stroke();

  // Moving Fish Target Marker inside Track
  const fx = trackX + Math.max(0.03, Math.min(0.97, reelFishPos)) * trackW;
  const fy = trackY + trackH / 2;
  ctx.fillStyle = hookedSpecies ? hookedSpecies.colorHex : '#D98270';
  ctx.strokeStyle = '#061116';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(fx + 2, fy, 11, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Fish Tail
  ctx.beginPath();
  ctx.moveTo(fx - 7, fy);
  ctx.lineTo(fx - 14, fy - 6);
  ctx.lineTo(fx - 14, fy + 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Progress Gauge Directly Below Track
  const progY = trackY + trackH + 7;
  ctx.fillStyle = isDarkMode ? '#122D3A' : '#CEDEDB';
  ctx.beginPath();
  ctx.roundRect(trackX, progY, trackW, 9, 4.5);
  ctx.fill();

  const progGrad = ctx.createLinearGradient(trackX, progY, trackX + trackW, progY);
  progGrad.addColorStop(0, '#367D7B');
  progGrad.addColorStop(0.65, '#48BB78');
  progGrad.addColorStop(1, '#F6C453');
  ctx.fillStyle = progGrad;
  ctx.beginPath();
  ctx.roundRect(trackX, progY, Math.max(6, trackW * reelProgress), 9, 4.5);
  ctx.fill();
  ctx.restore();
}
