import { useRef, useState } from 'react';
import { Plus, Settings2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaItem } from './types';
import MediaViewer from './MediaViewer';
import SettingsModal from '../Settings/SettingsModal';
import { DesignStyle, FrameVariant } from '../Settings/FrameVariants';

const MediaHub = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [blurEnabled, setBlurEnabled] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
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

  const currentMedia = media[currentIndex];
  const currentLabel = currentMedia?.name || 'Add an image or video to start a focused review';
  const mediaCountLabel =
    media.length === 0
      ? 'No media loaded yet'
      : `${media.length} item${media.length === 1 ? '' : 's'} ready to browse`;

  return (
    <div className="min-h-screen px-6 py-10 sm:px-8">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center">
        <div className="flex w-full flex-col items-center gap-6 text-center">
          <div className="space-y-3">
            <p className="panel-label">Media Hub</p>
            <h1 className="mx-auto max-w-[11ch] text-[clamp(2.75rem,8vw,5.25rem)] font-semibold tracking-[-0.07em] text-[#17181c]">
              A calmer media viewer.
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-[#666b74] sm:text-base">
              Upload images or video, browse them in a focused viewer, and reveal AI descriptions only when they add context.
            </p>
          </div>

          <button
            type="button"
            onClick={handleThumbnailClick}
            className={cn(
              "group relative w-full max-w-[430px] overflow-hidden rounded-[32px] border border-black/5 bg-white/[0.55] p-3 text-left shadow-soft transition-all duration-500",
              media.length > 0
                ? "cursor-pointer hover:-translate-y-1 hover:shadow-[0_32px_72px_rgba(15,23,42,0.16)]"
                : "cursor-default"
            )}
          >
            <div className="relative overflow-hidden rounded-[26px] bg-[#f4f1eb]">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt="Thumbnail"
                  className="h-[380px] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02] sm:h-[440px]"
                />
              ) : (
                <div className="flex h-[380px] w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_42%),linear-gradient(180deg,_#f7f4ee_0%,_#ebe6de_100%)] sm:h-[440px]">
                  <div className="surface-panel flex h-24 w-24 items-center justify-center rounded-[28px]">
                    <svg
                      className="h-10 w-10 text-[#8b8f97]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="4" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                </div>
              )}

              <div className="surface-panel absolute inset-x-3 bottom-3 flex items-end justify-between gap-4 rounded-[22px] px-4 py-3">
                <div className="min-w-0">
                  <p className="panel-label">Current Surface</p>
                  <p className="mt-1 truncate text-sm font-semibold text-[#17181c] sm:text-base">
                    {currentLabel}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="panel-label">Library</p>
                  <p className="mt-1 text-sm font-semibold text-[#17181c]">
                    {String(media.length).padStart(2, '0')}
                  </p>
                </div>
              </div>
            </div>
          </button>

          <div className="surface-panel flex flex-wrap items-center justify-center gap-2 rounded-full p-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="control-pill px-4 sm:px-5"
              title="Add media"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">Add media</span>
            </button>

            <button
              type="button"
              onClick={() => setBlurEnabled(!blurEnabled)}
              className="control-pill px-4 sm:px-5"
              data-active={blurEnabled}
              aria-pressed={blurEnabled}
              title="Toggle background blur"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">{blurEnabled ? 'Backdrop on' : 'Backdrop off'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="control-pill px-4 sm:px-5"
              title="Settings"
            >
              <Settings2 className="h-4 w-4" />
              <span className="text-sm font-medium">Style</span>
            </button>
          </div>

          <p className="text-sm text-[#6b6f76]">{mediaCountLabel}</p>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
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
