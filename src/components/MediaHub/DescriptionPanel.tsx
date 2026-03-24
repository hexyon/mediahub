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
        "w-[500px] h-[500px]",
        "animate-slide-in-left box-border"
      )}
      style={{
        background: '#1b140f',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        aria-hidden="true"
        className="absolute inset-[-20px]"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          filter: 'blur(16px) saturate(1.05) brightness(0.82)',
          transform: 'scale(1.06)',
          opacity: 1,
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(30, 24, 18, 0.32) 0%, rgba(21, 14, 10, 0.82) 100%)',
          boxShadow: 'inset 0 0 60px rgba(0,0,0,0.2)',
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
              fontFamily: "'Geist', sans-serif",
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
