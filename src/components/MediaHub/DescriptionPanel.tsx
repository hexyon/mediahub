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
        "rounded-xl shadow-elevated",
        "w-[230px] h-[230px]",
        "animate-slide-in-left p-4 box-border"
      )}
      style={{
        background: "url('/background/background.png') no-repeat center",
        backgroundSize: 'cover'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-end mb-2">
        {/* Close button is hidden per design */}
      </div>
      
      {isLoading ? (
        <div className="flex items-center gap-2 py-3">
          <div 
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            style={{ animation: 'spin 0.8s linear infinite' }}
          />
          <span className="text-sm text-white">Analyzing...</span>
        </div>
      ) : (
        <div 
          className="bg-transparent rounded-lg p-3 h-full overflow-hidden box-border flex items-center justify-center"
          style={{
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}
        >
          <p 
            className="leading-[1.3] text-white"
            style={{
              fontFamily: "'Pacifico', cursive",
              fontSize: '28px'
            }}
          >
            {description || 'No description available'}
          </p>
        </div>
      )}
    </div>
  );
};

export default DescriptionPanel;
