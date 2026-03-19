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
      onClick={(e) => e.stopPropagation()}
    >
      <div
        aria-hidden="true"
        className="absolute inset-[-20px]"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          filter: 'blur(28px) saturate(1.08) brightness(0.78)',
          transform: 'scale(1.08)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(18,18,18,0.20) 100%)',
          boxShadow: 'inset 0 0 60px rgba(0,0,0,0.08)',
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
