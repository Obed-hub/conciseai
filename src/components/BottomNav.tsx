import { Mic, ChevronUp } from 'lucide-react';

interface BottomNavProps {
  onVoiceWorkspaceOpen: () => void;
}

const BottomNav = ({ onVoiceWorkspaceOpen }: BottomNavProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-6 sm:pb-8 pointer-events-none">
      <button
        onClick={onVoiceWorkspaceOpen}
        className="flex flex-col items-center gap-1 pointer-events-auto group"
        aria-label="Open voice workspace"
      >
        <div className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-card dark:bg-[hsl(0_0%_100%/0.06)] border border-transparent dark:border-[hsl(0_0%_100%/0.1)] shadow-md dark:shadow-none transition-all duration-200 group-hover:translate-y-[-2px] group-active:scale-95">
          <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
          <span className="text-xs sm:text-sm text-muted-foreground font-light">Voice Workspace</span>
          <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
        </div>
      </button>
    </div>
  );
};

export default BottomNav;
