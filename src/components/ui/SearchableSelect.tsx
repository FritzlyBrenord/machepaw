"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Sélectionnez...",
  disabled = false,
  className,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opt.sublabel?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 border rounded-lg cursor-pointer transition-all",
          isOpen ? "border-neutral-900 ring-1 ring-neutral-900" : "border-neutral-200",
          disabled ? "bg-neutral-50 cursor-not-allowed opacity-60" : "bg-white hover:border-neutral-300"
        )}
      >
        <span className={cn("truncate text-sm", !selectedOption && "text-neutral-400")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform duration-200", isOpen && "rotate-180")} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-[100] w-full mt-2 bg-white border border-neutral-200 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="p-2 border-b border-neutral-100 flex items-center gap-2 bg-neutral-50/50">
              <Search className="w-4 h-4 text-neutral-400" />
              <input
                autoFocus
                type="text"
                placeholder="Rechercher une ville..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-sm outline-none bg-transparent py-1 border-none focus:ring-0"
                onClick={(e) => e.stopPropagation()}
              />
              {searchTerm && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm("");
                  }}
                  className="p-1 hover:bg-neutral-200 rounded-full transition-colors"
                >
                  <X className="w-3 h-3 text-neutral-500" />
                </button>
              )}
            </div>
            
            <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-all group",
                      value === opt.value 
                        ? "bg-neutral-900 text-white" 
                        : "hover:bg-neutral-50 text-neutral-700 active:scale-[0.98]"
                    )}
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{opt.label}</div>
                      {opt.sublabel && (
                        <div className={cn("text-xs truncate", value === opt.value ? "text-neutral-300" : "text-neutral-400")}>
                          {opt.sublabel}
                        </div>
                      )}
                    </div>
                    {value === opt.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <Check className="w-4 h-4 shrink-0" />
                      </motion.div>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-3 py-10 text-center flex flex-col items-center gap-2">
                   <div className="w-10 h-10 bg-neutral-50 rounded-full flex items-center justify-center">
                      <Search className="w-5 h-5 text-neutral-300" />
                   </div>
                   <p className="text-sm text-neutral-400">Aucun résultat pour "{searchTerm}"</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
