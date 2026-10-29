import React from 'react';
import { Check, ArrowRight, RotateCcw, ArrowLeftRight, Sparkles } from 'lucide-react';
import { CapturedPhoto } from '../types/photobooth';
import { sounds } from '../utils/soundEffects';

interface PhotoSelectorProps {
  photos: CapturedPhoto[];
  selectedIndices: number[]; // Array of indices (e.g. [0, 1, 2, 4])
  onSelectPhoto: (photoIndex: number) => void;
  onSwapOrder: (fromSlot: number, toSlot: number) => void;
  onConfirmSelection: () => void;
  onRetake: () => void;
}

export const PhotoSelector: React.FC<PhotoSelectorProps> = ({
  photos,
  selectedIndices,
  onSelectPhoto,
  onSwapOrder,
  onConfirmSelection,
  onRetake,
}) => {
  const isComplete = selectedIndices.length === 4;

  const handleCardClick = (idx: number) => {
    sounds.playPopSound();
    onSelectPhoto(idx);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 md:py-6 flex flex-col gap-6">
      {/* Header Guidance Banner */}
      <div className="bg-white border border-amber-200 rounded-3xl p-5 md:p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center md:text-left">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center text-2xl shrink-0 shadow-xs">
            ✨
          </div>
          <div>
            <h2 className="font-jua text-xl md:text-2xl text-slate-900">
              찍은 5장의 사진 중 가장 예쁜 4장을 골라주세요!
            </h2>
            <p className="text-slate-600 text-xs md:text-sm mt-0.5">
              원하는 사진을 터치하면 순서대로 1, 2, 3, 4번에 쏙 들어갑니다.
            </p>
          </div>
        </div>

        {/* Selected count pill */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className={`px-4 py-2 rounded-2xl text-sm font-bold flex items-center gap-2 border ${
              isComplete
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            <span>선택된 사진:</span>
            <span className="font-mono text-base">{selectedIndices.length} / 4장</span>
            {isComplete && <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />}
          </div>

          <button
            onClick={() => {
              sounds.playPopSound();
              onRetake();
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            다시 촬영
          </button>
        </div>
      </div>

      {/* 5 Photos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {photos.map((photo, idx) => {
          const selectionOrder = selectedIndices.indexOf(idx);
          const isSelected = selectionOrder !== -1;

          return (
            <div
              key={photo.id || idx}
              onClick={() => handleCardClick(idx)}
              className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 border-4 bg-white shadow-xs hover:shadow-md ${
                isSelected
                  ? 'border-amber-400 ring-4 ring-amber-200/80 scale-[1.02]'
                  : 'border-slate-200 hover:border-amber-300 opacity-80 hover:opacity-100'
              }`}
            >
              {/* Photo Image */}
              <div className="aspect-4/3 overflow-hidden bg-slate-100 relative">
                <img
                  src={photo.dataUrl}
                  alt={`포즈 ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Selection Badge */}
                {isSelected ? (
                  <div className="absolute top-2 left-2 bg-amber-400 text-amber-950 font-jua text-sm md:text-base px-3 py-1 rounded-full shadow-md border-2 border-white flex items-center gap-1 animate-scale">
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{selectionOrder + 1}번 사진</span>
                  </div>
                ) : (
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-full border border-white/20">
                    {idx + 1}번째 컷
                  </div>
                )}

                {/* Quick overlay hint */}
                <div className="absolute inset-0 bg-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>

              {/* Card Footer with label */}
              <div className="p-3 text-center border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 truncate">
                  {photo.label || `${idx + 1}번째 사진`}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    isSelected
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isSelected ? '선택됨' : '선택하기'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Re-arranging preview deck (when 4 photos are chosen) */}
      {selectedIndices.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
            <div>
              <h4 className="font-jua text-base text-amber-950 flex items-center gap-2">
                <span>네컷 사진 배치 순서</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h4>
              <p className="text-xs text-amber-800">
                1번부터 4번까지 사진이 위에서 아래로(또는 네모 칸에) 배치됩니다. 화살표로 순서를 바꿔보세요!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((slot) => {
              const photoIdx = selectedIndices[slot];
              const photo = photoIdx !== undefined ? photos[photoIdx] : null;

              return (
                <div
                  key={slot}
                  className={`rounded-2xl p-2.5 border-2 transition-all ${
                    photo
                      ? 'bg-white border-amber-300 shadow-xs'
                      : 'border-dashed border-amber-200 bg-amber-100/40 flex items-center justify-center min-h-[140px]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 px-1">
                    <span className="font-jua text-xs text-amber-950">
                      {slot + 1}번째 칸
                    </span>
                    {photo && (
                      <div className="flex items-center gap-1">
                        {slot > 0 && (
                          <button
                            onClick={() => {
                              sounds.playPopSound();
                              onSwapOrder(slot, slot - 1);
                            }}
                            className="p-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px]"
                            title="앞으로 이동"
                          >
                            ◀
                          </button>
                        )}
                        {slot < selectedIndices.length - 1 && (
                          <button
                            onClick={() => {
                              sounds.playPopSound();
                              onSwapOrder(slot, slot + 1);
                            }}
                            className="p-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px]"
                            title="뒤로 이동"
                          >
                            ▶
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {photo ? (
                    <div className="aspect-4/3 rounded-xl overflow-hidden bg-slate-100 relative">
                      <img
                        src={photo.dataUrl}
                        alt={`순서 ${slot + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-amber-600 font-medium">
                      사진을 선택해주세요
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Floating/Fixed CTA */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={() => {
            sounds.playFanfare();
            onConfirmSelection();
          }}
          disabled={!isComplete}
          className={`px-8 py-4 rounded-2xl font-jua text-lg shadow-md transition-all flex items-center gap-3 ${
            isComplete
              ? 'bg-amber-400 hover:bg-amber-300 active:scale-98 text-amber-950 border-2 border-amber-500/40 cursor-pointer'
              : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-70'
          }`}
        >
          <span>{isComplete ? '프레임 꾸미기 시작!' : '사진 4장을 모두 선택해주세요'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
