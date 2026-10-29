import React, { useState } from 'react';
import { Download, Printer, RotateCcw, Edit3, Check, Share2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CapturedPhoto, PhotoboothSettings, PlacedSticker } from '../types/photobooth';
import { PhotoStripView } from './PhotoStripView';
import { downloadPhotoStrip, renderPhotoboothToCanvas } from '../utils/canvasExporter';
import { sounds } from '../utils/soundEffects';

interface ResultViewProps {
  photos: CapturedPhoto[];
  settings: PhotoboothSettings;
  stickers: PlacedSticker[];
  onBackToEdit: () => void;
  onRetake: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  photos,
  settings,
  stickers,
  onBackToEdit,
  onRetake,
}) => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      sounds.playFanfare();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
      await downloadPhotoStrip(photos, settings, stickers);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    sounds.playPopSound();
    window.print();
  };

  const handleCopyImage = async () => {
    try {
      sounds.playPopSound();
      const canvas = await renderPhotoboothToCanvas(photos, settings, stickers);
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch {
          // If clipboard item write is restricted in iframe, trigger download
          handleDownload();
        }
      });
    } catch (e) {
      console.error('Clipboard copy error:', e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10 flex flex-col items-center gap-8">
      {/* Celebration Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-950 font-jua text-sm mb-3 border border-amber-300">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>우와! 멋진 우리반 네컷 사진이 완성되었어요!</span>
        </div>
        <h2 className="font-jua text-2xl md:text-4xl text-slate-900 tracking-tight">
          {`${settings.kindergartenName} ${settings.className}의 소중한 추억`.trim()}
        </h2>
        <p className="text-slate-600 text-sm mt-1">
          컴퓨터에 고화질로 저장하거나 바로 인쇄해서 아이들에게 선물해보세요!
        </p>
      </div>

      {/* Centerpiece: Clean Finished Photo Strip */}
      <div className="p-4 sm:p-8 bg-amber-100/60 rounded-3xl border border-amber-200/80 shadow-md">
        <PhotoStripView
          photos={photos}
          settings={settings}
          stickers={stickers}
          activeStickerId={null}
          onSelectSticker={() => {}}
          onUpdateStickerPos={() => {}}
          onRemoveSticker={() => {}}
          isInteractive={false}
        />
      </div>

      {/* Primary Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3.5 w-full max-w-lg">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex-1 min-w-[200px] py-4 px-6 bg-amber-400 hover:bg-amber-300 active:scale-98 text-amber-950 font-jua text-lg rounded-2xl shadow-md border-2 border-amber-500/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
        >
          <Download className="w-5 h-5" />
          <span>{isDownloading ? '저장 중...' : '네컷 사진 저장 (PNG)'}</span>
        </button>

        <button
          onClick={handlePrint}
          className="py-4 px-6 bg-white hover:bg-amber-50 active:scale-98 text-slate-800 font-jua text-lg rounded-2xl shadow-xs border border-amber-200 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
        >
          <Printer className="w-5 h-5 text-amber-600" />
          <span>사진 인쇄하기</span>
        </button>
      </div>

      {/* Secondary Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleCopyImage}
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>클립보드에 복사됨!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>이미지 복사하기</span>
            </>
          )}
        </button>

        <button
          onClick={() => {
            sounds.playPopSound();
            onBackToEdit();
          }}
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <Edit3 className="w-3.5 h-3.5 text-amber-600" />
          <span>프레임 / 스티커 수정</span>
        </button>

        <button
          onClick={() => {
            if (window.confirm('새로운 사진을 다시 촬영할까요?')) {
              onRetake();
            }
          }}
          className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>새로 촬영하기</span>
        </button>
      </div>
    </div>
  );
};
