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
        "absolute right-full mr-2 top-0",
        "relative overflow-hidden rounded-xl shadow-elevated",
        "w-[250px] h-[250px]",
        "animate-slide-in-left p-4 box-border"
      )}
      style={{ background: 'rgba(255, 255, 255, 0.08)' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          filter: 'blur(24px) saturate(1.15) brightness(0.82)',
          transform: 'scale(1.14)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(20,20,20,0.22) 100%)',
          backdropFilter: 'saturate(1.1)',
          WebkitBackdropFilter: 'saturate(1.1)',
          border: '1px solid rgba(255,255,255,0.18)',
        }}
      />

      <div className="flex items-center justify-end mb-2">
        {/* Close button is hidden per design */}
      </div>

      {isLoading ? (
        <div className="relative z-[1] flex items-center gap-2 py-3">
          <div
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            style={{ animation: 'spin 0.8s linear infinite' }}
          />
        </div>
      ) : description ? (
        <div
          className="relative z-[1] bg-transparent rounded-lg p-3 h-full overflow-hidden box-border flex items-center justify-center"
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
