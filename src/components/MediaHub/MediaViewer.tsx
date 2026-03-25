import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, List, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaItem } from './types';
import DescriptionPanel from './DescriptionPanel';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DesignStyle, FrameVariant } from '../Settings/FrameVariants';

interface MediaViewerProps {
  media: MediaItem[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  onUpdateDescription: (id: string, description: string) => void;
  blurEnabled: boolean;
  frameVariant: FrameVariant;
  designStyle: DesignStyle;
}

const MediaViewer = ({
  media,
  currentIndex,
  onIndexChange,
  onClose,
  onUpdateDescription,
  blurEnabled,
  frameVariant,
  designStyle,
}: MediaViewerProps) => {
  const [showList, setShowList] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisTimeout, setAnalysisTimeoutState] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [currentBlurIndex, setCurrentBlurIndex] = useState(0);
  const [preloadedImages, setPreloadedImages] = useState<{ [key: number]: HTMLImageElement }>({});
  const videoRef = useRef<HTMLVideoElement>(null);
  const blur1Ref = useRef<HTMLDivElement>(null);
  const blur2Ref = useRef<HTMLDivElement>(null);
  const currentIndexRef = useRef(currentIndex);
  const currentMedia = media[currentIndex];

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        onIndexChange((currentIndex + 1) % media.length);
      } else if (e.key === 'ArrowLeft') {
        onIndexChange((currentIndex - 1 + media.length) % media.length);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, media.length, onClose, onIndexChange]);

  useEffect(() => {
    if (videoRef.current && currentMedia?.type === 'video') {
      videoRef.current.play();
    }
  }, [currentIndex, currentMedia]);

  useEffect(() => {
    if (!blurEnabled) return;

    const prevIndex = (currentIndex - 1 + media.length) % media.length;
    const nextIndex = (currentIndex + 1) % media.length;

    [prevIndex, nextIndex].forEach((idx) => {
      if (media[idx]?.type === 'image' && !preloadedImages[idx]) {
        const img = new Image();
        img.src = media[idx].url;
        setPreloadedImages((prev) => ({ ...prev, [idx]: img }));
      }
    });
  }, [blurEnabled, currentIndex, media, preloadedImages]);

  useEffect(() => {
    if (!blurEnabled || !currentMedia) return;

    if (currentMedia.type === 'image') {
      const nextBlurIndex = 1 - currentBlurIndex;
      const blurRefs = [blur1Ref, blur2Ref];
      const nextBlur = blurRefs[nextBlurIndex].current;
      const activeBlur = blurRefs[currentBlurIndex].current;

      if (nextBlur) {
        nextBlur.style.backgroundImage = `url(${currentMedia.url})`;
        nextBlur.style.display = 'block';
        nextBlur.style.opacity = '0.8';
      }

      if (activeBlur) {
        activeBlur.style.opacity = '0';
      }

      setCurrentBlurIndex(nextBlurIndex);
    } else {
      [blur1Ref, blur2Ref].forEach((ref) => {
        if (ref.current) {
          ref.current.style.display = 'block';
          ref.current.style.opacity = '0';
        }
      });
    }
  }, [blurEnabled, currentMedia]);

  useEffect(() => {
    if (analysisTimeout) {
      clearTimeout(analysisTimeout);
      setAnalysisTimeoutState(null);
    }

    if (showDescription && currentMedia?.type === 'image' && !currentMedia.description && !isAnalyzing) {
      const timeout = setTimeout(() => {
        void analyzeCurrentImage();
      }, 3000);

      setAnalysisTimeoutState(timeout);

      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [currentIndex, currentMedia, isAnalyzing, showDescription]);

  const analyzeCurrentImage = async () => {
    if (!currentMedia || currentMedia.type !== 'image' || isAnalyzing) return;

    const requestIndex = currentIndexRef.current;
    const requestItem = media[requestIndex];
    if (!requestItem || requestItem.type !== 'image') return;

    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-image', {
        body: { imageData: requestItem.url }
      });

      if (requestIndex !== currentIndexRef.current) {
        return;
      }

      if (error) {
        console.error('Error analyzing image:', error);
        toast.error('Failed to analyze image');
        return;
      }

      if (data?.description) {
        onUpdateDescription(requestItem.id, data.description);
      }
    } catch (err) {
      console.error('Error calling analyze-image:', err);
      toast.error('Failed to connect to AI service');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const goToPrev = () => {
    onIndexChange((currentIndex - 1 + media.length) % media.length);
  };

  const goToNext = () => {
    onIndexChange((currentIndex + 1) % media.length);
  };

  const isContentPlus = designStyle === 'contentplus';
  const floatingButtonClass = cn(
    "flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-xl transition-all duration-200",
    isContentPlus
      ? "border-white/10 bg-white/10 text-white/90 hover:bg-white/[0.16]"
      : "border-black/10 bg-white/[0.72] text-[#17181c] hover:bg-white/[0.92]"
  );
  const floatingPillClass = cn(
    "flex items-center gap-3 rounded-full border px-4 py-2 backdrop-blur-xl",
    isContentPlus
      ? "border-white/10 bg-white/10 text-white shadow-[0_16px_40px_rgba(0,0,0,0.2)]"
      : "border-black/10 bg-white/[0.72] text-[#17181c] shadow-[0_16px_40px_rgba(15,23,42,0.1)]"
  );
  const metaLabelClass = cn(
    "text-[0.68rem] font-semibold uppercase tracking-[0.22em]",
    isContentPlus ? "text-white/[0.45]" : "text-[#6b6f76]"
  );
  const listPanelClass = cn(
    "absolute right-4 top-[4.75rem] z-30 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-[28px] animate-scale-in sm:right-5",
    isContentPlus ? "surface-panel-dark text-white" : "surface-panel text-[#17181c]"
  );

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center overflow-hidden",
        isContentPlus ? "bg-[rgba(8,10,13,0.96)]" : "bg-[hsl(var(--blur-overlay))] backdrop-blur-xl"
      )}
    >
      {blurEnabled && (
        <>
          <div
            ref={blur1Ref}
            className="absolute left-1/2 top-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2 scale-[1.18] -z-10"
            style={{
              display: 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(42px) saturate(0.92) brightness(0.82)',
              opacity: 0,
              transition: 'opacity 0.18s ease-out',
              willChange: 'background-image, opacity',
              backgroundColor: '#000'
            }}
          />
          <div
            ref={blur2Ref}
            className="absolute left-1/2 top-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2 scale-[1.18] -z-10"
            style={{
              display: 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(42px) saturate(0.92) brightness(0.82)',
              opacity: 0,
              transition: 'opacity 0.18s ease-out',
              willChange: 'background-image, opacity',
              backgroundColor: '#000'
            }}
          />
        </>
      )}

      <div className="absolute left-4 top-4 z-30 sm:left-5 sm:top-5">
        <button
          type="button"
          onClick={onClose}
          className={floatingButtonClass}
          aria-label="Close viewer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="absolute right-4 top-4 z-30 flex items-center gap-2 sm:right-5 sm:top-5">
        {currentMedia?.type === 'image' && (
          <div className="relative">
            <DescriptionPanel
              isOpen={showDescription}
              description={currentMedia.description || ''}
              imageUrl={currentMedia.url}
              isLoading={isAnalyzing}
              onClose={() => setShowDescription(false)}
            />
            <button
              type="button"
              onClick={() => setShowDescription(!showDescription)}
              className={floatingButtonClass}
              aria-label="Toggle AI description"
              aria-pressed={showDescription}
            >
              <Sparkles className="h-4 w-4" />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowList(!showList)}
          className={floatingButtonClass}
          aria-label="Toggle media list"
          aria-pressed={showList}
        >
          <List className="h-4 w-4" />
        </button>

        <div className={floatingPillClass}>
          <span className={metaLabelClass}>Item</span>
          <span className="text-sm font-semibold">
            {String(currentIndex + 1).padStart(2, '0')} / {String(media.length).padStart(2, '0')}
          </span>
        </div>
      </div>

      {showList && (
        <div className={listPanelClass}>
          <div className={cn(
            "flex items-center justify-between border-b px-4 py-3",
            isContentPlus ? "border-white/10" : "border-black/[0.08]"
          )}>
            <div>
              <p className={metaLabelClass}>Queue</p>
              <p className="mt-1 text-sm font-semibold">Media list</p>
            </div>
            <span className={cn("text-xs", isContentPlus ? "text-white/[0.55]" : "text-[#6b6f76]")}>
              {media.length} items
            </span>
          </div>

          <ul className="max-h-[60vh] overflow-y-auto p-2">
            {media.map((item, index) => {
              const isActive = index === currentIndex;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onIndexChange(index);
                      setShowList(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[20px] px-3 py-3 text-left transition-colors",
                      isContentPlus
                        ? isActive
                          ? "bg-white/[0.12]"
                          : "hover:bg-white/[0.08]"
                        : isActive
                          ? "bg-black/[0.06]"
                          : "hover:bg-black/[0.04]"
                    )}
                  >
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-[0.68rem] font-semibold uppercase tracking-[0.16em]",
                      isContentPlus
                        ? isActive
                          ? "border-white/[0.18] bg-white/10 text-white"
                          : "border-white/10 bg-white/5 text-white/70"
                        : isActive
                          ? "border-black/10 bg-black/[0.06] text-[#17181c]"
                          : "border-black/[0.08] bg-white/[0.55] text-[#6b6f76]"
                    )}>
                      {item.type === 'video' ? 'VID' : 'IMG'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{item.name}</p>
                      <p className={cn("mt-1 text-xs", isContentPlus ? "text-white/[0.55]" : "text-[#6b6f76]")}>
                        {item.type === 'video' ? 'Video file' : 'Image file'}
                      </p>
                    </div>

                    <span className={cn("text-xs font-medium", isContentPlus ? "text-white/[0.55]" : "text-[#6b6f76]")}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {media.length > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrev}
            className={cn("absolute left-4 top-1/2 z-20 -translate-y-1/2 sm:left-6 sm:h-14 sm:w-14", floatingButtonClass)}
            aria-label="Previous media"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={goToNext}
            className={cn("absolute right-4 top-1/2 z-20 -translate-y-1/2 sm:right-6 sm:h-14 sm:w-14", floatingButtonClass)}
            aria-label="Next media"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </>
      )}

      <div className="relative z-10 flex w-full items-center justify-center px-14 sm:px-24">
        {currentMedia?.type === 'image' ? (
          <div className={cn("relative inline-block animate-fade-in", !isContentPlus && `frame-${frameVariant}`)}>
            <img
              src={currentMedia.url}
              alt={currentMedia.name}
              className={cn(
                "max-h-[82vh] max-w-[92vw] object-contain",
                isContentPlus ? "rounded-[28px] shadow-[0_28px_80px_rgba(0,0,0,0.38)]" : ""
              )}
            />
          </div>
        ) : currentMedia?.type === 'video' ? (
          <div className={cn("relative inline-block animate-fade-in", !isContentPlus && `frame-${frameVariant}`)}>
            <video
              ref={videoRef}
              src={currentMedia.url}
              controls
              className={cn(
                "max-h-[82vh] max-w-[92vw]",
                isContentPlus ? "rounded-[28px] shadow-[0_28px_80px_rgba(0,0,0,0.38)]" : ""
              )}
            />
          </div>
        ) : null}
      </div>

      {(showList || isContentPlus) && (
        <div
          className="fixed inset-0 z-[5]"
          onClick={() => {
            if (showList) {
              setShowList(false);
            }
            if (isContentPlus) {
              onClose();
            }
          }}
        />
      )}
    </div>
  );
};

export default MediaViewer;
