import React from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { AppStep } from '../types/photobooth';
import { sounds } from '../utils/soundEffects';

interface HeaderProps {
  currentStep: AppStep;
  onNavigate: (step: AppStep) => void;
  canNavigateTo: (step: AppStep) => boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  onNavigate,
  canNavigateTo,
  soundEnabled,
  onToggleSound,
  onReset,
}) => {
  const steps: { id: AppStep; label: string; number: string }[] = [
    { id: 'camera', label: '사진 촬영', number: '1' },
    { id: 'select', label: '4장 고르기', number: '2' },
    { id: 'customize', label: '프레임 꾸미기', number: '3' },
    { id: 'result', label: '완성 & 저장', number: '4' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-amber-200/80 px-4 md:px-8 py-3.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div
          onClick={onReset}
          className="cursor-pointer flex items-center gap-2.5 whitespace-nowrap shrink-0 group select-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform duration-200">
            📸
          </div>
          <div className="flex flex-col">
            <span className="font-jua text-xl md:text-2xl text-amber-950 tracking-tight flex items-center gap-1.5">
              우리반 네컷
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Steps */}
        <nav className="hidden sm:flex items-center gap-1 md:gap-2">
          {steps.map((st, idx) => {
            const isCurrent = currentStep === st.id;
            const isClickable = canNavigateTo(st.id);
            return (
              <React.Fragment key={st.id}>
                <button
                  onClick={() => isClickable && onNavigate(st.id)}
                  disabled={!isClickable}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                    isCurrent
                      ? 'bg-amber-400 text-amber-950 font-bold shadow-xs'
                      : isClickable
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-amber-50 cursor-pointer'
                      : 'text-slate-300 cursor-not-allowed'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${
                      isCurrent
                        ? 'bg-amber-950 text-white'
                        : isClickable
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {st.number}
                  </span>
                  <span>{st.label}</span>
                </button>
                {idx < steps.length - 1 && (
                  <span className="text-amber-200 text-xs px-0.5 select-none font-bold">›</span>
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action (Sound Toggle & Quick Retake) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              onToggleSound();
              sounds.playPopSound();
            }}
            aria-label={soundEnabled ? '효과음 끄기' : '효과음 켜기'}
            title={soundEnabled ? '효과음 켜짐' : '효과음 꺼짐'}
            className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
              soundEnabled
                ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'
            }`}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-amber-600" />
                <span className="hidden md:inline">소리 켬</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span className="hidden md:inline">음소거</span>
              </>
            )}
          </button>

          {currentStep !== 'camera' && (
            <button
              onClick={() => {
                if (window.confirm('처음부터 다시 사진을 촬영할까요?')) {
                  onReset();
                }
              }}
              className="px-3 py-1.5 text-xs md:text-sm font-semibold rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200 transition-colors whitespace-nowrap"
            >
              새로 촬영
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
