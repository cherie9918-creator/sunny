export type AppStep = 'camera' | 'select' | 'customize' | 'result';

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: number;
  label?: string;
}

export type FrameLayout = 'strip_1x4' | 'grid_2x2';

export type PhotoFilter = 'normal' | 'soft' | 'warm' | 'vivid' | 'bw' | 'vintage';

export interface FrameTheme {
  id: string;
  name: string;
  subName: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  subTextColor: string;
  accentColor: string;
  badgeBg: string;
  illustration: string; // Icon or emoji for quick recognition
  pattern: 'dots' | 'clouds' | 'stars' | 'crayons' | 'hearts' | 'stripes' | 'solid';
  headerText: string;
}

export interface PlacedSticker {
  id: string;
  stickerId: string;
  content: string; // SVG or emoji or text
  type: 'emoji' | 'svg' | 'text';
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  scale: number;
  rotation: number;
}

export interface PhotoboothSettings {
  kindergartenName: string;
  className: string;
  dateText: string;
  mottoText: string;
  layout: FrameLayout;
  frameThemeId: string;
  filter: PhotoFilter;
  showDate: boolean;
  showClassInfo: boolean;
  borderRounded: boolean;
}
