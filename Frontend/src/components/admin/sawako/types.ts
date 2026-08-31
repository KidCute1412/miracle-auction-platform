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
  onCycleTimeOfDay?: () => void;
}
