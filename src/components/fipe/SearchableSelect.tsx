import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  codigo: string | number;
  nome: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Selecione...',
  label,
  disabled = false,
  loading = false
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(() => 
    options.find(o => String(o.codigo) === value),
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const normalizedSearch = search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return options.filter(o => {
      const normalizedName = o.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return normalizedName.includes(normalizedSearch);
    });
  }, [options, search]);

  // Reset highlight when filtered options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredOptions.length]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-option]');
      const highlightedItem = items[highlightedIndex];
      if (highlightedItem) {
        highlightedItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback((option: Option) => {
    onChange(String(option.codigo));
    setIsOpen(false);
    setSearch('');
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (isOpen && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        } else {
          setIsOpen(true);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearch('');
        break;
    }
  }, [disabled, isOpen, filteredOptions, highlightedIndex, handleSelect]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  }, [onChange]);

  const openDropdown = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [disabled]);

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const normalizedText = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const index = normalizedText.indexOf(normalizedQuery);
    
    if (index === -1) return text;
    
    return (
      <>
        {text.slice(0, index)}
        <span className="bg-primary/30 text-primary font-bold">
          {text.slice(index, index + query.length)}
        </span>
        {text.slice(index + query.length)}
      </>
    );
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">
          {label}
        </label>
      )}
      <div ref={containerRef} className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={openDropdown}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            "w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-left",
            "flex items-center justify-between gap-2",
            "focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors",
            disabled && "opacity-50 cursor-not-allowed",
            isOpen && "border-primary ring-1 ring-primary"
          )}
        >
          <span className={cn(
            "truncate",
            !selectedOption && "text-muted-foreground"
          )}>
            {loading ? 'Carregando...' : selectedOption?.nome || placeholder}
          </span>
          <div className="flex items-center gap-1">
            {value && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X size={14} className="text-muted-foreground" />
              </button>
            )}
            <ChevronDown 
              size={16} 
              className={cn(
                "text-muted-foreground transition-transform",
                isOpen && "rotate-180"
              )} 
            />
          </div>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-fade-in">
            {/* Search Input */}
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite para filtrar..."
                  className="w-full bg-muted/50 border-0 rounded-lg pl-9 pr-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Options List */}
            <div 
              ref={listRef}
              className="max-h-48 overflow-y-auto overscroll-contain"
            >
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-6 text-center text-muted-foreground text-sm">
                  Nenhum resultado encontrado
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <button
                    key={option.codigo}
                    type="button"
                    data-option
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={cn(
                      "w-full px-4 py-3 text-left text-sm flex items-center justify-between gap-2",
                      "transition-colors",
                      index === highlightedIndex && "bg-muted",
                      String(option.codigo) === value && "bg-primary/10 text-primary"
                    )}
                  >
                    <span className="truncate">
                      {highlightMatch(option.nome, search)}
                    </span>
                    {String(option.codigo) === value && (
                      <Check size={14} className="text-primary flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Results count */}
            {options.length > 10 && (
              <div className="px-3 py-2 border-t border-border text-[10px] text-muted-foreground text-center">
                {filteredOptions.length} de {options.length} opções
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
