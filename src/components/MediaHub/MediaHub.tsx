import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { MediaItem } from './types';
import MediaViewer from './MediaViewer';
import SettingsModal from '../Settings/SettingsModal';
import { FrameVariant, DesignStyle } from '../Settings/FrameVariants';

const MediaHub = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [blurEnabled, setBlurEnabled] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>('/thumbnail.png');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState<FrameVariant>('none');
  const [designStyle, setDesignStyle] = useState<DesignStyle>('default');
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
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}>
      <div className="flex items-center gap-5">
        {/* Thumbnail */}
        <div
          onClick={handleThumbnailClick}
          className={cn(
            "w-[200px] h-[200px] overflow-hidden thumbnail-frame",
            "cursor-pointer",
            "transition-transform duration-300 hover:scale-105",
            "bg-white flex items-center justify-center"
          )}
          style={{ boxShadow: '0 4px 18px rgba(0,0,0,0.10)' }}
        >
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
          ) : (
            <div className="text-muted-foreground text-center px-4">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span className="text-sm" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#aaa' }}>No media</span>
            </div>
          )}
        </div>

        {/* Control buttons */}
        <div className="flex items-center gap-4">
          {/* Add button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="retro-btn w-[48px] h-[48px] flex items-center justify-center transition-transform duration-200"
            style={{ fontSize: '1.6rem', fontWeight: 300, color: '#555' }}
            title="Add media"
          >
            +
          </button>

          {/* Blur toggle — original style */}
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

          {/* Settings */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="retro-btn w-[48px] h-[48px] flex items-center justify-center transition-transform duration-200"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="#888" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
      </div>

      {isViewerOpen && media.length > 0 && (
        <MediaViewer
          media={media}
          currentIndex={currentIndex}
          onIndexChange={setCurrentIndex}
          onClose={handleCloseViewer}
          onUpdateDescription={handleUpdateDescription}
          blurEnabled={blurEnabled}
          frameVariant={selectedFrame}
          designStyle={designStyle}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentFrame={selectedFrame}
        onFrameChange={setSelectedFrame}
        designStyle={designStyle}
        onDesignStyleChange={setDesignStyle}
      />
    </div>
  );
};

export default MediaHub;
