"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Edit, Star, ChevronUp, ChevronDown, Copy, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TestimonialCardEditorProps {
  testimonials: any[];
  onUpdate: (testimonials: any[]) => void;
  isEditing: boolean;
}

export function TestimonialCardEditor({ testimonials, onUpdate, isEditing }: TestimonialCardEditorProps) {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<{cardIndex: number, field: string} | null>(null);

  const addTestimonial = () => {
    const newTestimonial = {
      id: `testimonial_${Date.now()}`,
      quote: 'This service has been amazing for our business. Highly recommended!',
      author: 'John Doe',
      position: 'CEO',
      company: 'Company Name',
      image: null,
      rating: 5
    };
    onUpdate([...testimonials, newTestimonial]);
    setSelectedCard(testimonials.length);
  };

  const updateTestimonial = (index: number, updates: any) => {
    const updatedTestimonials = [...testimonials];
    updatedTestimonials[index] = { ...updatedTestimonials[index], ...updates };
    onUpdate(updatedTestimonials);
  };

  const deleteTestimonial = (index: number) => {
    const updatedTestimonials = testimonials.filter((_, i) => i !== index);
    onUpdate(updatedTestimonials);
    setSelectedCard(null);
  };

  const duplicateTestimonial = (index: number) => {
    const testimonialToCopy = { ...testimonials[index] };
    testimonialToCopy.id = `testimonial_${Date.now()}`;
    const updatedTestimonials = [...testimonials];
    updatedTestimonials.splice(index + 1, 0, testimonialToCopy);
    onUpdate(updatedTestimonials);
  };

  const moveTestimonial = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === testimonials.length - 1)
    ) {
      return;
    }

    const updatedTestimonials = [...testimonials];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [updatedTestimonials[index], updatedTestimonials[newIndex]] = [updatedTestimonials[newIndex], updatedTestimonials[index]];
    onUpdate(updatedTestimonials);
    setSelectedCard(newIndex);
  };

  const renderStars = (rating: number, testimonialIndex: number) => {
    return (
      <div className="flex items-center mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`cursor-pointer ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            } ${isEditing ? 'hover:text-yellow-400' : ''}`}
            onClick={() => {
              if (isEditing) {
                updateTestimonial(testimonialIndex, { rating: star });
              }
            }}
          />
        ))}
        {isEditing && (
          <span className="ml-2 text-sm text-gray-500">Click stars to rate</span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Testimonials Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id || index}
            className={`relative bg-white rounded-lg shadow-md p-6 border-2 transition-all cursor-pointer ${
              selectedCard === index
                ? 'border-blue-500 shadow-lg'
                : isEditing
                ? 'border-dashed border-gray-300 hover:border-gray-400'
                : 'border-transparent'
            }`}
            onClick={() => isEditing && setSelectedCard(index)}
          >
            {/* Testimonial Controls */}
            {selectedCard === index && isEditing && (
              <div className="absolute -top-3 -right-3 flex space-x-1 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveTestimonial(index, 'up');
                  }}
                  disabled={index === 0}
                  className="p-1 bg-blue-500 text-white rounded text-xs disabled:opacity-50"
                  title="Move Up"
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveTestimonial(index, 'down');
                  }}
                  disabled={index === testimonials.length - 1}
                  className="p-1 bg-blue-500 text-white rounded text-xs"
                  title="Move Down"
                >
                  <ChevronDown size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateTestimonial(index);
                  }}
                  className="p-1 bg-gray-600 text-white rounded text-xs"
                  title="Duplicate"
                >
                  <Copy size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTestimonial(index);
                  }}
                  className="p-1 bg-red-500 text-white rounded text-xs"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}

            {/* Rating Stars */}
            {renderStars(testimonial.rating || 5, index)}

            {/* Quote */}
            {editingField?.cardIndex === index && editingField?.field === 'quote' ? (
              <textarea
                defaultValue={testimonial.quote}
                onBlur={(e) => {
                  updateTestimonial(index, { quote: e.target.value });
                  setEditingField(null);
                }}
                className="text-gray-700 italic mb-6 bg-transparent border-2 border-blue-500 rounded p-2 outline-none w-full resize-none"
                rows={4}
                autoFocus
              />
            ) : (
              <p
                className={`text-gray-700 italic mb-6 ${
                  isEditing ? 'cursor-pointer hover:bg-yellow-100 rounded px-2 py-1' : ''
                }`}
                onClick={() => isEditing && setEditingField({ cardIndex: index, field: 'quote' })}
              >
                &quot;{testimonial.quote}&quot;
              </p>
            )}

            {/* Author Section */}
            <div className="flex items-center">
              {/* Author Image */}
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4 overflow-hidden">
                {testimonial.image ? (
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={24} className="text-gray-500" />
                )}
                {isEditing && selectedCard === index && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full cursor-pointer">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const url = prompt('Enter image URL:', testimonial.image || '');
                        if (url !== null) {
                          updateTestimonial(index, { image: url || null });
                        }
                      }}
                      className="text-white text-xs"
                      title="Change photo"
                    >
                      <Edit size={12} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1">
                {/* Author Name */}
                {editingField?.cardIndex === index && editingField?.field === 'author' ? (
                  <input
                    type="text"
                    defaultValue={testimonial.author}
                    onBlur={(e) => {
                      updateTestimonial(index, { author: e.target.value });
                      setEditingField(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateTestimonial(index, { author: (e.target as HTMLInputElement).value });
                        setEditingField(null);
                      }
                    }}
                    className="font-semibold text-gray-900 bg-transparent border-b-2 border-blue-500 outline-none w-full"
                    autoFocus
                  />
                ) : (
                  <div
                    className={`font-semibold text-gray-900 ${
                      isEditing ? 'cursor-pointer hover:bg-yellow-100 rounded px-1' : ''
                    }`}
                    onClick={() => isEditing && setEditingField({ cardIndex: index, field: 'author' })}
                  >
                    {testimonial.author}
                  </div>
                )}

                {/* Position & Company */}
                {editingField?.cardIndex === index && editingField?.field === 'position' ? (
                  <input
                    type="text"
                    defaultValue={`${testimonial.position}${testimonial.company ? ', ' + testimonial.company : ''}`}
                    onBlur={(e) => {
                      const parts = e.target.value.split(',');
                      updateTestimonial(index, {
                        position: parts[0]?.trim() || '',
                        company: parts[1]?.trim() || ''
                      });
                      setEditingField(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const parts = (e.target as HTMLInputElement).value.split(',');
                        updateTestimonial(index, {
                          position: parts[0]?.trim() || '',
                          company: parts[1]?.trim() || ''
                        });
                        setEditingField(null);
                      }
                    }}
                    className="text-sm text-gray-600 bg-transparent border-b border-blue-500 outline-none w-full"
                    placeholder="Position, Company"
                    autoFocus
                  />
                ) : (
                  <div
                    className={`text-sm text-gray-600 ${
                      isEditing ? 'cursor-pointer hover:bg-yellow-100 rounded px-1' : ''
                    }`}
                    onClick={() => isEditing && setEditingField({ cardIndex: index, field: 'position' })}
                  >
                    {testimonial.position}{testimonial.company && `, ${testimonial.company}`}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add Testimonial Button */}
        {isEditing && (
          <div
            onClick={addTestimonial}
            className="bg-gray-50 rounded-lg shadow-md p-6 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-all cursor-pointer flex flex-col items-center justify-center text-gray-500 hover:text-gray-700 min-h-75"
          >
            <Plus size={48} className="mb-4" />
            <span className="text-lg font-medium">Add Testimonial</span>
          </div>
        )}
      </div>
    </div>
  );
}
