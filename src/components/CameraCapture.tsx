import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, FlipHorizontal, AlertCircle, Sparkles, Upload, Play, Check } from 'lucide-react';
import { CapturedPhoto } from '../types/photobooth';
import { POSE_PROMPTS, createSamplePhoto } from '../utils/kindergartenAssets';
import { sounds } from '../utils/soundEffects';

interface CameraCaptureProps {
  onPhotosCaptured: (photos: CapturedPhoto[]) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onPhotosCaptured }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraState, setCameraState] = useState<'idle' | 'ready' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isMirrored, setIsMirrored] = useState<boolean>(true);

  // Shooting sequence states
  const [isShootingSequence, setIsShootingSequence] = useState<boolean>(false);
  const [currentShotIndex, setCurrentShotIndex] = useState<number>(0); // 0 to 4
  const [countdown, setCountdown] = useState<number | null>(null); // 3, 2, 1, or null
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [prepMessage, setPrepMessage] = useState<string>('');

  // Start video stream
  const startCamera = useCallback(async (facing: 'user' | 'environment') => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      setCameraState('idle');
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1280, min: 640 },
          height: { ideal: 960, min: 480 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraState('ready');
    } catch (err: unknown) {
      console.warn('Camera access warning:', err);
      setCameraState('error');
      setErrorMessage(
        '카메라를 실행할 수 없습니다. 카메라 권한을 허용해주시거나, 아래 샘플 사진으로 바로 체험해보세요!'
      );
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode, startCamera]);

  // Flip camera
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    setIsMirrored(nextMode === 'user');
    sounds.playPopSound();
  };

  // Capture single frame from video stream
  const captureCurrentFrame = useCallback((): string => {
    if (!videoRef.current) return '';
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.92);
  }, [isMirrored]);

  // Execute full 5-shot sequence with 3, 2, 1 countdown
  const startSequence = () => {
    if (cameraState !== 'ready') return;
    setIsShootingSequence(true);
    setCapturedPhotos([]);
    setCurrentShotIndex(0);
    sounds.playPopSound();
    runShotStep(0, []);
  };

  const runShotStep = (shotIndex: number, accumulatedPhotos: CapturedPhoto[]) => {
    if (shotIndex >= 5) {
      // Completed all 5 shots!
      setIsShootingSequence(false);
      setCountdown(null);
      setPrepMessage('총 5장 촬영 완료! 멋진 사진을 골라볼까요? ✨');
      sounds.playFanfare();
      setTimeout(() => {
        onPhotosCaptured(accumulatedPhotos);
      }, 900);
      return;
    }

    setCurrentShotIndex(shotIndex);
    const pose = POSE_PROMPTS[shotIndex];
    setPrepMessage(`${pose.emoji} 포즈: ${pose.pose}`);

    // Countdown: 3
    setCountdown(3);
    sounds.playCountdownBeep(3);

    const timer1 = setTimeout(() => {
      // Countdown: 2
      setCountdown(2);
      sounds.playCountdownBeep(2);

      const timer2 = setTimeout(() => {
        // Countdown: 1
        setCountdown(1);
        sounds.playCountdownBeep(1);

        const timer3 = setTimeout(() => {
          // Snap!
          setCountdown(0);
          setIsFlashing(true);
          sounds.playShutterSound();

          const photoUrl = captureCurrentFrame();
          const newPhoto: CapturedPhoto = {
            id: `photo-${Date.now()}-${shotIndex}`,
            dataUrl: photoUrl || createSamplePhoto(shotIndex, pose.pose),
            timestamp: Date.now(),
            label: pose.pose,
          };

          const updated = [...accumulatedPhotos, newPhoto];
          setCapturedPhotos(updated);

          setTimeout(() => {
            setIsFlashing(false);
            setCountdown(null);

            if (shotIndex < 4) {
              setPrepMessage(`다음 포즈 준비! (${shotIndex + 2}/5) 잠시만 기다려주세요 ⏱️`);
              setTimeout(() => {
                runShotStep(shotIndex + 1, updated);
              }, 1800);
            } else {
              runShotStep(shotIndex + 1, updated);
            }
          }, 350);
        }, 1000);

        return () => clearTimeout(timer3);
      }, 1000);

      return () => clearTimeout(timer2);
    }, 1000);

    return () => clearTimeout(timer1);
  };

  // Fallback: load 5 sample cartoon photos instantly
  const handleUseSamplePhotos = () => {
    sounds.playPopSound();
    const samples: CapturedPhoto[] = POSE_PROMPTS.map((p, idx) => ({
      id: `sample-${idx + 1}`,
      dataUrl: createSamplePhoto(idx, p.pose),
      timestamp: Date.now() + idx,
      label: p.pose,
    }));
    setCapturedPhotos(samples);
    sounds.playFanfare();
    onPhotosCaptured(samples);
  };

  // Fallback: upload 5 local photos
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    sounds.playPopSound();
    const uploaded: CapturedPhoto[] = [];
    const readCount = Math.min(files.length, 5);

    Array.from(files).slice(0, 5).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          uploaded.push({
            id: `upload-${Date.now()}-${idx}`,
            dataUrl: ev.target.result as string,
            timestamp: Date.now() + idx,
            label: `업로드 사진 ${idx + 1}`,
          });
          if (uploaded.length === readCount) {
            // Fill up to 5 if less than 5 uploaded
            while (uploaded.length < 5) {
              const extraIdx = uploaded.length;
              uploaded.push({
                id: `fill-${extraIdx}`,
                dataUrl: createSamplePhoto(extraIdx, POSE_PROMPTS[extraIdx].pose),
                timestamp: Date.now() + extraIdx,
                label: POSE_PROMPTS[extraIdx].pose,
              });
            }
            onPhotosCaptured(uploaded);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const currentPose = POSE_PROMPTS[currentShotIndex] || POSE_PROMPTS[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 md:py-6 flex flex-col gap-5">
      {/* Kindergarten Banner Guide */}
      <div className="bg-pink-100 border border-pink-300 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-full bg-pink-300 flex items-center justify-center text-2xl shrink-0 shadow-xs">
            🌸
          </div>
          <div>
            <h1 className="font-jua text-xl md:text-2xl text-pink-950 flex items-center gap-2 justify-center sm:justify-start">
              우리반 네컷 사진관
            </h1>
            <p className="text-pink-800 text-xs md:text-sm mt-0.5">
              3, 2, 1 카운트다운 후 총 5장을 연속 촬영하고, 가장 마음에 드는 4장을 골라 예쁜 네컷을 완성해요!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleUseSamplePhotos}
            className="px-3.5 py-2 text-xs md:text-sm font-semibold rounded-xl bg-white text-pink-900 border border-pink-300 hover:bg-pink-50 shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-pink-500" />
            샘플 사진으로 해보기
          </button>
        </div>
      </div>

      {/* Main Camera Studio Box */}
      <div className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-xl aspect-4/3 md:aspect-16/10 max-h-[620px] flex items-center justify-center border-4 border-amber-300">
        {/* Flash Effect Overlay */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-30 animate-flash pointer-events-none" />
        )}

        {/* Video Feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isMirrored ? 'scale-x-[-1]' : ''}`}
        />

        {/* Camera Permission / Error Fallback State */}
        {cameraState === 'error' && (
          <div className="absolute inset-0 bg-slate-900/90 z-20 flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="font-jua text-xl md:text-2xl mb-2">카메라를 불러올 수 없습니다</h3>
            <p className="text-slate-300 text-sm max-w-md mb-6">{errorMessage}</p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => startCamera(facingMode)}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-xl text-sm transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                카메라 다시 시도
              </button>
              <button
                onClick={handleUseSamplePhotos}
                className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-xl text-sm transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                귀여운 샘플 캐릭터로 체험하기
              </button>
              <label className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-2 cursor-pointer border border-slate-700">
                <Upload className="w-4 h-4 text-amber-400" />
                내 사진 5장 업로드
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* Active Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/35 backdrop-blur-[2px]">
            {countdown > 0 ? (
              <div className="flex flex-col items-center animate-bounce">
                <span className="font-jua text-9xl md:text-[14rem] text-amber-300 drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)] font-black">
                  {countdown}
                </span>
                <span className="font-jua text-2xl md:text-3xl text-white bg-amber-500/90 px-6 py-2 rounded-full shadow-lg">
                  {currentPose.emoji} {currentPose.pose}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center animate-scale">
                <span className="font-jua text-6xl md:text-8xl text-white drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)]">
                  찰칵! 📸
                </span>
              </div>
            )}
          </div>
        )}

        {/* Top Controls Overlay on Video */}
        {cameraState === 'ready' && !isShootingSequence && (
          <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
            {/* Guide Badge */}
            <div className="pointer-events-auto bg-black/60 backdrop-blur-md text-white text-xs md:text-sm px-4 py-2 rounded-full flex items-center gap-2 font-medium border border-white/20">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              카메라 준비 완료
            </div>

            {/* Camera Utility Buttons */}
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                onClick={() => setIsMirrored(!isMirrored)}
                className={`p-2.5 rounded-full backdrop-blur-md border transition-all text-white text-xs ${
                  isMirrored
                    ? 'bg-amber-500/80 border-amber-300'
                    : 'bg-black/60 border-white/20 hover:bg-black/80'
                }`}
                title={isMirrored ? '좌우반전 켜짐' : '좌우반전 꺼짐'}
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>

              <button
                onClick={toggleFacingMode}
                className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 backdrop-blur-md text-white transition-all text-xs"
                title="전면/후면 카메라 전환"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Pose Guide Overlay Banner when shooting */}
        {isShootingSequence && (
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
            <div className="bg-amber-400/95 text-amber-950 font-jua text-sm md:text-base px-5 py-2.5 rounded-2xl shadow-lg border border-amber-300 flex items-center gap-2">
              <span className="bg-amber-950 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold">
                {currentShotIndex + 1}
              </span>
              <span>
                {currentShotIndex + 1}번째 컷: {currentPose.emoji} {currentPose.pose}
              </span>
            </div>

            <div className="bg-black/70 backdrop-blur-md text-white font-mono text-xs md:text-sm px-3.5 py-1.5 rounded-full border border-white/20">
              {currentShotIndex + 1} / 5
            </div>
          </div>
        )}

        {/* Preparation status bar at bottom during sequence */}
        {prepMessage && isShootingSequence && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 bg-black/80 backdrop-blur-md text-amber-300 px-6 py-2.5 rounded-full text-sm font-semibold border border-amber-400/40 shadow-lg text-center whitespace-nowrap animate-pulse">
            {prepMessage}
          </div>
        )}
      </div>

      {/* Action Controls & Pose Guidelines */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Left: Pose guide icons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {POSE_PROMPTS.map((p, idx) => {
            const isDone = capturedPhotos.length > idx;
            const isCurrent = isShootingSequence && currentShotIndex === idx;
            return (
              <div
                key={p.step}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs whitespace-nowrap transition-all ${
                  isCurrent
                    ? 'bg-amber-300 border-amber-500 text-amber-950 font-bold scale-105 shadow-xs'
                    : isDone
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <span>{p.emoji}</span>
                <span className="font-semibold">{idx + 1}컷</span>
                {isDone && <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />}
              </div>
            );
          })}
        </div>

        {/* Right: Big Primary Shutter Action */}
        <div className="flex items-center gap-3 justify-end">
          {cameraState === 'ready' && !isShootingSequence && (
            <button
              onClick={startSequence}
              className="w-full sm:w-auto px-8 py-4 bg-amber-400 hover:bg-amber-300 active:scale-98 text-amber-950 font-jua text-xl rounded-2xl shadow-md border-2 border-amber-500/40 transition-all flex items-center justify-center gap-3 cursor-pointer group"
            >
              <Camera className="w-6 h-6 text-amber-950 group-hover:scale-110 transition-transform" />
              <span>사진 촬영 시작하기! (총 5장)</span>
              <Play className="w-5 h-5 fill-amber-950 text-amber-950" />
            </button>
          )}

          {isShootingSequence && (
            <div className="w-full sm:w-auto px-6 py-3.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-2xl text-center font-bold text-sm flex items-center justify-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
              촬영 진행 중입니다... (3초 카운트다운)
            </div>
          )}
        </div>
      </div>

      {/* Live Thumbnail Strip (Shows as photos get captured) */}
      {capturedPhotos.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-jua text-sm text-slate-800 flex items-center gap-1.5">
              <span>찍힌 사진 모아보기</span>
              <span className="text-amber-600 text-xs font-normal">
                ({capturedPhotos.length} / 5장 완료)
              </span>
            </h4>
          </div>
          <div className="grid grid-cols-5 gap-2 md:gap-3">
            {Array.from({ length: 5 }).map((_, idx) => {
              const photo = capturedPhotos[idx];
              return (
                <div
                  key={idx}
                  className={`aspect-4/3 rounded-xl overflow-hidden border-2 relative flex items-center justify-center ${
                    photo
                      ? 'border-amber-400 bg-slate-100 shadow-xs'
                      : 'border-dashed border-slate-200 bg-slate-50 text-slate-300'
                  }`}
                >
                  {photo ? (
                    <>
                      <img
                        src={photo.dataUrl}
                        alt={`촬영 ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                        {idx + 1}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs font-medium">{idx + 1}번</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
