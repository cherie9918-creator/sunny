import { FRAME_THEMES } from './kindergartenAssets';
import { CapturedPhoto, PhotoboothSettings, PlacedSticker, PhotoFilter } from '../types/photobooth';

function applyFilterToContext(ctx: CanvasRenderingContext2D, filter: PhotoFilter) {
  switch (filter) {
    case 'soft':
      ctx.filter = 'brightness(1.08) contrast(0.95) saturate(1.1)';
      break;
    case 'warm':
      ctx.filter = 'sepia(0.2) saturate(1.25) brightness(1.05) hue-rotate(-5deg)';
      break;
    case 'vivid':
      ctx.filter = 'saturate(1.4) contrast(1.1) brightness(1.02)';
      break;
    case 'bw':
      ctx.filter = 'grayscale(1) contrast(1.15) brightness(1.05)';
      break;
    case 'vintage':
      ctx.filter = 'sepia(0.35) contrast(0.9) brightness(0.98)';
      break;
    case 'normal':
    default:
      ctx.filter = 'none';
      break;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

export async function renderPhotoboothToCanvas(
  photos: CapturedPhoto[],
  settings: PhotoboothSettings,
  stickers: PlacedSticker[]
): Promise<HTMLCanvasElement> {
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Ignore font readiness errors
    }
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const theme = FRAME_THEMES.find((t) => t.id === settings.frameThemeId) || FRAME_THEMES[0];
  const is1x4 = settings.layout === 'strip_1x4';

  // Resolution dimensions for sharp print quality
  const width = is1x4 ? 800 : 1200;
  const height = is1x4 ? 2400 : 1600;
  canvas.width = width;
  canvas.height = height;

  // 1. Draw Background Frame
  ctx.fillStyle = theme.bgColor;
  ctx.fillRect(0, 0, width, height);

  // Decorative subtle pattern
  if (theme.pattern === 'dots') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    const spacing = 48;
    for (let x = 16; x < width; x += spacing) {
      for (let y = 16; y < height; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (theme.pattern === 'stars') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    for (let i = 0; i < 40; i++) {
      const rx = (Math.sin(i * 99) * 0.5 + 0.5) * width;
      const ry = (Math.cos(i * 77) * 0.5 + 0.5) * height;
      ctx.beginPath();
      ctx.arc(rx, ry, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (theme.pattern === 'hearts') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '24px sans-serif';
    for (let i = 0; i < 20; i++) {
      const hx = ((i * 137) % width);
      const hy = ((i * 223) % height);
      ctx.fillText('♥', hx, hy);
    }
  }

  // Border frame line
  ctx.strokeStyle = theme.borderColor;
  ctx.lineWidth = 14;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  // 2. Pre-load Images
  const loadedImages: (HTMLImageElement | null)[] = await Promise.all(
    photos.slice(0, 4).map(async (photo) => {
      try {
        return await loadImage(photo.dataUrl);
      } catch {
        return null;
      }
    })
  );

  // 3. Layout geometry
  if (is1x4) {
    // Top banner
    const topPadding = 110;
    const bottomPadding = 260;
    const sideMargin = 50;
    const photoWidth = width - sideMargin * 2;
    const availableHeight = height - topPadding - bottomPadding;
    const photoGap = 32;
    const photoHeight = (availableHeight - photoGap * 3) / 4;

    // Header text
    ctx.fillStyle = theme.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 32px "Jua", sans-serif';
    ctx.fillText(theme.headerText, width / 2, 60);

    // Draw each of the 4 photos
    for (let i = 0; i < 4; i++) {
      const img = loadedImages[i];
      const photoY = topPadding + i * (photoHeight + photoGap);

      // Card shadow & background
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = '#FFFFFF';
      
      const radius = settings.borderRounded ? 20 : 6;
      ctx.beginPath();
      ctx.roundRect(sideMargin, photoY, photoWidth, photoHeight, radius);
      ctx.fill();
      ctx.restore();

      // Inner stroke
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 10;
      ctx.stroke();

      if (img) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(sideMargin + 6, photoY + 6, photoWidth - 12, photoHeight - 12, radius);
        ctx.clip();

        // Apply photo filter
        applyFilterToContext(ctx, settings.filter);

        // Aspect fit / cover
        const imgAspect = img.width / img.height;
        const boxAspect = photoWidth / photoHeight;
        let sWidth = img.width;
        let sHeight = img.height;
        let sx = 0;
        let sy = 0;

        if (imgAspect > boxAspect) {
          sWidth = img.height * boxAspect;
          sx = (img.width - sWidth) / 2;
        } else {
          sHeight = img.width / boxAspect;
          sy = (img.height - sHeight) / 2;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, sideMargin + 6, photoY + 6, photoWidth - 12, photoHeight - 12);
        ctx.restore();
      } else {
        // Fallback placeholder box
        ctx.fillStyle = '#F1F5F9';
        ctx.fillRect(sideMargin + 6, photoY + 6, photoWidth - 12, photoHeight - 12);
        ctx.fillStyle = '#64748B';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`사진 ${i + 1}`, sideMargin + photoWidth / 2, photoY + photoHeight / 2);
      }
    }

    // Bottom Badge / Class Details
    const footerY = height - bottomPadding / 2 - 10;

    // Badge pill background
    ctx.save();
    ctx.fillStyle = theme.badgeBg;
    ctx.beginPath();
    ctx.roundRect(sideMargin + 40, footerY - 80, photoWidth - 80, 150, 24);
    ctx.fill();
    ctx.strokeStyle = theme.borderColor;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.fillStyle = theme.textColor;
    ctx.font = 'bold 38px "Jua", sans-serif';
    const mainTitle = `${settings.kindergartenName} ${settings.className}`.trim() || '우리반 네컷';
    ctx.fillText(`${theme.illustration} ${mainTitle} ${theme.illustration}`, width / 2, footerY - 35);

    if (settings.showClassInfo && settings.mottoText) {
      ctx.fillStyle = theme.subTextColor;
      ctx.font = '500 24px "Noto Sans KR", sans-serif';
      ctx.fillText(`“${settings.mottoText}”`, width / 2, footerY + 8);
    }

    if (settings.showDate && settings.dateText) {
      ctx.fillStyle = theme.subTextColor;
      ctx.font = 'bold 22px "Noto Sans KR", sans-serif';
      ctx.fillText(settings.dateText, width / 2, footerY + 45);
    }

  } else {
    // 2x2 Grid Layout
    const topPadding = 120;
    const bottomPadding = 200;
    const sideMargin = 50;
    const colGap = 32;
    const rowGap = 32;
    const photoWidth = (width - sideMargin * 2 - colGap) / 2;
    const availableHeight = height - topPadding - bottomPadding;
    const photoHeight = (availableHeight - rowGap) / 2;

    // Header
    ctx.fillStyle = theme.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 36px "Jua", sans-serif';
    ctx.fillText(theme.headerText, width / 2, 65);

    for (let i = 0; i < 4; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const px = sideMargin + col * (photoWidth + colGap);
      const py = topPadding + row * (photoHeight + rowGap);
      const img = loadedImages[i];

      const radius = settings.borderRounded ? 20 : 6;

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(px, py, photoWidth, photoHeight, radius);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 10;
      ctx.stroke();

      if (img) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(px + 6, py + 6, photoWidth - 12, photoHeight - 12, radius);
        ctx.clip();

        applyFilterToContext(ctx, settings.filter);

        const imgAspect = img.width / img.height;
        const boxAspect = photoWidth / photoHeight;
        let sWidth = img.width;
        let sHeight = img.height;
        let sx = 0;
        let sy = 0;

        if (imgAspect > boxAspect) {
          sWidth = img.height * boxAspect;
          sx = (img.width - sWidth) / 2;
        } else {
          sHeight = img.width / boxAspect;
          sy = (img.height - sHeight) / 2;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, px + 6, py + 6, photoWidth - 12, photoHeight - 12);
        ctx.restore();
      }
    }

    // Bottom Badge 2x2
    const footerY = height - bottomPadding / 2 + 10;
    ctx.save();
    ctx.fillStyle = theme.badgeBg;
    ctx.beginPath();
    ctx.roundRect(sideMargin + 100, footerY - 60, width - sideMargin * 2 - 200, 110, 24);
    ctx.fill();
    ctx.strokeStyle = theme.borderColor;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.fillStyle = theme.textColor;
    ctx.font = 'bold 36px "Jua", sans-serif';
    const mainTitle = `${settings.kindergartenName} ${settings.className}`.trim() || '우리반 네컷';
    ctx.fillText(`${theme.illustration} ${mainTitle} ${theme.illustration}`, width / 2, footerY - 20);

    const subDetails = [
      settings.showClassInfo && settings.mottoText ? `“${settings.mottoText}”` : '',
      settings.showDate && settings.dateText ? settings.dateText : ''
    ].filter(Boolean).join('  ·  ');

    if (subDetails) {
      ctx.fillStyle = theme.subTextColor;
      ctx.font = 'bold 22px "Noto Sans KR", sans-serif';
      ctx.fillText(subDetails, width / 2, footerY + 22);
    }
  }

  // 4. Render Placed Stickers
  for (const stk of stickers) {
    ctx.save();
    const sx = (stk.x / 100) * width;
    const sy = (stk.y / 100) * height;

    ctx.translate(sx, sy);
    ctx.rotate((stk.rotation * Math.PI) / 180);
    ctx.scale(stk.scale, stk.scale);

    if (stk.type === 'text') {
      // Speech bubble text
      ctx.font = 'bold 26px "Jua", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const textMetrics = ctx.measureText(stk.content);
      const textW = textMetrics.width + 36;
      const textH = 46;

      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;
      ctx.beginPath();
      ctx.roundRect(-textW / 2, -textH / 2, textW, textH, 14);
      ctx.fill();

      ctx.strokeStyle = theme.accentColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#1E293B';
      ctx.fillText(stk.content, 0, 2);
    } else {
      // Emoji sticker
      ctx.font = '54px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
      ctx.shadowBlur = 6;
      ctx.fillText(stk.content, 0, 0);
    }

    ctx.restore();
  }

  return canvas;
}

export async function downloadPhotoStrip(
  photos: CapturedPhoto[],
  settings: PhotoboothSettings,
  stickers: PlacedSticker[]
) {
  const canvas = await renderPhotoboothToCanvas(photos, settings, stickers);
  const dataUrl = canvas.toDataURL('image/png', 1.0);
  const link = document.createElement('a');
  const safeName = (settings.className || '우리반').replace(/\s+/g, '_');
  link.download = `${safeName}_네컷사진_${new Date().toISOString().slice(0, 10)}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
