export type FrameVariant = 
  | 'none'
  | 'modern-white'
  | 'minimalist-black'
  | 'classic-black'
  | 'vibrant-red'
  | 'rustic-barnwood'
  | 'soft-pastel'
  | 'polaroid-style';

export type DesignStyle = 'default' | 'contentplus';

export interface FrameStyle {
  id: FrameVariant;
  name: string;
  description: string;
  cssClass: string;
  premium?: boolean;
}

export const frameVariants: FrameStyle[] = [
  {
    id: 'modern-white',
    name: 'Porcelain',
    description: 'Soft gallery white',
    cssClass: 'frame-modern-white'
  },
  {
    id: 'minimalist-black',
    name: 'Ink',
    description: 'Deep monochrome edge',
    cssClass: 'frame-minimalist-black'
  },
  {
    id: 'classic-black',
    name: 'Graphite',
    description: 'Dark studio surround',
    cssClass: 'frame-classic-black'
  },
  {
    id: 'vibrant-red',
    name: 'Oxblood',
    description: 'Muted cinematic warmth',
    cssClass: 'frame-vibrant-red'
  },
  {
    id: 'rustic-barnwood',
    name: 'Warm Grain',
    description: 'Textured earth tones',
    cssClass: 'frame-rustic-barnwood',
    premium: true
  },
  {
    id: 'soft-pastel',
    name: 'Blush',
    description: 'Low-contrast softness',
    cssClass: 'frame-soft-pastel',
    premium: true
  },
  {
    id: 'polaroid-style',
    name: 'Paper',
    description: 'Quiet archival border',
    cssClass: 'frame-polaroid-style'
  }
];
