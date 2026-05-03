import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import { FrameVariant, frameVariants, DesignStyle } from './FrameVariants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFrame: FrameVariant;
  onFrameChange: (frame: FrameVariant) => void;
  designStyle: DesignStyle;
  onDesignStyleChange: (style: DesignStyle) => void;
}

const SettingsModal = ({ isOpen, onClose, currentFrame, onFrameChange, designStyle, onDesignStyleChange }: SettingsModalProps) => {
  if (!isOpen) return null;

  const designOptions: Array<{ id: DesignStyle; title: string; description: string }> = [
    { id: 'default', title: 'Default', description: 'Full viewer controls' },
    { id: 'contentplus', title: 'Content Plus', description: 'Focused media view' },
  ];
  const optionStyle = {
    borderColor: '#d2d2d7',
    background: '#ffffff',
  };
  const activeStyle = {
    borderColor: '#0071e3',
    background: '#f5f5f7',
  };

  return (
    <>
      <div className="fixed inset-0 z-50" style={{ background: 'rgba(0, 0, 0, 0.18)' }} onClick={onClose} />

      <div
        className="fixed top-1/2 left-1/2 z-50 w-[92%] max-w-2xl max-h-[84vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden"
        style={{
          background: '#ffffff',
          border: '1px solid #d2d2d7',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.18)',
          borderRadius: '14px',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', sans-serif",
        }}
      >
        <div className="flex items-start justify-between px-6 py-5" style={{ borderBottom: '1px solid #e5e5ea' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 600, color: '#1d1d1f', lineHeight: 1.2 }}>
              Viewer Settings
            </h2>
            <p style={{ marginTop: '4px', fontSize: '0.86rem', color: '#6e6e73' }}>Appearance</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#e8e8ed] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
            style={{ background: '#f5f5f7', color: '#6e6e73' }}
          >
            <X size={17} strokeWidth={2.2} />
          </button>
        </div>

        <div className="max-h-[calc(84vh-82px)] overflow-y-auto p-6">

          <section>
            <h3 style={{ marginBottom: '12px', fontSize: '0.82rem', fontWeight: 600, color: '#6e6e73' }}>Design Style</h3>
            <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {designOptions.map((option) => {
                const isActive = designStyle === option.id;

                return (
                  <button
                    key={option.id}
                    onClick={() => onDesignStyleChange(option.id)}
                    aria-pressed={isActive}
                    className="relative border p-4 text-left transition-colors hover:bg-[#f5f5f7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
                    style={{ borderRadius: '8px', ...(isActive ? activeStyle : optionStyle) }}
                  >
                    <h4 style={{ fontSize: '0.96rem', fontWeight: 600, color: '#1d1d1f', marginBottom: '4px' }}>
                      {option.title}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: '#6e6e73' }}>{option.description}</p>
                    {isActive && (
                      <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full" style={{ background: '#0071e3', color: '#ffffff' }}>
                        <Check size={13} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h3 style={{ marginBottom: '12px', fontSize: '0.82rem', fontWeight: 600, color: '#6e6e73' }}>Frame Style</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {frameVariants.map((variant) => {
                const isActive = currentFrame === variant.id;

                return (
                  <button
                    key={variant.id}
                    onClick={() => onFrameChange(isActive ? 'none' : variant.id)}
                    aria-pressed={isActive}
                    className="relative border p-3 text-left transition-colors hover:bg-[#f5f5f7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
                    style={{ borderRadius: '8px', ...(isActive ? activeStyle : optionStyle) }}
                  >
                    <div className="mb-3 flex aspect-square items-center justify-center overflow-hidden" style={{ background: '#f5f5f7', borderRadius: '6px' }}>
                      <div className={cn("h-3/4 w-3/4 bg-white", variant.cssClass)} />
                    </div>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1d1d1f', marginBottom: '3px' }}>
                      {variant.name}
                    </h4>
                    <p style={{ fontSize: '0.74rem', color: '#6e6e73' }}>{variant.description}</p>
                    {isActive && (
                      <span className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full" style={{ background: '#0071e3', color: '#ffffff' }}>
                        <Check size={13} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default SettingsModal;
