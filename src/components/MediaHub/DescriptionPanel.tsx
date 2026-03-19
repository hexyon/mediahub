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
        "absolute top-0 right-[calc(100%+8px)]",
        "isolate overflow-hidden rounded-xl shadow-elevated",
        "w-[250px] h-[250px]",
        "animate-slide-in-left box-border"
      )}
      style={{
        background: 'rgba(32, 24, 20, 0.32)',
        boxShadow: '0 18px 42px rgba(0, 0, 0, 0.22)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        aria-hidden="true"
        className="absolute inset-[-36px]"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          filter: 'blur(40px) saturate(0.9) brightness(0.72)',
          transform: 'scale(1.16)',
          opacity: 0.5,
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 32%, rgba(22,18,16,0.26) 100%)',
          backdropFilter: 'blur(18px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(18px) saturate(1.2)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -24px 48px rgba(0,0,0,0.12)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at top left, rgba(255,255,255,0.12), transparent 42%), linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0))',
        }}
      />

      {isLoading ? (
        <div className="relative z-[1] flex h-full items-start gap-2 p-4">
          <div
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            style={{ animation: 'spin 0.8s linear infinite' }}
          />
        </div>
      ) : description ? (
        <div
          className="relative z-[1] flex h-full items-center justify-center overflow-hidden p-4 box-border"
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
