export type FrameVariant = 
  | 'none'
  | 'classic-wood'
  | 'elegant-gold'
  | 'modern-white'
  | 'vintage-ornate'
  | 'minimalist-black'
  | 'rustic-barnwood'
  | 'art-deco'
  | 'soft-pastel'
  | 'museum-mat'
  | 'polaroid-style';

export interface FrameStyle {
  id: FrameVariant;
  name: string;
  description: string;
  cssClass: string;
  premium?: boolean;
}

export const frameVariants: FrameStyle[] = [
  {
    id: 'none',
    name: 'No Frame',
    description: 'Clean and simple',
    cssClass: 'frame-none'
  },
  {
    id: 'classic-wood',
    name: 'Classic Wood',
    description: 'Traditional wooden frame',
    cssClass: 'frame-classic-wood',
    premium: true
  },
  {
    id: 'elegant-gold',
    name: 'Elegant Gold',
    description: 'Luxurious gold finish',
    cssClass: 'frame-elegant-gold',
    premium: true
  },
  {
    id: 'modern-white',
    name: 'Modern White',
    description: 'Clean contemporary look',
    cssClass: 'frame-modern-white'
  },
  {
    id: 'vintage-ornate',
    name: 'Vintage Ornate',
    description: 'Intricate vintage design',
    cssClass: 'frame-vintage-ornate',
    premium: true
  },
  {
    id: 'minimalist-black',
    name: 'Minimalist Black',
    description: 'Sleek and modern',
    cssClass: 'frame-minimalist-black'
  },
  {
    id: 'rustic-barnwood',
    name: 'Rustic Barnwood',
    description: 'Weathered country charm',
    cssClass: 'frame-rustic-barnwood',
    premium: true
  },
  {
    id: 'art-deco',
    name: 'Art Deco',
    description: 'Geometric elegance',
    cssClass: 'frame-art-deco',
    premium: true
  },
  {
    id: 'soft-pastel',
    name: 'Soft Pastel',
    description: 'Gentle and dreamy',
    cssClass: 'frame-soft-pastel'
  },
  {
    id: 'museum-mat',
    name: 'Museum Mat',
    description: 'Professional gallery style',
    cssClass: 'frame-museum-mat'
  },
  {
    id: 'polaroid-style',
    name: 'Polaroid Style',
    description: 'Instant photo charm',
    cssClass: 'frame-polaroid-style'
  }
];
