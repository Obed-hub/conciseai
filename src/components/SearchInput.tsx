import { useState } from 'react';
import { Camera, Mic, Paperclip, Send } from 'lucide-react';

interface SearchInputProps {
  value?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (query: string) => void;
  onCameraClick?: () => void;
  onMicClick?: () => void;
  onFileClick?: () => void;
}

const SearchInput = ({ 
  value,
  onValueChange,
  onSubmit, 
  onCameraClick, 
  onMicClick, 
  onFileClick 
}: SearchInputProps) => {
  const [internalQuery, setInternalQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const query = value !== undefined ? value : internalQuery;
  const setQuery = onValueChange || setInternalQuery;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && onSubmit) {
      onSubmit(query.trim());
      setQuery('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto px-4 sm:px-0">
      <div className="relative">
        {/* Light mode: Neumorphic input */}
        <div className="dark:hidden">
          <div 
            className={`
              flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-full bg-background transition-all duration-300
              ${isFocused 
                ? 'shadow-[inset_4px_4px_8px_hsl(220_20%_85%),inset_-4px_-4px_8px_hsl(0_0%_100%)]' 
                : 'shadow-[8px_8px_16px_hsl(220_20%_82%),-8px_-8px_16px_hsl(0_0%_100%)]'
              }
            `}
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Ask anything..."
              className="flex-1 min-w-0 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none font-light text-base sm:text-lg"
            />
            
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <ActionButton onClick={onCameraClick} ariaLabel="Camera">
                <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
              </ActionButton>
              <ActionButton onClick={onMicClick} ariaLabel="Microphone">
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              </ActionButton>
              <ActionButton onClick={onFileClick} ariaLabel="Attach file">
                <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
              </ActionButton>
              {query.trim() && (
                <button
                  type="submit"
                  className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-primary-foreground bg-primary transition-all duration-200 hover:opacity-90 active:scale-95"
                  aria-label="Send"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dark mode: Glassmorphic input */}
        <div className="hidden dark:block">
          <div 
            className={`
              flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-full transition-all duration-300
              bg-[hsl(0_0%_100%/0.06)] border border-[hsl(0_0%_100%/0.1)] backdrop-blur-xl
              ${isFocused ? 'border-[hsl(0_0%_100%/0.2)] bg-[hsl(0_0%_100%/0.08)]' : ''}
            `}
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Ask anything..."
              className="flex-1 min-w-0 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none font-light text-base sm:text-lg"
            />
            
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <ActionButtonDark onClick={onCameraClick} ariaLabel="Camera">
                <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
              </ActionButtonDark>
              <ActionButtonDark onClick={onMicClick} ariaLabel="Microphone">
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              </ActionButtonDark>
              <ActionButtonDark onClick={onFileClick} ariaLabel="Attach file">
                <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
              </ActionButtonDark>
              {query.trim() && (
                <button
                  type="submit"
                  className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground transition-all duration-200 hover:opacity-90 active:scale-95"
                  aria-label="Send"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

interface ActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  ariaLabel: string;
}

const ActionButton = ({ children, onClick, ariaLabel }: ActionButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
    className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-muted-foreground transition-all duration-200 
      bg-background shadow-[3px_3px_6px_hsl(220_20%_85%),-3px_-3px_6px_hsl(0_0%_100%)]
      hover:text-foreground active:shadow-[inset_2px_2px_4px_hsl(220_20%_85%),inset_-2px_-2px_4px_hsl(0_0%_100%)] active:scale-95"
  >
    {children}
  </button>
);

const ActionButtonDark = ({ children, onClick, ariaLabel }: ActionButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
    className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-muted-foreground transition-all duration-200
      bg-[hsl(0_0%_100%/0.06)] border border-[hsl(0_0%_100%/0.1)]
      hover:text-foreground hover:bg-[hsl(0_0%_100%/0.1)] active:bg-[hsl(0_0%_100%/0.04)] active:scale-95"
  >
    {children}
  </button>
);

export default SearchInput;
