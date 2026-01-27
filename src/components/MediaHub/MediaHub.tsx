import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { MediaItem } from './types';
import MediaViewer from './MediaViewer';

const MediaHub = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [blurEnabled, setBlurEnabled] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>('/thumbnail.png');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const type = file.type.startsWith('video') ? 'video' : 'image';

        const newItem: MediaItem = {
          id: crypto.randomUUID(),
          url,
          name: file.name,
          type,
          description: '',
        };

        setMedia((prev) => {
          const updated = [...prev, newItem];
          if (updated.length === 1) {
            updateThumbnail(url, type);
          }
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateThumbnail = (url: string, type: 'image' | 'video') => {
    if (type === 'image') {
      setThumbnailUrl(url);
    } else {
      const video = document.createElement('video');
      video.src = url;
      video.addEventListener('loadeddata', () => {
        video.currentTime = 1;
      });
      video.addEventListener('seeked', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0);
        setThumbnailUrl(canvas.toDataURL());
      });
    }
  };

  const handleThumbnailClick = () => {
    if (media.length > 0) {
      setIsViewerOpen(true);
    }
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    if (media[currentIndex]) {
      updateThumbnail(media[currentIndex].url, media[currentIndex].type);
    }
  };

  const handleUpdateDescription = (id: string, description: string) => {
    setMedia((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, description } : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex items-center gap-5">
        {/* Thumbnail */}
        <div
          onClick={handleThumbnailClick}
          className={cn(
            "w-[200px] h-[200px] rounded-2xl overflow-hidden",
            "shadow-soft cursor-pointer",
            "transition-transform duration-300 hover:scale-105",
            "bg-white flex items-center justify-center"
          )}
        >
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt="Thumbnail"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-muted-foreground text-center px-4">
              <svg
                className="w-12 h-12 mx-auto mb-2 opacity-50"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span className="text-sm">No media</span>
            </div>
          )}
        </div>

        {/* Control buttons */}
        <div className="flex items-center gap-5">
          <button
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "w-[50px] h-[50px] rounded-full",
              "bg-primary text-primary-foreground",
              "flex items-center justify-center text-2xl font-light",
              "shadow-soft hover:scale-105 active:scale-95",
              "transition-transform duration-200"
            )}
          >
            +
          </button>

          <button
            onClick={() => setBlurEnabled(!blurEnabled)}
            className={cn(
              "w-[50px] h-[50px] rounded-full",
              "flex items-center justify-center",
              "transition-all duration-300",
              blurEnabled ? "" : "grayscale"
            )}
            title="Toggle Background Blur"
            style={{
              background: `transparent url('/blur.png') no-repeat center`,
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Full screen viewer */}
      {isViewerOpen && media.length > 0 && (
        <MediaViewer
          media={media}
          currentIndex={currentIndex}
          onIndexChange={setCurrentIndex}
          onClose={handleCloseViewer}
          onUpdateDescription={handleUpdateDescription}
          blurEnabled={blurEnabled}
        />
      )}
    </div>
  );
};

export default MediaHub;
