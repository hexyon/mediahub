import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { MediaItem } from './types';
import DescriptionPanel from './DescriptionPanel';
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
  const [currentBlurIndex, setCurrentBlurIndex] = useState(0);
  const [preloadedImages, setPreloadedImages] = useState<{ [key: number]: HTMLImageElement }>({});
  const [hideLeftArrow, setHideLeftArrow] = useState(false);
  const [hideRightArrow, setHideRightArrow] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const blur1Ref = useRef<HTMLDivElement>(null);
  const blur2Ref = useRef<HTMLDivElement>(null);
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
    if (!blurEnabled || !currentMedia) return;

    if (currentMedia.type === 'image') {
      const nextBlurIndex = 1 - currentBlurIndex;
      const blurRefs = [blur1Ref, blur2Ref];
      const nextBlur = blurRefs[nextBlurIndex].current;
      const currentBlur = blurRefs[currentBlurIndex].current;

      if (nextBlur) {
        nextBlur.style.backgroundImage = `url(${currentMedia.url})`;
        nextBlur.style.display = 'block';
        nextBlur.style.opacity = '0.9';
      }
      if (currentBlur) {
        currentBlur.style.opacity = '0';
      }
      setCurrentBlurIndex(nextBlurIndex);
    } else if (currentMedia.type === 'video') {
      [blur1Ref, blur2Ref].forEach(ref => {
        if (ref.current) {
          ref.current.style.display = 'block';
          ref.current.style.opacity = '0';
        }
      });
    }
  }, [currentIndex, currentMedia, blurEnabled]);

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

  // Shared arrow button base style — matches MediaHub (Updated) circle exactly
  const arrowBaseStyle: React.CSSProperties = {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: isContentPlus ? 'rgba(255,255,255,0.15)' : 'rgba(255, 255, 255, 0.9)',
    border: 'none',
    outline: 'none',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease-in-out',
    padding: 0,
  };

  // SVG chevron — left pointing
  const ChevronLeft = () => (
    <svg
      width="10" height="10" viewBox="0 0 10 10"
      fill="none"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <path
        d="M6.5 1.5 L2.5 5 L6.5 8.5"
        stroke={isContentPlus ? '#fff' : '#000'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </svg>
  );

  // SVG chevron — right pointing
  const ChevronRight = () => (
    <svg
      width="10" height="10" viewBox="0 0 10 10"
      fill="none"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <path
        d="M3.5 1.5 L7.5 5 L3.5 8.5"
        stroke={isContentPlus ? '#fff' : '#000'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </svg>
  );

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center",
      isContentPlus ? "bg-[rgba(0,0,0,0.98)]" : "bg-[hsl(var(--blur-overlay))]"
    )}>
      {/* Blur backgrounds */}
      {blurEnabled && (
        <>
          <div
            ref={blur1Ref}
            className="absolute top-1/2 left-1/2 w-[120%] h-[120%] -translate-x-1/2 -translate-y-1/2 scale-[1.2] -z-10"
            style={{
              display: 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(25px) brightness(0.85)',
              opacity: 0,
              transition: 'opacity 0.15s ease-out',
              willChange: 'background-image, opacity',
              backgroundColor: '#000'
            }}
          />
          <div
            ref={blur2Ref}
            className="absolute top-1/2 left-1/2 w-[120%] h-[120%] -translate-x-1/2 -translate-y-1/2 scale-[1.2] -z-10"
            style={{
              display: 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(25px) brightness(0.85)',
              opacity: 0,
              transition: 'opacity 0.15s ease-out',
              willChange: 'background-image, opacity',
              backgroundColor: '#000'
            }}
          />
        </>
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
                className={cn(
                  "w-8 h-8 mr-2 flex items-center justify-center cursor-pointer",
                  "border-[1.5px] border-black"
                )}
                style={{
                  borderRadius: 0,
                  background: showDescription ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  fontFamily: "'Times New Roman', serif",
                  fontSize: '16px',
                  fontStyle: 'italic',
                  fontWeight: 'normal',
                  color: '#000'
                }}
                title="AI Description"
              >
                i
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
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#D1D1D6 transparent' }}
        >
          <style>{`
            .absolute.top-\\[72px\\].right-5::-webkit-scrollbar { width: 4px; }
            .absolute.top-\\[72px\\].right-5::-webkit-scrollbar-track { background: transparent; }
            .absolute.top-\\[72px\\].right-5::-webkit-scrollbar-thumb { background-color: #D1D1D6; border-radius: 2px; }
            .absolute.top-\\[72px\\].right-5::-webkit-scrollbar-thumb:hover { background-color: #B5B5BD; }
          `}</style>
          <div className="px-3 py-2 border-b border-[#E0E0E0] bg-[#F5F5F7]">
            <span className="font-semibold text-sm text-[#111] italic">List</span>
          </div>
          <ul className="py-0">
            {media.map((item, index) => (
              <li
                key={item.id}
                onClick={() => { onIndexChange(index); setShowList(false); }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 cursor-pointer",
                  "hover:bg-[#F5F5F7] transition-colors",
                  "border-b border-[#E0E0E0]",
                  index === currentIndex
                    ? "!border-t-2 !border-t-black !border-b-2 !border-b-black"
                    : index === media.length - 1 && "!border-b-0",
                  (index === 0 || index === media.length - 1) && "bg-[#FAFAFA]"
                )}
              >
                <span className="font-semibold text-sm text-[#111]">{item.type === 'video' ? 'Video' : 'Image'}</span>
                <span className="text-[#111] text-sm">{index + 1}.</span>
                <span className="text-sm truncate flex-1 text-[#111]">{item.name}</span>
              </li>
            ))}
          </ul>
          <div className="px-3 py-2 border-t border-[#E0E0E0] bg-[#F5F5F7]">
            <span className="text-xs text-gray-500 font-medium italic">Total: {media.length}</span>
          </div>
        </div>
      )}

      {/* Navigation arrows — white circle + SVG chevron, matching MediaHub (Updated) */}
      {media.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            onMouseEnter={() => setHideLeftArrow(false)}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = isContentPlus ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.95)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = isContentPlus ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.9)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            }}
            onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.95)'; }}
            onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'; }}
            className={cn("absolute left-6 z-10", hideLeftArrow && "opacity-0")}
            style={arrowBaseStyle}
          >
            <ChevronLeft />
          </button>

          <button
            onClick={goToNext}
            onMouseEnter={() => setHideRightArrow(false)}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = isContentPlus ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.95)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = isContentPlus ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.9)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            }}
            onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.95)'; }}
            onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'; }}
            className={cn("absolute right-6 z-10", hideRightArrow && "opacity-0")}
            style={arrowBaseStyle}
          >
            <ChevronRight />
          </button>
        </>
      )}

      {/* Media display with frame variants */}
      <div className="relative z-[1] animate-fade-in flex items-center justify-center">
        {currentMedia?.type === 'image' ? (
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
