import React, { useRef } from 'react';
import { CapturedPhoto, PhotoboothSettings, PlacedSticker } from '../types/photobooth';
import { FRAME_THEMES } from '../utils/kindergartenAssets';

interface PhotoStripViewProps {
  photos: CapturedPhoto[];
  settings: PhotoboothSettings;
  stickers: PlacedSticker[];
  activeStickerId: string | null;
  onSelectSticker: (id: string | null) => void;
  onUpdateStickerPos: (id: string, x: number, y: number) => void;
  onRemoveSticker: (id: string) => void;
  isInteractive?: boolean;
}

export const PhotoStripView: React.FC<PhotoStripViewProps> = ({
  photos,
  settings,
  stickers,
  activeStickerId,
  onSelectSticker,
  onUpdateStickerPos,
  onRemoveSticker,
  isInteractive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = FRAME_THEMES.find((t) => t.id === settings.frameThemeId) || FRAME_THEMES[0];
  const is1x4 = settings.layout === 'strip_1x4';

  // Photo filter CSS helper
  const getFilterClass = () => {
    switch (settings.filter) {
      case 'soft':
        return 'brightness-105 contrast-95 saturate-110';
      case 'warm':
        return 'sepia-[0.2] saturate-125 brightness-105';
      case 'vivid':
        return 'saturate-140 contrast-110';
      case 'bw':
        return 'grayscale contrast-115 brightness-105';
      case 'vintage':
        return 'sepia-[0.35] contrast-95';
      default:
        return '';
    }
  };

  // Sticker dragging logic
  const handleMouseDown = (e: React.MouseEvent, stickerId: string) => {
    if (!isInteractive) return;
    e.stopPropagation();
    onSelectSticker(stickerId);

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const xPercent = Math.max(0, Math.min(100, ((moveEvent.clientX - rect.left) / rect.width) * 100));
      const yPercent = Math.max(0, Math.min(100, ((moveEvent.clientY - rect.top) / rect.height) * 100));
      onUpdateStickerPos(stickerId, xPercent, yPercent);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Touch support for dragging stickers on tablets & iPads
  const handleTouchStart = (e: React.TouchEvent, stickerId: string) => {
    if (!isInteractive) return;
    e.stopPropagation();
    onSelectSticker(stickerId);

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length === 0) return;
      const touch = moveEvent.touches[0];
      const xPercent = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
      const yPercent = Math.max(0, Math.min(100, ((touch.clientY - rect.top) / rect.height) * 100));
      onUpdateStickerPos(stickerId, xPercent, yPercent);
    };

    const handleTouchEnd = () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <div
      ref={containerRef}
      id="printable-photo-strip"
      onClick={() => onSelectSticker(null)}
      style={{
        backgroundColor: theme.bgColor,
        borderColor: theme.borderColor,
      }}
      className={`relative select-none border-4 sm:border-6 shadow-xl transition-colors duration-300 overflow-hidden mx-auto ${
        is1x4
          ? 'w-[280px] sm:w-[320px] md:w-[340px] flex flex-col p-4 sm:p-5 rounded-3xl'
          : 'w-[320px] sm:w-[460px] md:w-[500px] flex flex-col p-4 sm:p-6 rounded-3xl'
      }`}
    >
      {/* Decorative Theme Header */}
      <div className="text-center pb-3 pt-1">
        <span
          style={{ color: theme.textColor }}
          className="font-jua text-sm sm:text-base tracking-tight font-bold"
        >
          {theme.headerText}
        </span>
      </div>

      {/* 4 Photos Container */}
      {is1x4 ? (
        // 1x4 Vertical Strip
        <div className="flex flex-col gap-3">
          {photos.slice(0, 4).map((photo, i) => (
            <div
              key={photo.id || i}
              className={`relative bg-white p-1.5 shadow-xs overflow-hidden ${
                settings.borderRounded ? 'rounded-2xl' : 'rounded-md'
              }`}
            >
              <div
                className={`aspect-4/3 overflow-hidden bg-slate-100 ${
                  settings.borderRounded ? 'rounded-xl' : 'rounded-xs'
                }`}
              >
                <img
                  src={photo.dataUrl}
                  alt={`네컷 ${i + 1}`}
                  className={`w-full h-full object-cover transition-all ${getFilterClass()}`}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        // 2x2 Grid
        <div className="grid grid-cols-2 gap-3">
          {photos.slice(0, 4).map((photo, i) => (
            <div
              key={photo.id || i}
              className={`relative bg-white p-1.5 shadow-xs overflow-hidden ${
                settings.borderRounded ? 'rounded-2xl' : 'rounded-md'
              }`}
            >
              <div
                className={`aspect-4/3 overflow-hidden bg-slate-100 ${
                  settings.borderRounded ? 'rounded-xl' : 'rounded-xs'
                }`}
              >
                <img
                  src={photo.dataUrl}
                  alt={`네컷 ${i + 1}`}
                  className={`w-full h-full object-cover transition-all ${getFilterClass()}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Kindergarten Bottom Badge / Class Details */}
      <div className="mt-4 pt-2 text-center">
        <div
          style={{
            backgroundColor: theme.badgeBg,
            borderColor: theme.borderColor,
          }}
          className="rounded-2xl py-2.5 px-4 border border-amber-300/60 shadow-xs flex flex-col items-center justify-center gap-0.5"
        >
          <div
            style={{ color: theme.textColor }}
            className="font-jua text-base sm:text-lg flex items-center gap-1.5 justify-center"
          >
            <span>{theme.illustration}</span>
            <span>
              {`${settings.kindergartenName} ${settings.className}`.trim() || '우리반 네컷'}
            </span>
            <span>{theme.illustration}</span>
          </div>

          {settings.showClassInfo && settings.mottoText && (
            <p
              style={{ color: theme.subTextColor }}
              className="text-xs font-medium italic mt-0.5"
            >
              “{settings.mottoText}”
            </p>
          )}

          {settings.showDate && settings.dateText && (
            <p
              style={{ color: theme.subTextColor }}
              className="text-[11px] font-bold tracking-wider mt-0.5"
            >
              {settings.dateText}
            </p>
          )}
        </div>
      </div>

      {/* Interactive Placed Stickers Layer */}
      {stickers.map((stk) => {
        const isSelected = activeStickerId === stk.id;

        return (
          <div
            key={stk.id}
            onMouseDown={(e) => handleMouseDown(e, stk.id)}
            onTouchStart={(e) => handleTouchStart(e, stk.id)}
            style={{
              left: `${stk.x}%`,
              top: `${stk.y}%`,
              transform: `translate(-50%, -50%) rotate(${stk.rotation}deg) scale(${stk.scale})`,
            }}
            className={`absolute cursor-move select-none transition-shadow ${
              isSelected ? 'ring-2 ring-amber-500 rounded-xl' : ''
            }`}
          >
            {stk.type === 'text' ? (
              <div className="bg-white border-2 border-amber-400 text-slate-900 font-jua text-xs sm:text-sm px-2.5 py-1 rounded-xl shadow-md whitespace-nowrap">
                {stk.content}
              </div>
            ) : (
              <div className="text-3xl sm:text-4xl filter drop-shadow-md">
                {stk.content}
              </div>
            )}

            {/* Quick delete badge on active sticker */}
            {isSelected && isInteractive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveSticker(stk.id);
                }}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center font-bold shadow-xs hover:bg-rose-600 cursor-pointer"
                title="스티커 삭제"
              >
                ×
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
