export type SawakoExpression = 'normal' | 'pout' | 'dizzy' | 'happy' | 'sleepy' | 'smug' | 'shy';

export type SawakoSymbol = 'none' | 'anger' | 'sweat' | 'sparkle' | 'question' | 'heart' | 'zzz';

export interface SawakoLine {
  text: string;
  expression: SawakoExpression;
  symbol: SawakoSymbol;
}

export interface MascotPosition {
  x: number;
  y: number;
}

export interface MascotPreferences {
  minimized: boolean;
  muted: boolean;
  position: MascotPosition | null;
}

export interface SawakoPhysics {
  pupilX: number;
  pupilY: number;
  headRotate: number;
  isBlinking: boolean;
}

export type SawakoTimeOfDay = 'day' | 'sunset' | 'night';

export type SawakoWalkDirection = 'left' | 'right';

export type SawakoHour =
  | 0 | 1 | 2 | 3 | 4 | 5
  | 6 | 7 | 8 | 9 | 10 | 11
  | 12 | 13 | 14 | 15 | 16 | 17
  | 18 | 19 | 20 | 21 | 22 | 23;

export interface SawakoSvgProps {
  expression: SawakoExpression;
  symbol: SawakoSymbol;
  eyeOffset: { x: number; y: number };
  isHovered: boolean;
  isDragging: boolean;
  isSpeaking?: boolean;
  scaleX?: number;
  scaleY?: number;
  isWalking?: boolean;
  walkDirection?: SawakoWalkDirection;
  isSippingTea?: boolean;
  onPokeHand?: (e: React.MouseEvent) => void;
  onPokeFoot?: (e: React.MouseEvent) => void;
  onPokeStarClip?: (e: React.MouseEvent) => void;
  isProtectingStar?: boolean;
  isBeingPatted?: boolean;
  onHeadpatStroke?: (e: React.MouseEvent) => void;
  timeOfDay?: SawakoTimeOfDay;
  hour?: number;
  onCycleTimeOfDay?: () => void;
}
