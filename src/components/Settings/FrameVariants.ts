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
    name: 'Modern White',
    description: 'Clean contemporary look',
    cssClass: 'frame-modern-white'
  },
  {
    id: 'minimalist-black',
    name: 'Minimalist Black',
    description: 'Sleek and modern',
    cssClass: 'frame-minimalist-black'
  },
  {
    id: 'classic-black',
    name: 'Classic Black',
    description: 'Bold black frame',
    cssClass: 'frame-classic-black'
  },
  {
    id: 'vibrant-red',
    name: 'Vibrant Red',
    description: 'Eye-catching red frame',
    cssClass: 'frame-vibrant-red'
  },
  {
    id: 'rustic-barnwood',
    name: 'Rustic Barnwood',
    description: 'Weathered country charm',
    cssClass: 'frame-rustic-barnwood',
    premium: true
  },
  {
    id: 'soft-pastel',
    name: 'Soft Pastel',
    description: 'Gentle and dreamy',
    cssClass: 'frame-soft-pastel',
    premium: true
  },
  {
    id: 'polaroid-style',
    name: 'Polaroid Style',
    description: 'Instant photo charm',
    cssClass: 'frame-polaroid-style'
  }
];
