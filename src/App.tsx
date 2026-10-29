/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppStep, CapturedPhoto, PhotoboothSettings, PlacedSticker } from './types/photobooth';
import { Header } from './components/Header';
import { CameraCapture } from './components/CameraCapture';
import { PhotoSelector } from './components/PhotoSelector';
import { FrameEditor } from './components/FrameEditor';
import { ResultView } from './components/ResultView';
import { sounds } from './utils/soundEffects';

export default function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('camera');
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([0, 1, 2, 3]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Settings for photobooth
  const [settings, setSettings] = useState<PhotoboothSettings>({
    kindergartenName: '해맑은 유치원',
    className: '햇살반',
    dateText: new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\. /g, '. ').replace(/\.$/, ''),
    mottoText: '함께해서 행복한 우리들의 추억 ✨',
    layout: 'strip_1x4',
    frameThemeId: 'chick-yellow',
    filter: 'normal',
    showDate: true,
    showClassInfo: true,
    borderRounded: true,
  });

  // Placed Stickers
  const [stickers, setStickers] = useState<PlacedSticker[]>([
    {
      id: 'initial-stk-crown',
      stickerId: 'stk-crown',
      content: '👑',
      type: 'emoji',
      x: 18,
      y: 12,
      scale: 1.1,
      rotation: -10,
    },
    {
      id: 'initial-stk-heart',
      stickerId: 'stk-heart',
      content: '💖',
      type: 'emoji',
      x: 82,
      y: 85,
      scale: 1.2,
      rotation: 15,
    },
  ]);

  // When 5 photos are taken by camera
  const handlePhotosCaptured = (captured: CapturedPhoto[]) => {
    setPhotos(captured);
    // Default pick first 4
    setSelectedIndices([0, 1, 2, 3]);
    setCurrentStep('select');
  };

  // Toggle or select photo for slot
  const handleSelectPhoto = (photoIdx: number) => {
    setSelectedIndices((prev) => {
      const existingSlot = prev.indexOf(photoIdx);
      if (existingSlot !== -1) {
        // Remove from selection
        return prev.filter((idx) => idx !== photoIdx);
      } else {
        // If less than 4, append
        if (prev.length < 4) {
          return [...prev, photoIdx];
        } else {
          // If 4 are already selected, replace the last one
          const updated = [...prev];
          updated[3] = photoIdx;
          return updated;
        }
      }
    });
  };

  // Swap photo slots
  const handleSwapOrder = (fromSlot: number, toSlot: number) => {
    setSelectedIndices((prev) => {
      if (
        fromSlot < 0 ||
        fromSlot >= prev.length ||
        toSlot < 0 ||
        toSlot >= prev.length
      ) {
        return prev;
      }
      const updated = [...prev];
      const temp = updated[fromSlot];
      updated[fromSlot] = updated[toSlot];
      updated[toSlot] = temp;
      return updated;
    });
  };

  // Setting updates
  const handleUpdateSettings = (newSettings: Partial<PhotoboothSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Sticker updates
  const handleAddSticker = (newSticker: PlacedSticker) => {
    setStickers((prev) => [...prev, newSticker]);
  };

  const handleRemoveSticker = (id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
  };

  const handleClearStickers = () => {
    setStickers([]);
  };

  const handleUpdateSticker = (id: string, updates: Partial<PlacedSticker>) => {
    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  // Toggle sound
  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sounds.setSoundEnabled(nextState);
  };

  // Reset to initial state
  const handleReset = () => {
    sounds.playPopSound();
    setCurrentStep('camera');
  };

  // Can navigate helper
  const canNavigateTo = (step: AppStep): boolean => {
    if (step === 'camera') return true;
    if (step === 'select') return photos.length >= 5;
    if (step === 'customize') return photos.length >= 5 && selectedIndices.length === 4;
    if (step === 'result') return photos.length >= 5 && selectedIndices.length === 4;
    return false;
  };

  // Get selected 4 photos in their designated order
  const selectedPhotos = selectedIndices
    .map((idx) => photos[idx])
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-amber-50/40 text-slate-800 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        currentStep={currentStep}
        onNavigate={(step) => {
          sounds.playPopSound();
          setCurrentStep(step);
        }}
        canNavigateTo={canNavigateTo}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onReset={handleReset}
      />

      {/* Main App Stages */}
      <main className="flex-1 py-4 md:py-8">
        {currentStep === 'camera' && (
          <CameraCapture onPhotosCaptured={handlePhotosCaptured} />
        )}

        {currentStep === 'select' && (
          <PhotoSelector
            photos={photos}
            selectedIndices={selectedIndices}
            onSelectPhoto={handleSelectPhoto}
            onSwapOrder={handleSwapOrder}
            onConfirmSelection={() => setCurrentStep('customize')}
            onRetake={handleReset}
          />
        )}

        {currentStep === 'customize' && (
          <FrameEditor
            photos={selectedPhotos}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            stickers={stickers}
            onAddSticker={handleAddSticker}
            onRemoveSticker={handleRemoveSticker}
            onClearStickers={handleClearStickers}
            onUpdateSticker={handleUpdateSticker}
            onProceedToResult={() => setCurrentStep('result')}
          />
        )}

        {currentStep === 'result' && (
          <ResultView
            photos={selectedPhotos}
            settings={settings}
            stickers={stickers}
            onBackToEdit={() => setCurrentStep('customize')}
            onRetake={handleReset}
          />
        )}
      </main>

      {/* Playful Footer */}
      <footer className="mt-auto py-5 border-t border-amber-200/60 bg-white/50 text-center text-xs text-amber-900/70">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-jua text-sm text-amber-950">
            우리반 네컷 · 행복한 유치원 포토부스 📸
          </p>
          <p className="text-xs text-slate-500">
            3-2-1 카운트다운 · 5장 촬영 중 4장 선택 · 8종 테마 프레임
          </p>
        </div>
      </footer>
    </div>
  );
}
