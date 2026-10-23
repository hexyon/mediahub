import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { MediaItem } from './types';
import DescriptionPanel from './DescriptionPanel';
import MementoFrame from './MementoFrame';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FrameVariant, DesignStyle } from '../Settings/FrameVariants';

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
  const [analysisTimeout, setAnalysisTimeoutState] = useState<NodeJS.Timeout | null>(null);
  const [preloadedImages, setPreloadedImages] = useState<{ [key: number]: HTMLImageElement }>({});
  const [hideLeftArrow, setHideLeftArrow] = useState(false);
  const [hideRightArrow, setHideRightArrow] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentMedia = media[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setHideLeftArrow(true);
        setHideRightArrow(false);
        onIndexChange((currentIndex + 1) % media.length);
      } else if (e.key === 'ArrowLeft') {
        setHideRightArrow(true);
        setHideLeftArrow(false);
        onIndexChange((currentIndex - 1 + media.length) % media.length);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, media.length, onIndexChange, onClose]);

  useEffect(() => {
    if (videoRef.current && currentMedia?.type === 'video') {
      videoRef.current.play();
    }
  }, [currentIndex, currentMedia]);

  useEffect(() => {
    if (!blurEnabled) return;

    const preloadAdjacentImages = () => {
      const prevIndex = (currentIndex - 1 + media.length) % media.length;
      const nextIndex = (currentIndex + 1) % media.length;

      [prevIndex, nextIndex].forEach(idx => {
        if (media[idx]?.type === 'image' && !preloadedImages[idx]) {
          const img = new Image();
          img.src = media[idx].url;
          setPreloadedImages(prev => ({ ...prev, [idx]: img }));
        }
      });
    };

    preloadAdjacentImages();
  }, [currentIndex, blurEnabled, media, preloadedImages]);

  useEffect(() => {
    if (analysisTimeout) {
      clearTimeout(analysisTimeout);
      setAnalysisTimeoutState(null);
    }

    if (showDescription && currentMedia?.type === 'image' && !currentMedia.description && !isAnalyzing) {
      const timeout = setTimeout(() => {
        analyzeCurrentImage();
      }, 3000);
      setAnalysisTimeoutState(timeout);
    }

    return () => {
      if (analysisTimeout) {
        clearTimeout(analysisTimeout);
      }
    };
  }, [showDescription, currentIndex, currentMedia]);

  const analyzeCurrentImage = async () => {
    if (!currentMedia || currentMedia.type !== 'image' || isAnalyzing) return;

    setIsAnalyzing(true);
    const requestIndex = currentIndex;

    try {
      const { data, error } = await supabase.functions.invoke('analyze-image', {
        body: { imageData: currentMedia.url }
      });

      if (requestIndex !== currentIndex) {
        console.log('Discarding outdated analysis result');
        return;
      }

      if (error) {
        console.error('Error analyzing image:', error);
        toast.error('Failed to analyze image');
        return;
      }

      if (data?.description) {
        onUpdateDescription(currentMedia.id, data.description);
      }
    } catch (err) {
      console.error('Error calling analyze-image:', err);
      toast.error('Failed to connect to AI service');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToggleDescription = () => {
    setShowDescription(!showDescription);
  };

  const goToPrev = () => {
    setHideRightArrow(true);
    setHideLeftArrow(false);
    onIndexChange((currentIndex - 1 + media.length) % media.length);
  };

  const goToNext = () => {
    setHideLeftArrow(true);
    setHideRightArrow(false);
    onIndexChange((currentIndex + 1) % media.length);
  };

  const isContentPlus = designStyle === 'contentplus';



  return (
    <div className={cn(
      "fixed inset-0 z-50 isolate overflow-hidden flex items-center justify-center",
      isContentPlus ? "bg-[rgba(0,0,0,0.98)]" : "bg-[hsl(var(--blur-overlay))]"
    )}>
      {/* Match PhotoGallery's persistent background-image transition. */}
      {blurEnabled && (
        <div
          aria-hidden="true"
          className="gallery-background-blur"
          style={{
            backgroundImage: currentMedia?.type === 'image' ? `url("${currentMedia.url}")` : 'none',
            opacity: currentMedia?.type === 'image' ? 0.9 : 0,
          }}
        />
      )}

      {/* Exit button */}
      {!isContentPlus && (
        <button
          onClick={onClose}
          className="absolute top-5 left-5 w-[50px] h-[50px] z-10"
          style={{
            background: "url('/exit.png') no-repeat",
            backgroundSize: 'contain',
            border: 'none',
            outline: 'none'
          }}
        />
      )}

      {/* Index indicator with description panel */}
      {!isContentPlus && (
        <div className="absolute top-5 right-5 flex items-center z-10">
          <div className="relative flex items-center">
            <DescriptionPanel
              isOpen={showDescription}
              description={currentMedia?.description || ''}
              imageUrl={currentMedia?.url || ''}
              isLoading={isAnalyzing}
              onClose={() => setShowDescription(false)}
            />
            {currentMedia?.type === 'image' && (
              <button
                onClick={handleToggleDescription}
                className="film-counter cursor-pointer mr-2 flex items-center justify-center"
                style={{ outline: 'none', minWidth: '40px' }}
                title="AI Description"
                aria-label="AI Description"
              >
                <svg width="7" height="15" viewBox="149 79 128 276" fill="currentColor" style={{ display: 'block' }} aria-hidden="true">
                  <path d="M207.8 348.4C228.1 341.7 248.3 329.1 270.8 309.3L275.1 305.5L271.3 300.3C266.8 294 267.5 294.1 260.9 298.6C253.4 303.7 241.9 309.1 237.1 309.7C229.1 310.8 229.5 306.6 241 264C258.2 199.8 259.3 191.1 250.9 182.7C244.5 176.4 225.8 180.5 198.6 194.2C182.7 202.2 151 223.1 151 225.6C151 226.7 157.5 237 158 236.7C158.3 236.6 162.3 234.5 167 232.1C177.3 226.8 187.1 223 190.6 223C195.4 223 196 219.7 180.3 283.9C169 330.6 168.5 339.6 177.3 347.8C182.5 352.7 194.3 353 207.8 348.4ZM248.3 143C265.6 136.5 273.9 120.1 269 102C263.7 82.2 227.3 81.1 211.7 100.2C202.9 110.9 202.2 129.2 210.3 137.8C217.6 145.7 234.9 148 248.3 143Z" />
                </svg>
              </button>
            )}
            <button
              onClick={() => setShowList(!showList)}
              className="film-counter cursor-pointer"
              style={{ outline: 'none' }}
            >
              {String(currentIndex + 1).padStart(2, '0')}
            </button>
          </div>
        </div>
      )}

      {/* Media list dropdown */}
      {!isContentPlus && showList && (
        <div
          className="absolute top-[72px] right-5 bg-white rounded-none shadow-elevated max-h-[60vh] overflow-y-auto animate-scale-in min-w-[220px] z-20"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#D1D1D6 transparent',
            minWidth: '240px',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '4px',
            boxShadow: '0 20px 48px rgba(0, 0, 0, 0.14), 0 2px 8px rgba(0, 0, 0, 0.06)',
          }}
        >
          <style>{`
            .absolute.top-\\[72px\\].right-5::-webkit-scrollbar { width: 4px; }
            .absolute.top-\\[72px\\].right-5::-webkit-scrollbar-track { background: transparent; }
            .absolute.top-\\[72px\\].right-5::-webkit-scrollbar-thumb { background-color: #D1D1D6; border-radius: 2px; }
            .absolute.top-\\[72px\\].right-5::-webkit-scrollbar-thumb:hover { background-color: #B5B5BD; }
          `}</style>
          <div className="sticky top-0 z-10 px-4 pt-3.5 pb-3 bg-white">
            <span
              style={{
                fontFamily: "'DM Serif Display', 'Times New Roman', serif",
                fontSize: '19px',
                fontWeight: 400,
                fontStyle: 'normal',
                letterSpacing: '0.01em',
                lineHeight: 1,
                color: '#111',
              }}
            >
              Contents
            </span>
          </div>
          <ul className="py-0">
            {media.map((item, index) => (
              <li
                key={item.id}
                onClick={() => { onIndexChange(index); setShowList(false); }}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2.5 cursor-pointer",
                  "hover:bg-[#F5F5F7] transition-colors",
                  "border-b border-[#E0E0E0]",
                  index === currentIndex
                    ? "!border-t-2 !border-t-black !border-b-2 !border-b-black"
                    : index === media.length - 1 && "!border-b-0",
                  (index === 0 || index === media.length - 1) && "bg-[#FAFAFA]"
                )}
              >
                <span className="font-semibold text-sm text-[#111] pr-2 border-r border-[#C8C8C8]">{item.type === 'video' ? 'Video' : 'Image'}</span>
                <span className="text-[#6E6E73] text-sm tabular-nums">{index + 1}.</span>
                <span className="text-sm truncate flex-1 text-[#111]">{item.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation arrows — glassmorphism wet design */}
      {media.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            onMouseEnter={() => setHideLeftArrow(false)}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.25) 100%)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.15) 100%)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            }}
            onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.95)'; }}
            onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'; }}
            className={cn("absolute left-6 z-10", hideLeftArrow && "opacity-0")}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.15) 100%)',
              border: 'none',
              outline: 'none',
              boxShadow: '0 4px 24px rgba(0,0,0,0.18), 0 1.5px 6px rgba(0,0,0,0.10)',
              backdropFilter: 'blur(18px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(18px) saturate(1.8)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease-in-out',
              padding: 0,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M6.5 1.5 L2.5 5 L6.5 8.5" stroke="rgba(30,30,40,0.75)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            onClick={goToNext}
            onMouseEnter={() => setHideRightArrow(false)}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.25) 100%)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.15) 100%)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            }}
            onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.95)'; }}
            onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'; }}
            className={cn("absolute right-6 z-10", hideRightArrow && "opacity-0")}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.15) 100%)',
              border: 'none',
              outline: 'none',
              boxShadow: '0 4px 24px rgba(0,0,0,0.18), 0 1.5px 6px rgba(0,0,0,0.10)',
              backdropFilter: 'blur(18px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(18px) saturate(1.8)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease-in-out',
              padding: 0,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M3.5 1.5 L7.5 5 L3.5 8.5" stroke="rgba(30,30,40,0.75)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}

      {/* Media display with frame variants */}
      <div className="relative z-[1] animate-fade-in flex items-center justify-center">
        {currentMedia && !isContentPlus && frameVariant === 'memento' ? (
          <MementoFrame key={currentMedia.id} media={currentMedia} />
        ) : currentMedia?.type === 'image' ? (
          <div className={cn("relative inline-block", !isContentPlus && `frame-${frameVariant}`)}>
            <img
              src={currentMedia.url}
              alt={currentMedia.name}
              className={cn(
                "block w-auto h-auto object-contain",
                isContentPlus
                  ? "max-w-[90vw] max-h-[90vh] rounded-xl shadow-[0_24px_48px_rgba(0,0,0,0.4)]"
                  : "max-w-[90vw] max-h-[90vh]"
              )}
            />
          </div>
        ) : currentMedia?.type === 'video' ? (
          <div className={cn("relative inline-block", !isContentPlus && `frame-${frameVariant}`)}>
            <video
              ref={videoRef}
              src={currentMedia.url}
              controls
              className={cn(
                "block w-auto h-auto",
                isContentPlus
                  ? "max-w-[90vw] max-h-[90vh] rounded-xl shadow-[0_24px_48px_rgba(0,0,0,0.4)]"
                  : "max-w-[90vw] max-h-[90vh]"
              )}
            />
          </div>
        ) : null}
      </div>

      {/* Click outside to close list or viewer in ContentPlus mode */}
      {(showList || isContentPlus) && (
        <div
          className="fixed inset-0 z-[1]"
          onClick={() => {
            if (showList) setShowList(false);
            if (isContentPlus) onClose();
          }}
        />
      )}
    </div>
  );
};

export default MediaViewer;
