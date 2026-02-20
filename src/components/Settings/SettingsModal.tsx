import { cn } from '@/lib/utils';
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

  const activeStyle = { borderColor: '#aaa', background: 'rgba(0,0,0,0.03)' };
  const inactiveStyle = { borderColor: '#e0e0e0', background: '#fff' };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />

      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-2xl max-h-[80vh] overflow-hidden"
        style={{
          background: '#ffffff',
          border: '1px solid #e0e0e0',
          outline: '3px solid #ffffff',
          outlineOffset: '3px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
          borderRadius: '4px',
        }}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #e8e8e8' }}>
          <div>
            <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '1.3rem', fontWeight: 400, letterSpacing: '0.06em', color: '#222' }}>
              Viewer Settings
            </h2>
            <p className="label-smallcaps" style={{ marginTop: '2px' }}>Configuration Panel</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center retro-btn" style={{ color: '#888' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">

          {/* Design Style */}
          <p className="label-smallcaps mb-3">Design Style</p>
          <hr className="section-rule" style={{ marginTop: 0 }} />
          <div className="grid grid-cols-2 gap-4 mb-6">
            {(['default', 'contentplus'] as DesignStyle[]).map((s) => (
              <button
                key={s}
                onClick={() => onDesignStyleChange(s)}
                className="relative p-5 border transition-all duration-200 text-left hover:shadow-md"
                style={{ borderRadius: '3px', ...(designStyle === s ? activeStyle : inactiveStyle) }}
              >
                <h4 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, fontSize: '1rem', color: '#222', marginBottom: '4px' }}>
                  {s === 'default' ? 'Default' : 'Content Plus'}
                </h4>
                <p style={{ fontSize: '0.78rem', color: '#999' }}>
                  {s === 'default' ? 'Standard viewer with all features' : 'Minimal viewer, image-focused'}
                </p>
                {designStyle === s && (
                  <div className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center" style={{ background: '#555', borderRadius: '2px' }}>
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Frame Style */}
          <p className="label-smallcaps mb-3">Frame Style</p>
          <hr className="section-rule" style={{ marginTop: 0 }} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {frameVariants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => onFrameChange(currentFrame === variant.id ? 'none' : variant.id)}
                className="relative p-4 border transition-all duration-200 hover:shadow-md"
                style={{ borderRadius: '3px', ...(currentFrame === variant.id ? activeStyle : inactiveStyle) }}
              >
                <div className="aspect-square mb-3 overflow-hidden flex items-center justify-center" style={{ background: '#f5f5f5', borderRadius: '2px' }}>
                  <div className={cn("w-3/4 h-3/4 bg-white shadow-sm", variant.cssClass)} />
                </div>
                <h4 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '0.88rem', color: '#222', marginBottom: '2px' }}>
                  {variant.name}
                </h4>
                <p style={{ fontSize: '0.72rem', color: '#999' }}>{variant.description}</p>
                {currentFrame === variant.id && (
                  <div className="absolute top-2 left-2 w-5 h-5 flex items-center justify-center" style={{ background: '#555', borderRadius: '2px' }}>
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsModal;
