import React, { useState } from 'react';
import {
  Download,
  Printer,
  Sparkles,
  LayoutGrid,
  Columns,
  Palette,
  Smile,
  Type,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CapturedPhoto, PhotoboothSettings, PlacedSticker, PhotoFilter, FrameLayout } from '../types/photobooth';
import { FRAME_THEMES, STICKER_LIST } from '../utils/kindergartenAssets';
import { PhotoStripView } from './PhotoStripView';
import { downloadPhotoStrip } from '../utils/canvasExporter';
import { sounds } from '../utils/soundEffects';

interface FrameEditorProps {
  photos: CapturedPhoto[];
  settings: PhotoboothSettings;
  onUpdateSettings: (newSettings: Partial<PhotoboothSettings>) => void;
  stickers: PlacedSticker[];
  onAddSticker: (sticker: PlacedSticker) => void;
  onRemoveSticker: (id: string) => void;
  onClearStickers: () => void;
  onUpdateSticker: (id: string, updates: Partial<PlacedSticker>) => void;
  onProceedToResult: () => void;
}

export const FrameEditor: React.FC<FrameEditorProps> = ({
  photos,
  settings,
  onUpdateSettings,
  stickers,
  onAddSticker,
  onRemoveSticker,
  onClearStickers,
  onUpdateSticker,
  onProceedToResult,
}) => {
  const [activeTab, setActiveTab] = useState<'frame' | 'text' | 'stickers' | 'filter'>('frame');
  const [activeStickerId, setActiveStickerId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Trigger celebration confetti
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FACC15', '#FB7185', '#38BDF8', '#4ADE80', '#A78BFA'],
    });
  };

  // Add new sticker to canvas
  const handleAddStickerClick = (item: (typeof STICKER_LIST)[0]) => {
    sounds.playPopSound();
    const newSticker: PlacedSticker = {
      id: `stk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      stickerId: item.id,
      content: item.content,
      type: item.type,
      x: 35 + Math.random() * 30,
      y: 30 + Math.random() * 40,
      scale: item.type === 'text' ? 1.0 : 1.2,
      rotation: (Math.random() - 0.5) * 20,
    };
    onAddSticker(newSticker);
    setActiveStickerId(newSticker.id);
  };

  // Download high-resolution PNG
  const handleDownload = async () => {
    try {
      setIsExporting(true);
      sounds.playFanfare();
      triggerConfetti();
      await downloadPhotoStrip(photos, settings, stickers);
    } catch (e) {
      console.error('Download error:', e);
    } finally {
      setIsExporting(false);
    }
  };

  // Print
  const handlePrint = () => {
    sounds.playPopSound();
    window.print();
  };

  const activeSticker = stickers.find((s) => s.id === activeStickerId);

  const filters: { id: PhotoFilter; label: string; desc: string }[] = [
    { id: 'normal', label: '자연스러운 원본', desc: '본래의 색감 그대로' },
    { id: 'soft', label: '화사한 뽀샤시', desc: '부드럽고 밝은 피부톤' },
    { id: 'warm', label: '따뜻한 봄날', desc: '포근하고 노릇한 온기' },
    { id: 'vivid', label: '선명한 비비드', desc: '알록달록 톡톡 튀는 색감' },
    { id: 'bw', label: '단정한 흑백', desc: '클래식 포토부스 무드' },
  ];

  const quickClassNames = ['햇살반', '새싹반', '풀잎반', '열매반', '별빛반', '달님반', '꽃잎반'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Live Interactive Photo Strip Preview (Sticky on desktop) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="bg-amber-100/50 p-4 md:p-6 rounded-3xl border border-amber-200/80 w-full flex flex-col items-center shadow-xs">
            <div className="flex items-center justify-between w-full mb-3 px-1">
              <span className="font-jua text-sm text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                실시간 네컷 미리보기
              </span>
              <span className="text-xs text-amber-800">
                스티커를 클릭하고 드래그해보세요!
              </span>
            </div>

            {/* The Photo Strip Component */}
            <PhotoStripView
              photos={photos}
              settings={settings}
              stickers={stickers}
              activeStickerId={activeStickerId}
              onSelectSticker={(id) => setActiveStickerId(id)}
              onUpdateStickerPos={(id, x, y) => onUpdateSticker(id, { x, y })}
              onRemoveSticker={(id) => {
                sounds.playPopSound();
                onRemoveSticker(id);
                if (activeStickerId === id) setActiveStickerId(null);
              }}
              isInteractive={true}
            />

            {/* Active Sticker Quick Toolbar */}
            {activeSticker && (
              <div className="mt-4 p-2.5 bg-white rounded-2xl border border-amber-300 shadow-md flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-700 px-1 truncate max-w-[80px]">
                  {activeSticker.content}
                </span>
                <div className="h-4 w-px bg-slate-200" />
                <button
                  onClick={() => {
                    sounds.playPopSound();
                    onUpdateSticker(activeSticker.id, {
                      scale: Math.min(2.5, activeSticker.scale + 0.15),
                    });
                  }}
                  className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900"
                  title="크기 키우기"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    sounds.playPopSound();
                    onUpdateSticker(activeSticker.id, {
                      scale: Math.max(0.6, activeSticker.scale - 0.15),
                    });
                  }}
                  className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900"
                  title="크기 줄이기"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    sounds.playPopSound();
                    onUpdateSticker(activeSticker.id, {
                      rotation: activeSticker.rotation - 15,
                    });
                  }}
                  className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900"
                  title="왼쪽 회전"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    sounds.playPopSound();
                    onUpdateSticker(activeSticker.id, {
                      rotation: activeSticker.rotation + 15,
                    });
                  }}
                  className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900"
                  title="오른쪽 회전"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    sounds.playPopSound();
                    onRemoveSticker(activeSticker.id);
                    setActiveStickerId(null);
                  }}
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                  title="스티커 삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Quick Action Buttons Under Preview */}
            <div className="grid grid-cols-2 gap-3 w-full mt-5">
              <button
                onClick={handleDownload}
                disabled={isExporting}
                className="py-3 px-4 bg-amber-400 hover:bg-amber-300 active:scale-98 text-amber-950 font-jua text-sm md:text-base rounded-2xl shadow-sm border border-amber-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? '저장 중...' : '사진 저장 (PNG)'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="py-3 px-4 bg-white hover:bg-amber-50 active:scale-98 text-slate-800 font-jua text-sm md:text-base rounded-2xl shadow-xs border border-amber-200 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4 text-amber-600" />
                <span>사진 인쇄하기</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Customization Controls & Tool Tabs */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Tool Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 bg-white border border-amber-200 rounded-2xl shadow-xs overflow-x-auto">
            <button
              onClick={() => {
                sounds.playPopSound();
                setActiveTab('frame');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-jua text-sm transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'frame'
                  ? 'bg-amber-400 text-amber-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-amber-50/60'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>1. 테마 & 레이아웃</span>
            </button>

            <button
              onClick={() => {
                sounds.playPopSound();
                setActiveTab('text');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-jua text-sm transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'text'
                  ? 'bg-amber-400 text-amber-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-amber-50/60'
              }`}
            >
              <Type className="w-4 h-4" />
              <span>2. 반 이름 & 문구</span>
            </button>

            <button
              onClick={() => {
                sounds.playPopSound();
                setActiveTab('stickers');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-jua text-sm transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'stickers'
                  ? 'bg-amber-400 text-amber-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-amber-50/60'
              }`}
            >
              <Smile className="w-4 h-4" />
              <span>3. 스티커 꾸미기 ({stickers.length})</span>
            </button>

            <button
              onClick={() => {
                sounds.playPopSound();
                setActiveTab('filter');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-jua text-sm transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'filter'
                  ? 'bg-amber-400 text-amber-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-amber-50/60'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>4. 사진 필터</span>
            </button>
          </div>

          {/* TAB 1: FRAME THEME & LAYOUT */}
          {activeTab === 'frame' && (
            <div className="bg-white border border-amber-200 rounded-3xl p-6 shadow-xs flex flex-col gap-6">
              {/* Layout Switcher */}
              <div>
                <label className="font-jua text-base text-slate-900 mb-2.5 block">
                  네컷 스타일 레이아웃 선택
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      sounds.playPopSound();
                      onUpdateSettings({ layout: 'strip_1x4' });
                    }}
                    className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                      settings.layout === 'strip_1x4'
                        ? 'border-amber-400 bg-amber-50/70 ring-2 ring-amber-200'
                        : 'border-slate-200 hover:border-amber-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-200/80 flex items-center justify-center shrink-0">
                      <Columns className="w-5 h-5 text-amber-900" />
                    </div>
                    <div className="text-left">
                      <div className="font-jua text-sm text-slate-900">세로 스트립형 (1x4)</div>
                      <div className="text-xs text-slate-500">인생네컷 감성의 길쭉한 4컷</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      sounds.playPopSound();
                      onUpdateSettings({ layout: 'grid_2x2' });
                    }}
                    className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                      settings.layout === 'grid_2x2'
                        ? 'border-amber-400 bg-amber-50/70 ring-2 ring-amber-200'
                        : 'border-slate-200 hover:border-amber-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-200/80 flex items-center justify-center shrink-0">
                      <LayoutGrid className="w-5 h-5 text-amber-900" />
                    </div>
                    <div className="text-left">
                      <div className="font-jua text-sm text-slate-900">앨범 그리드형 (2x2)</div>
                      <div className="text-xs text-slate-500">액자에 넣기 좋은 네모 4컷</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Theme Grid */}
              <div>
                <label className="font-jua text-base text-slate-900 mb-2.5 block">
                  귀여운 우리반 테마 프레임 (8종)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {FRAME_THEMES.map((theme) => {
                    const isSelected = settings.frameThemeId === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => {
                          sounds.playPopSound();
                          onUpdateSettings({ frameThemeId: theme.id });
                        }}
                        style={{
                          backgroundColor: theme.bgColor,
                          borderColor: isSelected ? theme.accentColor : theme.borderColor,
                        }}
                        className={`p-3.5 rounded-2xl border-3 text-left transition-all relative overflow-hidden flex flex-col justify-between h-[104px] shadow-xs hover:scale-[1.02] ${
                          isSelected ? 'ring-4 ring-amber-300/80 scale-[1.02]' : 'opacity-90'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{theme.illustration}</span>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-amber-950 text-white flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div
                            style={{ color: theme.textColor }}
                            className="font-jua text-sm truncate font-bold"
                          >
                            {theme.name}
                          </div>
                          <div
                            style={{ color: theme.subTextColor }}
                            className="text-[10px] truncate"
                          >
                            {theme.subName}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rounded corner toggle */}
              <div className="flex items-center justify-between p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200">
                <div>
                  <span className="font-jua text-sm text-slate-900 block">
                    사진 모서리 둥글게 하기
                  </span>
                  <span className="text-xs text-slate-500">
                    부드럽고 귀여운 라운드 사진 카드 효과
                  </span>
                </div>
                <button
                  onClick={() => {
                    sounds.playPopSound();
                    onUpdateSettings({ borderRounded: !settings.borderRounded });
                  }}
                  className={`w-12 h-7 rounded-full p-1 transition-colors ${
                    settings.borderRounded ? 'bg-amber-400' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                      settings.borderRounded ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TEXT & CLASS DETAILS */}
          {activeTab === 'text' && (
            <div className="bg-white border border-amber-200 rounded-3xl p-6 shadow-xs flex flex-col gap-5">
              <div>
                <label className="font-jua text-sm text-slate-800 mb-1.5 block">
                  어린이집 / 유치원 이름
                </label>
                <input
                  type="text"
                  value={settings.kindergartenName}
                  onChange={(e) => onUpdateSettings({ kindergartenName: e.target.value })}
                  placeholder="예: 해맑은 유치원, 꿈자람 어린이집"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-hidden font-medium text-sm"
                />
              </div>

              <div>
                <label className="font-jua text-sm text-slate-800 mb-1.5 block">
                  반 이름 (우리반)
                </label>
                <input
                  type="text"
                  value={settings.className}
                  onChange={(e) => onUpdateSettings({ className: e.target.value })}
                  placeholder="예: 햇살반, 새싹반, 풀잎반"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-hidden font-medium text-sm mb-2"
                />
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs text-slate-500 self-center mr-1">추천:</span>
                  {quickClassNames.map((name) => (
                    <button
                      key={name}
                      onClick={() => {
                        sounds.playPopSound();
                        onUpdateSettings({ className: name });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-medium cursor-pointer"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-jua text-sm text-slate-800 mb-1.5 block">
                  추억의 한마디 (모토 / 슬로건)
                </label>
                <input
                  type="text"
                  value={settings.mottoText}
                  onChange={(e) => onUpdateSettings({ mottoText: e.target.value })}
                  placeholder="예: 언제나 밝고 씩씩하게 자라렴 ✨"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-hidden font-medium text-sm"
                />
              </div>

              <div>
                <label className="font-jua text-sm text-slate-800 mb-1.5 block">
                  기록 날짜
                </label>
                <input
                  type="text"
                  value={settings.dateText}
                  onChange={(e) => onUpdateSettings({ dateText: e.target.value })}
                  placeholder="2026. 10. 29"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-hidden font-medium text-sm"
                />
              </div>
            </div>
          )}

          {/* TAB 3: STICKERS */}
          {activeTab === 'stickers' && (
            <div className="bg-white border border-amber-200 rounded-3xl p-6 shadow-xs flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-jua text-base text-slate-900">
                    원하는 스티커를 누르면 사진 위에 붙어요!
                  </h3>
                  <p className="text-xs text-slate-500">
                    사진 위에서 스티커를 마우스나 손가락으로 밀어 위치를 바꿀 수 있습니다.
                  </p>
                </div>
                {stickers.length > 0 && (
                  <button
                    onClick={() => {
                      sounds.playPopSound();
                      onClearStickers();
                      setActiveStickerId(null);
                    }}
                    className="text-xs text-rose-500 hover:text-rose-700 underline font-semibold"
                  >
                    스티커 전체 지우기
                  </button>
                )}
              </div>

              {/* Kindergarten Cute Emoji & Character Stickers */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  귀여운 소품 & 동물 친구들
                </span>
                <div className="grid grid-cols-7 gap-2">
                  {STICKER_LIST.filter((s) => s.type === 'emoji').map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleAddStickerClick(item)}
                      className="aspect-square bg-amber-50/60 hover:bg-amber-100 hover:scale-110 active:scale-95 border border-amber-200/80 rounded-2xl flex items-center justify-center text-2xl transition-all shadow-2xs"
                      title={item.label}
                    >
                      {item.content}
                    </button>
                  ))}
                </div>
              </div>

              {/* Korean Word Bubble Stickers */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  신나는 말풍선 & 응원 문구
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {STICKER_LIST.filter((s) => s.type === 'text').map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleAddStickerClick(item)}
                      className="px-3 py-2 bg-amber-50/70 hover:bg-amber-100 hover:scale-105 active:scale-95 border border-amber-200 rounded-xl font-jua text-xs text-slate-900 transition-all text-center shadow-2xs"
                    >
                      {item.content}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PHOTO FILTER */}
          {activeTab === 'filter' && (
            <div className="bg-white border border-amber-200 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
              <div>
                <h3 className="font-jua text-base text-slate-900">
                  사진 감성 필터 선택
                </h3>
                <p className="text-xs text-slate-500">
                  아이들의 밝은 표정이 더욱 살아나도록 색감을 부드럽게 조정해요.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filters.map((fil) => {
                  const isSelected = settings.filter === fil.id;
                  return (
                    <button
                      key={fil.id}
                      onClick={() => {
                        sounds.playPopSound();
                        onUpdateSettings({ filter: fil.id });
                      }}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-amber-400 bg-amber-50/80 ring-2 ring-amber-200'
                          : 'border-slate-200 hover:border-amber-200 bg-slate-50/50'
                      }`}
                    >
                      <div>
                        <div className="font-jua text-sm text-slate-900">{fil.label}</div>
                        <div className="text-xs text-slate-500">{fil.desc}</div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Next Step Bar */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => {
                sounds.playFanfare();
                triggerConfetti();
                onProceedToResult();
              }}
              className="px-8 py-3.5 bg-amber-400 hover:bg-amber-300 active:scale-98 text-amber-950 font-jua text-base md:text-lg rounded-2xl shadow-md border-2 border-amber-500/40 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>완성 화면 보기 & 공유</span>
              <Sparkles className="w-4 h-4 fill-amber-950" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
