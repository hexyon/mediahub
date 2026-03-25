import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DescriptionPanelProps {
  isOpen: boolean;
  description: string;
  imageUrl: string;
  isLoading: boolean;
  onClose: () => void;
}

const DescriptionPanel = ({
  isOpen,
  description,
  imageUrl,
  isLoading,
  onClose,
}: DescriptionPanelProps) => {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "absolute right-0 top-[calc(100%+0.75rem)] isolate box-border w-[min(30rem,calc(100vw-2rem))] overflow-hidden rounded-[28px] border border-white/10 shadow-[0_26px_70px_rgba(0,0,0,0.28)] animate-slide-in-left",
        "lg:right-[calc(100%+1rem)] lg:top-0"
      )}
      style={{
        background: 'rgba(15, 18, 24, 0.78)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        aria-hidden="true"
        className="absolute inset-[-24px]"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          filter: 'blur(24px) saturate(0.85) brightness(0.6)',
          transform: 'scale(1.08)',
          opacity: 1,
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(18, 21, 27, 0.3) 0%, rgba(10, 12, 16, 0.9) 100%)',
        }}
      />

      <div className="relative z-[1]">
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/[0.45]">
              AI Note
            </p>
            <h3 className="mt-1 text-sm font-semibold text-white/[0.92]">
              Image description
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            aria-label="Close AI description"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex min-h-[220px] flex-col items-start justify-end gap-4 px-5 py-5">
            <div
              className="h-4 w-4 rounded-full border-2 border-white/80 border-t-transparent"
              style={{ animation: 'spin 0.8s linear infinite' }}
            />
            <p className="max-w-[18rem] text-sm text-white/70">
              Generating a concise read of the image.
            </p>
          </div>
        ) : (
          <div className="min-h-[220px] px-5 py-5">
            <p
              className="max-w-[24rem] text-balance text-[clamp(1.05rem,2vw,1.35rem)] leading-[1.6] text-white/90"
              style={{ fontFamily: description ? "'Neue Montreal', 'Manrope', sans-serif" : "'Manrope', system-ui, sans-serif" }}
            >
              {description || 'Open this panel on any image to generate a calm, readable description.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DescriptionPanel;
