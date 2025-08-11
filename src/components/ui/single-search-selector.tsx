import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SingleSearchSelectorProps {
  options: Array<{ value: string; label: string }>;
  value?: string;
  onSelect: (value: string) => void;  // Changed from onChange to onSelect
  loadOptions?: (search: string) => void;  // Added for dynamic loading
  title?: string;  // Added title prop (used as placeholder)
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
}

const SingleSearchSelector: React.FC<SingleSearchSelectorProps> = ({
  options = [],
  value,
  onSelect,  // Changed from onChange
  loadOptions,  // Added
  title,  // Added - will be used as placeholder
  placeholder,
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  disabled = false,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(option => option.value === value);
  
  // Use title as placeholder if provided
  const displayPlaceholder = title || placeholder || "Select an option...";

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus the search input when dropdown opens
      setTimeout(() => inputRef.current?.focus(), 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Call loadOptions when search query changes (if provided)
  useEffect(() => {
    if (loadOptions && searchQuery) {
      const timeoutId = setTimeout(() => {
        loadOptions(searchQuery);
      }, 300); // Debounce search
      
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, loadOptions]);

  const handleSelect = (selectedValue: string) => {
    onSelect(selectedValue);  // Always call onSelect with the value
    setOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect('');  // Pass empty string to clear
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full justify-between",
          !value && "text-muted-foreground"
        )}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : displayPlaceholder}
        </span>
        <div className="flex items-center gap-1">
          {value && !disabled && (
            <X
              className="h-4 w-4 opacity-50 hover:opacity-100 transition-opacity"
              onClick={handleClear}
            />
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </div>
      </Button>

      {open && (
        <div 
          className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md"
          onKeyDown={handleKeyDown}
        >
          {/* Search Input */}
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              ref={inputRef}
              type="text"
              className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Options List */}
          <div className="max-h-64 overflow-auto py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center px-3 py-2 text-sm outline-none transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    value === option.value && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleSelect(option.value)}
                  role="option"
                  aria-selected={value === option.value}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{option.label}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleSearchSelector;