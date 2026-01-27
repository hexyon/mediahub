export interface MediaItem {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video';
  description?: string;
}
