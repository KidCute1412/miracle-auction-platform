export type SawakoExpression = 'normal' | 'pout' | 'dizzy' | 'happy' | 'sleepy' | 'smug';

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
