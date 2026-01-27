import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { MediaItem } from './types';
import DescriptionPanel from './DescriptionPanel';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MediaViewerProps {
  media: MediaItem[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  onUpdateDescription: (id: string, description: string) => void;
  blurEnabled: boolean;
}

const MediaViewer = ({
  media,
  currentIndex,
  onIndexChange,
  onClose,
  onUpdateDescription,
  blurEnabled,
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

  // Preload adjacent images for blur
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

  // Update blur background
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

  // Auto-analyze image when description panel opens
  useEffect(() => {
    // Clear any existing timeout
    if (analysisTimeout) {
      clearTimeout(analysisTimeout);
      setAnalysisTimeoutState(null);
    }

    if (showDescription && currentMedia?.type === 'image' && !currentMedia.description && !isAnalyzing) {
      // Wait 3 seconds before analyzing (debounce for quick browsing)
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

      // Only update if we're still on the same image
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(var(--blur-overlay))]">
      {/* Blur backgrounds */}
      {blurEnabled && (
        <>
          <div
            ref={blur1Ref}
            className="absolute top-1/2 left-1/2 w-[120%] h-[120%] -translate-x-1/2 -translate-y-1/2 scale-[1.2]"
            style={{
              display: 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(25px) brightness(0.85)',
              opacity: 0,
              transition: 'opacity 0.15s ease-out',
              willChange: 'background-image, opacity'
            }}
          />
          <div
            ref={blur2Ref}
            className="absolute top-1/2 left-1/2 w-[120%] h-[120%] -translate-x-1/2 -translate-y-1/2 scale-[1.2]"
            style={{
              display: 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(25px) brightness(0.85)',
              opacity: 0,
              transition: 'opacity 0.15s ease-out',
              willChange: 'background-image, opacity'
            }}
          />
        </>
      )}

      {/* Exit button */}
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

      {/* Index indicator with description panel */}
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
                "w-8 h-8 glass shadow-soft mr-2",
                "flex items-center justify-center",
                "hover:scale-105 active:scale-95 transition-all",
                "border-[1.5px] border-black",
                showDescription && "bg-[rgba(255,255,255,0.95)]"
              )}
              style={{
                borderRadius: 0,
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
            className="glass rounded-xl px-4 py-2 shadow-soft text-sm font-medium hover:scale-105 active:scale-95 transition-transform bg-[#f5f5f7] text-black"
            style={{ fontSize: '1.5em' }}
          >
            {currentIndex + 1}
          </button>
        </div>
      </div>

      {/* Media list dropdown */}
      {showList && (
        <div
          className="absolute top-[72px] right-5 bg-white rounded-xl shadow-elevated max-h-[60vh] overflow-y-auto animate-scale-in min-w-[220px] z-20"
        >
          <ul className="py-0">
            {media.map((item, index) => (
              <li
                key={item.id}
                onClick={() => {
                  onIndexChange(index);
                  setShowList(false);
                }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 cursor-pointer",
                  "hover:bg-[#F5F5F7] transition-colors",
                  "border-b border-[#E0E0E0] last:border-b",
                  index === currentIndex && "border-t-2 border-t-black border-b-2 border-b-black"
                )}
              >
                <span className="font-semibold text-sm text-[#111]">
                  {item.type === 'video' ? 'Video' : 'Image'}
                </span>
                <span className="text-[#111] text-sm">{index + 1}.</span>
                <span className="text-sm truncate flex-1 text-[#111]">{item.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation arrows */}
      {media.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            onMouseEnter={() => setHideLeftArrow(false)}
            className={cn(
              "absolute left-6 w-11 h-11 rounded-full flex items-center justify-center z-10 transition-all",
              hideLeftArrow && "opacity-0"
            )}
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
          >
            <div
              className="w-[10px] h-[10px] border-solid border-black opacity-80"
              style={{
                borderWidth: '2px 2px 0 0',
                transform: 'rotate(-135deg) translate(-35%, -50%)',
                transformOrigin: 'center'
              }}
            />
          </button>
          <button
            onClick={goToNext}
            onMouseEnter={() => setHideRightArrow(false)}
            className={cn(
              "absolute right-6 w-11 h-11 rounded-full flex items-center justify-center z-10 transition-all",
              hideRightArrow && "opacity-0"
            )}
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
          >
            <div
              className="w-[10px] h-[10px] border-solid border-black opacity-80"
              style={{
                borderWidth: '2px 2px 0 0',
                transform: 'rotate(45deg) translate(-65%, -50%)',
                transformOrigin: 'center'
              }}
            />
          </button>
        </>
      )}

      {/* Media display */}
      {currentMedia?.type === 'image' ? (
        <img
          src={currentMedia.url}
          alt={currentMedia.name}
          className="max-w-[90%] max-h-[90vh] rounded-2xl shadow-elevated object-contain animate-fade-in z-[1] relative"
        />
      ) : currentMedia?.type === 'video' ? (
        <video
          ref={videoRef}
          src={currentMedia.url}
          controls
          className="max-w-[90%] max-h-[90vh] rounded-[20px] shadow-elevated animate-fade-in z-[1] relative"
        />
      ) : null}

      {/* Click outside to close list */}
      {showList && (
        <div
          className="fixed inset-0 z-[1]"
          onClick={() => setShowList(false)}
        />
      )}
    </div>
  );
};

export default MediaViewer;
