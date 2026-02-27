"use client";

import React, { useState } from 'react';
import { 
  Plus, Trash2, Edit, Image as ImageIcon, Type, 
  Star, Users, Phone, Mail, Clock, MapPin,
  ChevronUp, ChevronDown, Copy, Move, Eye, EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { InlineTextEditor } from './InlineTextEditor';

interface ServiceCardEditorProps {
  services: any[];
  onUpdate: (services: any[]) => void;
  isEditing: boolean;
}

export function ServiceCardEditor({ services, onUpdate, isEditing }: ServiceCardEditorProps) {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<{cardIndex: number, field: string} | null>(null);

  const addService = () => {
    const newService = {
      id: `service_${Date.now()}`,
      title: 'New Service',
      description: 'Describe your service here...',
      price: '$99',
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
      icon: 'star',
      image: null
    };
    onUpdate([...services, newService]);
    setSelectedCard(services.length);
  };

  const updateService = (index: number, updates: any) => {
    const updatedServices = [...services];
    updatedServices[index] = { ...updatedServices[index], ...updates };
    onUpdate(updatedServices);
  };

  const deleteService = (index: number) => {
    const updatedServices = services.filter((_, i) => i !== index);
    onUpdate(updatedServices);
    setSelectedCard(null);
  };

  const duplicateService = (index: number) => {
    const serviceToCopy = { ...services[index] };
    serviceToCopy.id = `service_${Date.now()}`;
    serviceToCopy.title = serviceToCopy.title + ' Copy';
    const updatedServices = [...services];
    updatedServices.splice(index + 1, 0, serviceToCopy);
    onUpdate(updatedServices);
  };

  const moveService = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === services.length - 1)
    ) {
      return;
    }

    const updatedServices = [...services];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [updatedServices[index], updatedServices[newIndex]] = [updatedServices[newIndex], updatedServices[index]];
    onUpdate(updatedServices);
    setSelectedCard(newIndex);
  };

  const updateFeature = (serviceIndex: number, featureIndex: number, value: string) => {
    const updatedServices = [...services];
    updatedServices[serviceIndex].features[featureIndex] = value;
    onUpdate(updatedServices);
  };

  const addFeature = (serviceIndex: number) => {
    const updatedServices = [...services];
    updatedServices[serviceIndex].features.push('New feature');
    onUpdate(updatedServices);
  };

  const removeFeature = (serviceIndex: number, featureIndex: number) => {
    const updatedServices = [...services];
    updatedServices[serviceIndex].features.splice(featureIndex, 1);
    onUpdate(updatedServices);
  };

  return (
    <div className="space-y-6">
      {/* Services Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <div
            key={service.id || index}
            className={`relative bg-white rounded-lg shadow-md p-6 border-2 transition-all cursor-pointer ${
              selectedCard === index
                ? 'border-blue-500 shadow-lg'
                : isEditing
                ? 'border-dashed border-gray-300 hover:border-gray-400'
                : 'border-transparent'
            }`}
            onClick={() => isEditing && setSelectedCard(index)}
          >
            {/* Service Controls */}
            {selectedCard === index && isEditing && (
              <div className="absolute -top-3 -right-3 flex space-x-1 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveService(index, 'up');
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
                    moveService(index, 'down');
                  }}
                  disabled={index === services.length - 1}
                  className="p-1 bg-blue-500 text-white rounded text-xs"
                  title="Move Down"
                >
                  <ChevronDown size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateService(index);
                  }}
                  className="p-1 bg-gray-600 text-white rounded text-xs"
                  title="Duplicate"
                >
                  <Copy size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteService(index);
                  }}
                  className="p-1 bg-red-500 text-white rounded text-xs"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}

            {/* Service Image */}
            {service.image && (
              <div className="relative mb-4">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                {isEditing && selectedCard === index && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const url = prompt('Enter image URL:', service.image);
                        if (url !== null) {
                          updateService(index, { image: url || null });
                        }
                      }}
                      className="px-3 py-1 bg-white text-gray-800 rounded text-sm font-medium"
                    >
                      Change Image
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Service Icon */}
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-blue-600" />
            </div>

            {/* Service Title */}
            {editingField?.cardIndex === index && editingField?.field === 'title' ? (
              <input
                type="text"
                defaultValue={service.title}
                onBlur={(e) => {
                  updateService(index, { title: e.target.value });
                  setEditingField(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateService(index, { title: (e.target as HTMLInputElement).value });
                    setEditingField(null);
                  }
                }}
                className="text-xl font-semibold mb-3 text-center bg-transparent border-b-2 border-blue-500 outline-none w-full"
                autoFocus
              />
            ) : (
              <h3
                className={`text-xl font-semibold mb-3 text-center ${
                  isEditing ? 'cursor-pointer hover:bg-yellow-100 rounded px-2 py-1' : ''
                }`}
                onClick={() => isEditing && setEditingField({ cardIndex: index, field: 'title' })}
              >
                {service.title}
              </h3>
            )}

            {/* Service Description */}
            {editingField?.cardIndex === index && editingField?.field === 'description' ? (
              <textarea
                defaultValue={service.description}
                onBlur={(e) => {
                  updateService(index, { description: e.target.value });
                  setEditingField(null);
                }}
                className="text-gray-600 mb-4 bg-transparent border-2 border-blue-500 rounded p-2 outline-none w-full resize-none"
                rows={3}
                autoFocus
              />
            ) : (
              <p
                className={`text-gray-600 mb-4 ${
                  isEditing ? 'cursor-pointer hover:bg-yellow-100 rounded px-2 py-1' : ''
                }`}
                onClick={() => isEditing && setEditingField({ cardIndex: index, field: 'description' })}
              >
                {service.description}
              </p>
            )}

            {/* Service Price */}
            {service.price && (
              <>
                {editingField?.cardIndex === index && editingField?.field === 'price' ? (
                  <input
                    type="text"
                    defaultValue={service.price}
                    onBlur={(e) => {
                      updateService(index, { price: e.target.value });
                      setEditingField(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateService(index, { price: (e.target as HTMLInputElement).value });
                        setEditingField(null);
                      }
                    }}
                    className="text-2xl font-bold text-blue-600 mb-4 text-center bg-transparent border-b-2 border-blue-500 outline-none w-full"
                    autoFocus
                  />
                ) : (
                  <div
                    className={`text-2xl font-bold text-blue-600 mb-4 text-center ${
                      isEditing ? 'cursor-pointer hover:bg-yellow-100 rounded px-2 py-1' : ''
                    }`}
                    onClick={() => isEditing && setEditingField({ cardIndex: index, field: 'price' })}
                  >
                    {service.price}
                  </div>
                )}
              </>
            )}

            {/* Service Features */}
            {service.features && service.features.length > 0 && (
              <ul className="space-y-2 mb-4">
                {service.features.map((feature: string, featureIndex: number) => (
                  <li key={featureIndex} className="flex items-center text-sm text-gray-600 group">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 shrink-0" />
                    {editingField?.cardIndex === index && editingField?.field === `feature_${featureIndex}` ? (
                      <input
                        type="text"
                        defaultValue={feature}
                        onBlur={(e) => {
                          updateFeature(index, featureIndex, e.target.value);
                          setEditingField(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateFeature(index, featureIndex, (e.target as HTMLInputElement).value);
                            setEditingField(null);
                          }
                        }}
                        className="flex-1 bg-transparent border-b border-blue-500 outline-none"
                        autoFocus
                      />
                    ) : (
                      <span
                        className={`flex-1 ${
                          isEditing ? 'cursor-pointer hover:bg-yellow-100 rounded px-1' : ''
                        }`}
                        onClick={() => isEditing && setEditingField({ cardIndex: index, field: `feature_${featureIndex}` })}
                      >
                        {feature}
                      </span>
                    )}
                    {isEditing && selectedCard === index && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFeature(index, featureIndex);
                        }}
                        className="ml-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                        title="Remove feature"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </li>
                ))}
                {isEditing && selectedCard === index && (
                  <li className="flex items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addFeature(index);
                      }}
                      className="flex items-center text-blue-500 hover:text-blue-700 text-sm font-medium"
                    >
                      <Plus size={16} className="mr-1" />
                      Add feature
                    </button>
                  </li>
                )}
              </ul>
            )}

            {/* Add Image Button */}
            {!service.image && isEditing && selectedCard === index && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const url = prompt('Enter image URL:');
                  if (url) {
                    updateService(index, { image: url });
                  }
                }}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center"
              >
                <ImageIcon size={20} className="mr-2" />
                Add Image
              </button>
            )}
          </div>
        ))}

        {/* Add Service Button */}
        {isEditing && (
          <div
            onClick={addService}
            className="bg-gray-50 rounded-lg shadow-md p-6 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-all cursor-pointer flex flex-col items-center justify-center text-gray-500 hover:text-gray-700 min-h-75"
          >
            <Plus size={48} className="mb-4" />
            <span className="text-lg font-medium">Add Service</span>
          </div>
        )}
      </div>
    </div>
  );
}
