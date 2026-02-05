import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FrameVariant, frameVariants } from './FrameVariants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFrame: FrameVariant;
  onFrameChange: (frame: FrameVariant) => void;
}

const SettingsModal = ({ isOpen, onClose, currentFrame, onFrameChange }: SettingsModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-2xl max-h-[80vh] bg-white rounded-2xl shadow-elevated overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Viewer Settings</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Frame Style</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {frameVariants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => onFrameChange(currentFrame === variant.id ? 'none' : variant.id)}
                className={cn(
                  "relative p-4 rounded-xl border-2 transition-all duration-200",
                  "hover:shadow-lg hover:scale-105",
                  currentFrame === variant.id
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className={cn("w-3/4 h-3/4 bg-white rounded shadow-sm", variant.cssClass)} />
                </div>
                
                <h4 className="font-semibold text-sm text-gray-900 mb-1">
                  {variant.name}
                </h4>
                <p className="text-xs text-gray-500">
                  {variant.description}
                </p>
                
                {currentFrame === variant.id && (
                  <div className="absolute top-2 left-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
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
