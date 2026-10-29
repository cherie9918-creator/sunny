import { FrameTheme } from '../types/photobooth';

export const FRAME_THEMES: FrameTheme[] = [
  {
    id: 'chick-yellow',
    name: '햇살 병아리반',
    subName: '노랑노랑 따스한 봄날',
    bgColor: '#FEF08A', // Yellow-200
    borderColor: '#FACC15',
    textColor: '#854D0E',
    subTextColor: '#A16207',
    accentColor: '#EAB308',
    badgeBg: '#FEF9C3',
    illustration: '🐣',
    pattern: 'dots',
    headerText: 'HAPPY SUNSHINE CLASS 🐣'
  },
  {
    id: 'sprout-green',
    name: '싱그러운 새싹반',
    subName: '파릇파릇 꿈이자라요',
    bgColor: '#BBF7D0', // Green-200
    borderColor: '#4ADE80',
    textColor: '#166534',
    subTextColor: '#15803D',
    accentColor: '#22C55E',
    badgeBg: '#DCFCE7',
    illustration: '🌱',
    pattern: 'dots',
    headerText: 'GROWING SPROUT CLASS 🌱'
  },
  {
    id: 'bunny-pink',
    name: '사랑스런 토끼반',
    subName: '달콤한 딸기우유 빛',
    bgColor: '#FBCFE8', // Pink-200
    borderColor: '#F472B6',
    textColor: '#9D174D',
    subTextColor: '#BE185D',
    accentColor: '#EC4899',
    badgeBg: '#FCE7F3',
    illustration: '🐰',
    pattern: 'hearts',
    headerText: 'LOVELY BUNNY CLASS 🐰'
  },
  {
    id: 'star-blue',
    name: '반짝이는 별빛반',
    subName: '맑은 하늘과 은하수',
    bgColor: '#BAE6FD', // Sky-200
    borderColor: '#38BDF8',
    textColor: '#075985',
    subTextColor: '#0369A1',
    accentColor: '#0284C7',
    badgeBg: '#E0F2FE',
    illustration: '⭐',
    pattern: 'stars',
    headerText: 'TWINKLE STAR CLASS ⭐'
  },
  {
    id: 'bear-warm',
    name: '포근포근 곰돌이반',
    subName: '따뜻한 비스킷 베이지',
    bgColor: '#FED7AA', // Orange-200
    borderColor: '#FB923C',
    textColor: '#9A3412',
    subTextColor: '#C2410C',
    accentColor: '#F97316',
    badgeBg: '#FFEDD5',
    illustration: '🧸',
    pattern: 'dots',
    headerText: 'COZY TEDDY BEAR 🧸'
  },
  {
    id: 'crayon-rainbow',
    name: '알록달록 크레용',
    subName: '상상력 가득 그림일기',
    bgColor: '#FFFFFF',
    borderColor: '#F43F5E',
    textColor: '#1E293B',
    subTextColor: '#475569',
    accentColor: '#F43F5E',
    badgeBg: '#FFF1F2',
    illustration: '🖍️',
    pattern: 'crayons',
    headerText: 'RAINBOW CRAYON ART 🖍️'
  },
  {
    id: 'classic-white',
    name: '모던 화이트',
    subName: '깔끔한 스튜디오 감성',
    bgColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    textColor: '#0F172A',
    subTextColor: '#64748B',
    accentColor: '#0F172A',
    badgeBg: '#F8FAFC',
    illustration: '🤍',
    pattern: 'solid',
    headerText: 'KINDERGARTEN PHOTO 🤍'
  },
  {
    id: 'studio-black',
    name: '시크 딥블랙',
    subName: '또렷하고 세련된 네컷',
    bgColor: '#18181B', // Zinc-900
    borderColor: '#27272A',
    textColor: '#FAFAFA',
    subTextColor: '#A1A1AA',
    accentColor: '#E4E4E7',
    badgeBg: '#27272A',
    illustration: '🖤',
    pattern: 'solid',
    headerText: 'PHOTOBOOTH MEMORY 🖤'
  }
];

export interface PosePrompt {
  step: number;
  title: string;
  pose: string;
  emoji: string;
  tip: string;
}

export const POSE_PROMPTS: PosePrompt[] = [
  {
    step: 1,
    title: '첫 번째 사진',
    pose: '김치~ 치즈~ 활짝 웃기!',
    emoji: '🧀',
    tip: '치아가 보이게 해맑게 웃어보세요!'
  },
  {
    step: 2,
    title: '두 번째 사진',
    pose: '볼에 콕콕! 귀여운 브이!',
    emoji: '✌️',
    tip: '손가락으로 볼을 콕 찌르거나 브이를 해요'
  },
  {
    step: 3,
    title: '세 번째 사진',
    pose: '예쁜 꽃받침 만들기!',
    emoji: '🌸',
    tip: '두 손을 턱 아래에 대고 활짝 핀 꽃처럼!'
  },
  {
    step: 4,
    title: '네 번째 사진',
    pose: '깡총깡총 토끼 귀!',
    emoji: '🐰',
    tip: '머리 위로 손가락 두 개를 쫑긋 올려봐요'
  },
  {
    step: 5,
    title: '다섯 번째 사진',
    pose: '머리 위로 커다란 하트 뿅!',
    emoji: '💖',
    tip: '두 팔로 머리 위에 가장 큰 하트를 그려요!'
  }
];

export interface StickerItem {
  id: string;
  label: string;
  category: 'cute' | 'faces' | 'doodle' | 'words';
  content: string;
  type: 'emoji' | 'text';
}

export const STICKER_LIST: StickerItem[] = [
  // Cute & kindergarten
  { id: 'stk-crown', label: '왕관', category: 'cute', content: '👑', type: 'emoji' },
  { id: 'stk-flower', label: '꽃', category: 'cute', content: '🌸', type: 'emoji' },
  { id: 'stk-sparkle', label: '반짝별', category: 'cute', content: '✨', type: 'emoji' },
  { id: 'stk-heart', label: '하트', category: 'cute', content: '💖', type: 'emoji' },
  { id: 'stk-ribbon', label: '리본', category: 'cute', content: '🎀', type: 'emoji' },
  { id: 'stk-star', label: '별', category: 'cute', content: '⭐', type: 'emoji' },
  { id: 'stk-candy', label: '사탕', category: 'cute', content: '🍭', type: 'emoji' },
  { id: 'stk-sun', label: '햇님', category: 'cute', content: '☀️', type: 'emoji' },
  { id: 'stk-sprout', label: '새싹', category: 'cute', content: '🌱', type: 'emoji' },
  { id: 'stk-rainbow', label: '무지개', category: 'cute', content: '🌈', type: 'emoji' },
  { id: 'stk-balloon', label: '풍선', category: 'cute', content: '🎈', type: 'emoji' },
  { id: 'stk-crayon', label: '크레용', category: 'cute', content: '🖍️', type: 'emoji' },
  { id: 'stk-clover', label: '네잎클로버', category: 'cute', content: '🍀', type: 'emoji' },
  { id: 'stk-glasses', label: '선글라스', category: 'cute', content: '🕶️', type: 'emoji' },
  
  // Animal friends
  { id: 'stk-chick', label: '병아리', category: 'faces', content: '🐣', type: 'emoji' },
  { id: 'stk-bunny', label: '토끼', category: 'faces', content: '🐰', type: 'emoji' },
  { id: 'stk-bear', label: '곰돌이', category: 'faces', content: '🐻', type: 'emoji' },
  { id: 'stk-cat', label: '야옹이', category: 'faces', content: '🐱', type: 'emoji' },
  { id: 'stk-puppy', label: '강아지', category: 'faces', content: '🐶', type: 'emoji' },
  { id: 'stk-hamster', label: '햄스터', category: 'faces', content: '🐹', type: 'emoji' },

  // Korean Speech / Words
  { id: 'word-best', label: '최고!', category: 'words', content: '우리반 최고! 👍', type: 'text' },
  { id: 'word-love', label: '사랑해', category: 'words', content: '사랑해 💕', type: 'text' },
  { id: 'word-happy', label: '행복해', category: 'words', content: '행복한 하루 ✨', type: 'text' },
  { id: 'word-friends', label: '친구', category: 'words', content: '영원한 단짝 👭', type: 'text' },
  { id: 'word-kimchi', label: '김치', category: 'words', content: '김~치 📸', type: 'text' },
  { id: 'word-flower', label: '꽃길', category: 'words', content: '꽃길만 걸어요 🌸', type: 'text' },
];

/**
 * Creates sample fallback photos using HTML5 Canvas so the app works
 * flawlessly even if user denies camera permission or has no camera!
 */
export function createSamplePhoto(stepIndex: number, caption: string): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const palettes = [
    { bg1: '#FEF08A', bg2: '#FDE047', accent: '#EAB308', emoji: '🧀', pose: '활짝 웃는 미소' },
    { bg1: '#BAE6FD', bg2: '#7DD3FC', accent: '#0284C7', emoji: '✌️', pose: '깜찍한 브이 포즈' },
    { bg1: '#BBF7D0', bg2: '#86EFAC', accent: '#22C55E', emoji: '🌸', pose: '예쁜 꽃받침' },
    { bg1: '#FBCFE8', bg2: '#F472B6', accent: '#EC4899', emoji: '🐰', pose: '토끼 귀 쫑긋' },
    { bg1: '#FED7AA', bg2: '#FDBA74', accent: '#F97316', emoji: '💖', pose: '커다란 하트' },
  ];

  const p = palettes[stepIndex % palettes.length];

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, p.bg1);
  grad.addColorStop(1, p.bg2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Soft decorative circles
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.arc(100, 100, 80, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(540, 380, 110, 0, Math.PI * 2);
  ctx.fill();

  // Draw cute character representation
  // Head
  ctx.fillStyle = '#FED7AA';
  ctx.beginPath();
  ctx.arc(320, 240, 100, 0, Math.PI * 2);
  ctx.fill();

  // Hair / Hat
  ctx.fillStyle = p.accent;
  ctx.beginPath();
  ctx.arc(320, 200, 105, Math.PI, Math.PI * 2);
  ctx.fill();

  // Cheeks (blush)
  ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
  ctx.beginPath();
  ctx.arc(270, 260, 18, 0, Math.PI * 2);
  ctx.arc(370, 260, 18, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (smiling arcs)
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(280, 235, 12, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(360, 235, 12, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();

  // Smile
  ctx.beginPath();
  ctx.arc(320, 260, 24, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();

  // Big emoji badge for pose
  ctx.font = '64px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(p.emoji, 440, 160);

  // Bottom Label
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.roundRect(120, 390, 400, 60, 16);
  ctx.fill();

  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(`포즈 ${stepIndex + 1}: ${caption || p.pose}`, 320, 425);

  return canvas.toDataURL('image/jpeg', 0.9);
}
