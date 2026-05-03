export type FrameVariant = 
  | 'none'
  | 'modern-white'
  | 'minimalist-black'
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
    description: 'Matte neutral frame',
    cssClass: 'frame-minimalist-black'
  },
  {
    id: 'polaroid-style',
    name: 'Polaroid Style',
    description: 'Instant photo charm',
    cssClass: 'frame-polaroid-style'
  }
];
