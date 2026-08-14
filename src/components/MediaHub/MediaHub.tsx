import { useState, useRef } from 'react';
import { Settings2 } from 'lucide-react';
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
          className="cursor-pointer transition-transform duration-300 hover:scale-105"
        >
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt="Thumbnail" className="w-[200px] h-[200px] object-cover" style={{ borderRadius: '18px', boxShadow: '0 4px 24px rgba(0,0,0,0.13)', display: 'block' }} />
          ) : (
            <div className="w-[200px] h-[200px] flex items-center justify-center" style={{ borderRadius: '18px', boxShadow: '0 4px 24px rgba(0,0,0,0.13)', background: '#fff' }}>
              <svg className="w-12 h-12 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
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

          {/* Blur toggle — square retro-btn style, matching Add/Settings buttons */}
          <button
            onClick={() => setBlurEnabled(!blurEnabled)}
            className="retro-btn w-[48px] h-[48px] flex items-center justify-center transition-transform duration-200"
            title="Toggle Background Blur"
            style={{
              position: 'relative',
              overflow: 'hidden',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.02em',
              color: blurEnabled ? '#1d1d1f' : '#888',
            }}
          >
            {blurEnabled && (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  backdropFilter: 'blur(6px) saturate(1.6)',
                  WebkitBackdropFilter: 'blur(6px) saturate(1.6)',
                  background: 'rgba(255,255,255,0.35)',
                }}
              />
            )}
            <span style={{ position: 'relative' }}>Blur</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="retro-btn w-[48px] h-[48px] flex items-center justify-center transition-transform duration-200"
            title="Settings"
          >
            <Settings2 className="w-[18px] h-[18px]" stroke="#a3a3a3" strokeWidth={1.5} />
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
