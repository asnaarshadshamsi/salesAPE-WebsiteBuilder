"use client";

import React, { useState } from 'react';
import { Type, Plus, X, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FontManagerProps {
  availableFonts: string[];
  activeFonts: string[];
  onAddFont: (font: string) => void;
  onRemoveFont?: (font: string) => void;
  selectedFont?: string;
  onSelectFont?: (font: string) => void;
}

export function FontManager({
  availableFonts,
  activeFonts,
  onAddFont,
  onRemoveFont,
  selectedFont,
  onSelectFont
}: FontManagerProps) {
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [previewText, setPreviewText] = useState('The quick brown fox jumps over the lazy dog');
  const [customFontUrl, setCustomFontUrl] = useState('');

  const handleAddCustomFont = () => {
    if (customFontUrl.trim()) {
      // Extract font name from Google Fonts URL or use a default name
      const fontName = extractFontNameFromUrl(customFontUrl) || 'Custom Font';
      onAddFont(fontName);
      setCustomFontUrl('');
    }
  };

  const extractFontNameFromUrl = (url: string): string | null => {
    // Extract font name from Google Fonts URL
    const match = url.match(/family=([^&:]+)/);
    if (match) {
      return match[1].replace(/\+/g, ' ');
    }
    return null;
  };

  const fontCategories = {
    serif: ['Playfair Display', 'Merriweather', 'Lora', 'PT Serif'],
    sansSerif: ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro', 'Nunito', 'Ubuntu'],
    display: ['Oswald', 'Raleway', 'PT Sans'],
    monospace: ['Roboto Mono', 'Source Code Pro', 'Space Mono']
  };

  return (
    <div className="space-y-6">
      {/* Active Fonts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Active Fonts</h3>
          <Button
            size="sm"
            onClick={() => setShowFontPicker(!showFontPicker)}
          >
            <Plus size={16} className="mr-2" />
            Add Font
          </Button>
        </div>

        <div className="grid gap-3">
          {activeFonts.map((font) => (
            <div
              key={font}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedFont === font
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onSelectFont?.(font)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-700">{font}</div>
                  <div
                    className="text-lg mt-1"
                    style={{ fontFamily: font }}
                  >
                    {previewText.substring(0, 30)}...
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Preview font in larger size
                    }}
                    title="Preview"
                  >
                    <Eye size={16} />
                  </Button>
                  {onRemoveFont && activeFonts.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFont(font);
                      }}
                      title="Remove font"
                    >
                      <X size={16} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Font Picker */}
      {showFontPicker && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Add New Font</h4>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowFontPicker(false)}
            >
              <X size={16} />
            </Button>
          </div>

          {/* Preview Text Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Preview Text</label>
            <input
              type="text"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter text to preview fonts"
            />
          </div>

          {/* Font Categories */}
          <div className="space-y-4">
            {Object.entries(fontCategories).map(([category, fonts]) => (
              <div key={category}>
                <h5 className="font-medium text-sm text-gray-700 mb-2 capitalize">
                  {category.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </h5>
                <div className="grid gap-2">
                  {fonts
                    .filter((font) => availableFonts.includes(font) && !activeFonts.includes(font))
                    .map((font) => (
                      <div
                        key={font}
                        className="p-3 border rounded cursor-pointer hover:bg-white transition-colors"
                        onClick={() => {
                          onAddFont(font);
                          setShowFontPicker(false);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{font}</div>
                            <div
                              className="text-base mt-1"
                              style={{ fontFamily: font }}
                            >
                              {previewText.substring(0, 25)}...
                            </div>
                          </div>
                          <Plus size={16} className="text-gray-400" />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Custom Font URL */}
          <div className="mt-6 pt-4 border-t">
            <h5 className="font-medium text-sm text-gray-700 mb-2">
              Add Custom Google Font
            </h5>
            <div className="flex space-x-2">
              <input
                type="url"
                value={customFontUrl}
                onChange={(e) => setCustomFontUrl(e.target.value)}
                className="flex-1 p-2 border rounded text-sm"
                placeholder="https://fonts.googleapis.com/css2?family=Font+Name"
              />
              <Button
                size="sm"
                onClick={handleAddCustomFont}
                disabled={!customFontUrl.trim()}
              >
                <Download size={16} className="mr-1" />
                Add
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter a Google Fonts CSS URL to add custom fonts
            </p>
          </div>
        </div>
      )}

      {/* Font Pairing Suggestions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Font Pairing Suggestions</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { heading: 'Playfair Display', body: 'Open Sans', theme: 'Elegant' },
            { heading: 'Montserrat', body: 'Lora', theme: 'Modern' },
            { heading: 'Oswald', body: 'PT Sans', theme: 'Bold' },
            { heading: 'Raleway', body: 'Nunito', theme: 'Friendly' }
          ].map((pairing, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => {
                onAddFont(pairing.heading);
                onAddFont(pairing.body);
              }}
            >
              <div className="text-sm font-medium text-gray-700 mb-2">
                {pairing.theme} Pairing
              </div>
              <div
                className="text-xl font-bold mb-1"
                style={{ fontFamily: pairing.heading }}
              >
                Heading Font
              </div>
              <div
                className="text-base text-gray-600"
                style={{ fontFamily: pairing.body }}
              >
                Body text font for readability
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
