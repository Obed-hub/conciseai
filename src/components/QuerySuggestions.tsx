interface QuerySuggestionsProps {
  onSelect: (query: string) => void;
}

const suggestions = [
  "Summarize this PDF",
  "Solve this MCQ",
  "Explain briefly",
  "What is this?",
  "Translate to English",
  "Key takeaways",
  "Compare these",
  "Define this term",
];

const QuerySuggestions = ({ onSelect }: QuerySuggestionsProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto overflow-hidden">
      <div className="flex flex-wrap justify-center gap-2 px-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={suggestion}
            onClick={() => onSelect(suggestion)}
            className="
              px-4 py-2 rounded-full text-sm font-light text-muted-foreground
              transition-all duration-200 press-effect
              bg-background shadow-[3px_3px_6px_hsl(220_20%_85%),-3px_-3px_6px_hsl(0_0%_100%)]
              hover:text-foreground hover:shadow-[4px_4px_8px_hsl(220_20%_82%),-4px_-4px_8px_hsl(0_0%_100%)]
              active:shadow-[inset_2px_2px_4px_hsl(220_20%_85%),inset_-2px_-2px_4px_hsl(0_0%_100%)]
              dark:bg-[hsl(0_0%_100%/0.04)] dark:border dark:border-[hsl(0_0%_100%/0.08)] dark:shadow-none
              dark:hover:bg-[hsl(0_0%_100%/0.08)] dark:hover:text-foreground
              dark:active:bg-[hsl(0_0%_100%/0.02)]
            "
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuerySuggestions;
