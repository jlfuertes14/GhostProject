"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";

interface ComboboxProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  name?: string;
  required?: boolean;
}

export function Combobox({ options = [], value, onChange, placeholder = "Select...", name, required }: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          value={isOpen ? search : value}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
            if (e.target.value === "") {
              onChange(""); // Clear value if input is manually cleared
            }
          }}
          onFocus={() => {
            setIsOpen(true);
            setSearch(""); // Reset search when clicking into it
          }}
          placeholder={placeholder}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#0047AB] focus:border-transparent transition-all text-slate-800 font-medium"
          name={name}
          required={required && !value} // Only require if value is empty
          autoComplete="off"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button 
              type="button" 
              className="text-slate-400 hover:text-slate-600 p-1"
              onClick={() => {
                onChange("");
                setSearch("");
                setIsOpen(false);
              }}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            type="button"
            className="text-slate-400 p-1"
            onClick={() => setIsOpen(!isOpen)}
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length === 0 ? (
            <div className="p-3 text-sm text-slate-500 text-center">No options found.</div>
          ) : (
            <ul className="py-1">
              {filteredOptions.map((opt, i) => (
                <li
                  key={i}
                  className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-slate-100 ${value === opt ? 'bg-blue-50 text-[#0047AB] font-medium' : 'text-slate-700'}`}
                  onClick={() => {
                    onChange(opt);
                    setSearch("");
                    setIsOpen(false);
                  }}
                >
                  <span className="truncate">{opt}</span>
                  {value === opt && <Check className="w-4 h-4 shrink-0" />}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
