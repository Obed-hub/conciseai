import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

const ThemeToggle = ({ isDark, onToggle }: ThemeToggleProps) => {
  return (
    <button
      onClick={onToggle}
      className={`
        flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 press-effect
        ${isDark 
          ? 'bg-[hsl(0_0%_100%/0.06)] border border-[hsl(0_0%_100%/0.1)] text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.1)]'
          : 'bg-background shadow-[4px_4px_8px_hsl(220_20%_85%),-4px_-4px_8px_hsl(0_0%_100%)] text-muted-foreground hover:text-foreground'
        }
      `}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
};

export default ThemeToggle;
