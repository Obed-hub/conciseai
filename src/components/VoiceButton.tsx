import { Mic } from 'lucide-react';
import { useState } from 'react';

interface VoiceButtonProps {
  onClick?: () => void;
  isRecording?: boolean;
}

const VoiceButton = ({ onClick, isRecording = false }: VoiceButtonProps) => {
  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3">
      <button
        onClick={onClick}
        className={`
          relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full transition-all duration-300 press-effect
          ${isRecording ? 'scale-110 bg-destructive' : ''}
        `}
        aria-label={isRecording ? "Stop recording" : "Voice input"}
      >
        {/* Gradient ring */}
        <div
          className={`
            absolute inset-0 rounded-full voice-ring opacity-80 transition-opacity duration-300
            ${isRecording ? 'animate-pulse-ring' : ''}
          `}
        />

        {/* Inner circle */}
        <div className={`relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-colors duration-300 ${isRecording ? 'bg-destructive' : 'bg-background dark:bg-card'}`}>
          {isRecording ? (
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-sm" />
          ) : (
            <Mic
              className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300 text-muted-foreground`}
            />
          )}
        </div>
      </button>

      <span className="text-[10px] sm:text-xs text-muted-foreground font-light uppercase tracking-widest">
        {isRecording ? 'Tap to Ask' : 'Try with voice'}
      </span>
    </div>
  );
};

export default VoiceButton;
