"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bold, Italic, Underline, Palette, Type, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface InlineTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onStyleChange: (styles: Record<string, string>) => void;
  currentStyles: Record<string, string>;
  placeholder?: string;
  multiline?: boolean;
}

export function InlineTextEditor({
  value,
  onChange,
  onStyleChange,
  currentStyles,
  placeholder = "Enter text...",
  multiline = false
}: InlineTextEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSave = () => {
    onChange(localValue);
    setIsEditing(false);
    setShowStylePanel(false);
  };

  const handleCancel = () => {
    setLocalValue(value);
    setIsEditing(false);
    setShowStylePanel(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const updateStyle = (property: string, value: string) => {
    const newStyles = { ...currentStyles, [property]: value };
    onStyleChange(newStyles);
  };

  const toggleStyle = (property: string, value: string, defaultValue: string = 'normal') => {
    const currentValue = currentStyles[property] || defaultValue;
    const newValue = currentValue === value ? defaultValue : value;
    updateStyle(property, newValue);
  };

  if (!isEditing) {
    return (
      <div
        className="group relative cursor-text hover:bg-blue-50 hover:outline-2 hover:outline-blue-200 hover:outline-dashed rounded p-1 transition-all"
        onClick={() => setIsEditing(true)}
        style={currentStyles}
      >
        {value || <span className="text-gray-400 italic">{placeholder}</span>}
        
        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowStylePanel(!showStylePanel);
            }}
            className="bg-blue-500 text-white p-1 rounded shadow text-xs"
          >
            <Type size={12} />
          </button>
        </div>

        {showStylePanel && (
          <div className="absolute top-8 right-0 bg-white border rounded-lg shadow-lg p-3 z-50 min-w-64">
            <div className="grid grid-cols-2 gap-3">
              {/* Font Size */}
              <div>
                <label className="block text-xs font-medium mb-1">Size</label>
                <input
                  type="text"
                  value={currentStyles.fontSize || '16px'}
                  onChange={(e) => updateStyle('fontSize', e.target.value)}
                  className="w-full text-xs border rounded px-2 py-1"
                  placeholder="16px"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-xs font-medium mb-1">Color</label>
                <input
                  type="color"
                  value={currentStyles.color || '#000000'}
                  onChange={(e) => updateStyle('color', e.target.value)}
                  className="w-full h-8 border rounded"
                />
              </div>

              {/* Font Weight */}
              <div>
                <label className="block text-xs font-medium mb-1">Weight</label>
                <select
                  value={currentStyles.fontWeight || 'normal'}
                  onChange={(e) => updateStyle('fontWeight', e.target.value)}
                  className="w-full text-xs border rounded px-2 py-1"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="lighter">Light</option>
                  <option value="bolder">Bolder</option>
                </select>
              </div>

              {/* Text Align */}
              <div>
                <label className="block text-xs font-medium mb-1">Align</label>
                <div className="flex gap-1">
                  {['left', 'center', 'right'].map(align => (
                    <button
                      key={align}
                      onClick={() => updateStyle('textAlign', align)}
                      className={`p-1 border rounded text-xs ${
                        currentStyles.textAlign === align ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                      }`}
                    >
                      {align === 'left' && <AlignLeft size={12} />}
                      {align === 'center' && <AlignCenter size={12} />}
                      {align === 'right' && <AlignRight size={12} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family */}
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1">Font</label>
                <select
                  value={currentStyles.fontFamily || 'inherit'}
                  onChange={(e) => updateStyle('fontFamily', e.target.value)}
                  className="w-full text-xs border rounded px-2 py-1"
                >
                  <option value="inherit">Default</option>
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="Helvetica, sans-serif">Helvetica</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="'Courier New', monospace">Courier New</option>
                  <option value="Inter, sans-serif">Inter</option>
                  <option value="Poppins, sans-serif">Poppins</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
              <button
                onClick={() => setShowStylePanel(false)}
                className="px-3 py-1 text-xs border rounded hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {multiline ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          style={currentStyles}
          className="w-full border-2 border-blue-500 rounded p-2 focus:outline-none resize-none"
          placeholder={placeholder}
          autoFocus
          rows={3}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          style={currentStyles}
          className="w-full border-2 border-blue-500 rounded p-2 focus:outline-none"
          placeholder={placeholder}
          autoFocus
        />
      )}
      
      <div className="absolute -top-8 left-0 flex gap-1 bg-white border rounded shadow p-1">
        <button
          onClick={handleSave}
          className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
        >
          ✓ Save
        </button>
        <button
          onClick={handleCancel}
          className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
        >
          ✕ Cancel
        </button>
      </div>
    </div>
  );
}
