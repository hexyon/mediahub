interface DescriptionPanelProps {
  isOpen: boolean;
  description: string;
  imageUrl: string;
  isLoading: boolean;
}

const DescriptionPanel = ({
  isOpen,
  description,
  imageUrl,
  isLoading,
}: DescriptionPanelProps) => {
  if (!isOpen) return null;

  const backgroundImage = imageUrl || '/background/background.png';
  const hasDescription = description.trim().length > 0;

  return (
    <div
      className="absolute right-full mr-3 top-0 w-[272px] min-h-[228px] animate-slide-in-left"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative min-h-[228px] overflow-hidden rounded-[28px] border border-white/15 shadow-[0_24px_60px_rgba(15,23,42,0.28)]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            filter: 'blur(22px) saturate(0.8) brightness(0.78)',
            transform: 'scale(1.12)',
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.08)_24%,rgba(14,18,28,0.42)_58%,rgba(8,10,16,0.74)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.24),transparent_54%)]" />
        <div className="absolute inset-[1px] rounded-[27px] border border-white/10" />

        <div className="relative flex min-h-[228px] flex-col justify-between p-5">
          <div>
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-white/72 backdrop-blur-md">
              AI SUMMARY
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-3 text-white/80" role="status" aria-live="polite">
              <div
                className="h-4 w-4 rounded-full border border-white/35 border-t-white"
                style={{ animation: 'spin 0.8s linear infinite' }}
              />
              <p
                className="text-sm font-medium tracking-[-0.01em]"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif" }}
              >
                Analyzing image
              </p>
            </div>
          ) : hasDescription ? (
            <p
              className="max-w-[14ch] text-left text-[25px] font-semibold leading-[1.08] tracking-[-0.035em] text-white"
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
                textShadow: '0 8px 30px rgba(0,0,0,0.35)',
              }}
            >
              {description}
            </p>
          ) : (
            <p
              className="max-w-[18ch] text-left text-sm font-medium leading-6 text-white/76"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif" }}
            >
              AI description will appear here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DescriptionPanel;
