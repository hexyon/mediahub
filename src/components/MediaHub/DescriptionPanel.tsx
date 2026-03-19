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

  const backgroundImage = imageUrl || '/background/background.png';

  return (
    <div
      className={cn(
        "absolute right-full mr-2 top-0",
        "rounded-xl shadow-elevated",
        "w-[250px] h-[250px]",
        "animate-slide-in-left p-4 box-border",
        "relative isolate overflow-hidden border border-white/10"
      )}
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="absolute -inset-4 rounded-[18px]"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          filter: 'blur(18px) saturate(0.82) brightness(0.68)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      />
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(180deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.06)_20%,rgba(18,24,38,0.34)_55%,rgba(8,10,16,0.6)_100%)]" />
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_56%)]" />
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/8" />

      <div className="relative z-10 flex items-center justify-end mb-2">
        {/* Close button is hidden per design */}
      </div>

      {isLoading ? (
        <div className="relative z-10 flex items-center gap-2 py-3">
          <div
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            style={{ animation: 'spin 0.8s linear infinite' }}
          />
        </div>
      ) : description ? (
        <div
          className="relative z-10 bg-transparent rounded-lg p-3 h-full overflow-hidden box-border flex items-center justify-center"
          style={{
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}
        >
          <p
            className="leading-[1.3] text-white italic"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '30px',
              fontWeight: 900
            }}
          >
            {description}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default DescriptionPanel;
