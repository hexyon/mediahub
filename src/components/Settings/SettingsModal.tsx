import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DesignStyle, FrameVariant, frameVariants } from './FrameVariants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFrame: FrameVariant;
  onFrameChange: (frame: FrameVariant) => void;
  designStyle: DesignStyle;
  onDesignStyleChange: (style: DesignStyle) => void;
}

const SettingsModal = ({
  isOpen,
  onClose,
  currentFrame,
  onFrameChange,
  designStyle,
  onDesignStyleChange,
}: SettingsModalProps) => {
  if (!isOpen) return null;

  const optionCardClass = (active: boolean) =>
    cn(
      "relative rounded-[26px] border px-5 py-5 text-left transition-all duration-200",
      active
        ? "border-[#17181c] bg-[#17181c] text-white shadow-[0_18px_44px_rgba(23,24,28,0.16)]"
        : "border-black/[0.08] bg-white/70 text-[#17181c] hover:bg-white/[0.92] hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
    );

  return (
    <>
      <div className="fixed inset-0 z-50 bg-[rgba(13,15,19,0.28)] backdrop-blur-xl" onClick={onClose} />

      <div className="surface-panel fixed left-1/2 top-1/2 z-50 w-[min(42rem,calc(100vw-2rem))] max-h-[80vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[32px]">
        <div className="flex items-start justify-between gap-4 border-b border-black/[0.08] px-6 py-6">
          <div>
            <p className="panel-label">Viewer</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#17181c]">
              Presentation
            </h2>
            <p className="mt-2 max-w-md text-sm text-[#666b74]">
              Choose the amount of interface chrome around the media and add a frame only when it helps the work.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="control-pill h-11 w-11 p-0"
            aria-label="Close settings"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[calc(80vh-118px)] overflow-y-auto px-6 py-6">
          <section>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="panel-label">Mode</p>
                <p className="mt-2 text-sm text-[#666b74]">
                  Default keeps the full control set. Content Plus trims the viewer down.
                </p>
              </div>
            </div>
            <hr className="section-rule" />

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(['default', 'contentplus'] as DesignStyle[]).map((style) => {
                const active = designStyle === style;

                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => onDesignStyleChange(style)}
                    className={optionCardClass(active)}
                  >
                    {active && (
                      <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.12]">
                        <Check className="h-4 w-4" />
                      </div>
                    )}

                    <p className={cn("text-sm font-semibold", active ? "text-white" : "text-[#17181c]")}>
                      {style === 'default' ? 'Default' : 'Content Plus'}
                    </p>
                    <p className={cn("mt-2 text-sm leading-6", active ? "text-white/[0.72]" : "text-[#666b74]")}>
                      {style === 'default'
                        ? 'Viewer controls, list access, and AI notes stay visible and easy to reach.'
                        : 'A darker, quieter presentation that lets the media dominate the frame.'}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mt-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="panel-label">Frame</p>
                <p className="mt-2 text-sm text-[#666b74]">
                  Keep it off for the cleanest look, or use a restrained surround for more atmosphere.
                </p>
              </div>
            </div>
            <hr className="section-rule" />

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {frameVariants.map((variant) => {
                const active = currentFrame === variant.id;

                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => onFrameChange(active ? 'none' : variant.id)}
                    className={optionCardClass(active)}
                  >
                    {active && (
                      <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.12]">
                        <Check className="h-4 w-4" />
                      </div>
                    )}

                    <div className={cn(
                      "mb-4 rounded-[22px] border p-4",
                      active ? "border-white/10 bg-white/[0.08]" : "border-black/[0.06] bg-[#f6f2eb]"
                    )}>
                      <div className={cn(
                        "flex aspect-square items-center justify-center rounded-[18px]",
                        active ? "bg-white/[0.08]" : "bg-white/[0.65]"
                      )}>
                        <div className={cn("h-3/4 w-3/4 bg-white shadow-sm", variant.cssClass)} />
                      </div>
                    </div>

                    <p className={cn("text-sm font-semibold", active ? "text-white" : "text-[#17181c]")}>
                      {variant.name}
                    </p>
                    <p className={cn("mt-2 text-sm leading-6", active ? "text-white/[0.72]" : "text-[#666b74]")}>
                      {variant.description}
                    </p>
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
