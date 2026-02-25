"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Edit, Save, Undo, Redo, Plus, Trash2, Move, Type, 
  Image as ImageIcon, Palette, Layout, Settings,
  Eye, EyeOff, MousePointer, Hand, Copy, Scissors
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface EditorElement {
  id: string;
  type: 'text' | 'image' | 'button' | 'section' | 'card' | 'container';
  content: any;
  styles: Record<string, string>;
  position: { x: number; y: number };
  size: { width: number; height: number };
  parent?: string;
  children?: string[];
}

interface VisualEditorProps {
  siteData: any;
  onSave: (data: any) => void;
}

export function VisualEditor({ siteData, onSave }: VisualEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [elements, setElements] = useState<Record<string, EditorElement>>({});
  const [history, setHistory] = useState<Record<string, EditorElement>[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [tool, setTool] = useState<'select' | 'text' | 'image' | 'move'>('select');
  const [showGrid, setShowGrid] = useState(false);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Initialize editor elements from site data
  useEffect(() => {
    if (siteData) {
      // Parse the existing site structure into editable elements
      const parsedElements = parseSiteDataToElements(siteData);
      setElements(parsedElements);
      addToHistory(parsedElements);
    }
  }, [siteData]);

  // Parse site data into editable elements
  const parseSiteDataToElements = (data: any): Record<string, EditorElement> => {
    const elements: Record<string, EditorElement> = {};
    
    // Create elements for each section
    if (data.headline) {
      elements['headline'] = {
        id: 'headline',
        type: 'text',
        content: data.headline,
        styles: { fontSize: '3rem', fontWeight: 'bold', color: '#000' },
        position: { x: 0, y: 0 },
        size: { width: 100, height: 60 }
      };
    }

    if (data.subheadline) {
      elements['subheadline'] = {
        id: 'subheadline',
        type: 'text',
        content: data.subheadline,
        styles: { fontSize: '1.25rem', color: '#666' },
        position: { x: 0, y: 80 },
        size: { width: 100, height: 40 }
      };
    }

    if (data.business?.logo) {
      elements['logo'] = {
        id: 'logo',
        type: 'image',
        content: { src: data.business.logo, alt: 'Logo' },
        styles: { width: '120px', height: '48px' },
        position: { x: 0, y: 0 },
        size: { width: 120, height: 48 }
      };
    }

    if (data.business?.heroImage) {
      elements['hero-image'] = {
        id: 'hero-image',
        type: 'image',
        content: { src: data.business.heroImage, alt: 'Hero Image' },
        styles: { width: '100%', height: '400px' },
        position: { x: 0, y: 120 },
        size: { width: 100, height: 400 }
      };
    }

    return elements;
  };

  // Add state to history for undo/redo
  const addToHistory = (newElements: Record<string, EditorElement>) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ ...newElements });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo/Redo functions
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  // Update element
  const updateElement = (id: string, updates: Partial<EditorElement>) => {
    const newElements = {
      ...elements,
      [id]: { ...elements[id], ...updates }
    };
    setElements(newElements);
    addToHistory(newElements);
  };

  // Delete element
  const deleteElement = (id: string) => {
    const newElements = { ...elements };
    delete newElements[id];
    setElements(newElements);
    addToHistory(newElements);
    setSelectedElement(null);
  };

  // Add new element
  const addElement = (type: EditorElement['type']) => {
    const id = `element_${Date.now()}`;
    const newElement: EditorElement = {
      id,
      type,
      content: type === 'text' ? 'New Text' : type === 'image' ? { src: '', alt: '' } : '',
      styles: {},
      position: { x: 50, y: 50 },
      size: { width: 200, height: 100 }
    };

    const newElements = { ...elements, [id]: newElement };
    setElements(newElements);
    addToHistory(newElements);
    setSelectedElement(id);
  };

  // Duplicate element
  const duplicateElement = (id: string) => {
    const element = elements[id];
    if (!element) return;

    const newId = `element_${Date.now()}`;
    const newElement: EditorElement = {
      ...element,
      id: newId,
      position: { 
        x: element.position.x + 20, 
        y: element.position.y + 20 
      }
    };

    const newElements = { ...elements, [newId]: newElement };
    setElements(newElements);
    addToHistory(newElements);
    setSelectedElement(newId);
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Left Toolbar */}
      <div className="w-16 bg-zinc-900 flex flex-col items-center py-4 space-y-4">
        <Button
          variant={tool === 'select' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTool('select')}
          className="w-10 h-10 p-0"
        >
          <MousePointer size={18} />
        </Button>
        
        <Button
          variant={tool === 'move' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTool('move')}
          className="w-10 h-10 p-0"
        >
          <Hand size={18} />
        </Button>

        <Button
          variant={tool === 'text' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTool('text')}
          className="w-10 h-10 p-0"
        >
          <Type size={18} />
        </Button>

        <Button
          variant={tool === 'image' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTool('image')}
          className="w-10 h-10 p-0"
        >
          <ImageIcon size={18} />
        </Button>

        <div className="border-t border-gray-600 w-8"></div>

        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={historyIndex <= 0}
          className="w-10 h-10 p-0"
        >
          <Undo size={18} />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          className="w-10 h-10 p-0"
        >
          <Redo size={18} />
        </Button>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="h-14 bg-white border-b flex items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Button
              variant={isEditing ? 'default' : 'outline'}
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit size={16} className="mr-2" />
              {isEditing ? 'Exit Edit' : 'Edit Mode'}
            </Button>

            <Button
              variant="ghost"
              onClick={() => setShowGrid(!showGrid)}
            >
              <Layout size={16} className="mr-2" />
              {showGrid ? 'Hide Grid' : 'Show Grid'}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Zoom: {Math.round(zoom * 100)}%
            </span>
            
            <Button
              variant="ghost"
              onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
            >
              -
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => setZoom(Math.min(2, zoom + 0.25))}
            >
              +
            </Button>

            <Button onClick={() => onSave(elements)}>
              <Save size={16} className="mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-auto">
          <div
            ref={canvasRef}
            className="relative bg-white min-h-full"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              backgroundImage: showGrid ? 
                'radial-gradient(circle, #ddd 1px, transparent 1px)' : 'none',
              backgroundSize: showGrid ? '20px 20px' : 'auto'
            }}
          >
            {/* Render elements */}
            {Object.values(elements).map(element => (
              <EditableElement
                key={element.id}
                element={element}
                isSelected={selectedElement === element.id}
                isEditing={isEditing}
                onSelect={setSelectedElement}
                onUpdate={updateElement}
                onDelete={deleteElement}
                onDuplicate={duplicateElement}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Properties Panel */}
      {selectedElement && (
        <ElementPropertiesPanel
          element={elements[selectedElement]}
          onUpdate={(updates) => updateElement(selectedElement, updates)}
          onDelete={() => deleteElement(selectedElement)}
          onDuplicate={() => duplicateElement(selectedElement)}
        />
      )}

      {/* Add Element Menu */}
      {isEditing && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg p-2 flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => addElement('text')}
          >
            <Type size={16} className="mr-2" />
            Add Text
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => addElement('image')}
          >
            <ImageIcon size={16} className="mr-2" />
            Add Image
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => addElement('button')}
          >
            <Plus size={16} className="mr-2" />
            Add Button
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => addElement('section')}
          >
            <Layout size={16} className="mr-2" />
            Add Section
          </Button>
        </div>
      )}
    </div>
  );
}

// Editable Element Component
interface EditableElementProps {
  element: EditorElement;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<EditorElement>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

function EditableElement({
  element,
  isSelected,
  isEditing,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate
}: EditableElementProps) {
  const [isEditingText, setIsEditingText] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditing) {
      onSelect(element.id);
    }
  };

  const handleDoubleClick = () => {
    if (element.type === 'text') {
      setIsEditingText(true);
    }
  };

  const handleTextChange = (newText: string) => {
    onUpdate(element.id, { content: newText });
    setIsEditingText(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing && isSelected) {
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStart && isEditing) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      onUpdate(element.id, {
        position: {
          x: element.position.x + deltaX,
          y: element.position.y + deltaY
        }
      });
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setDragStart(null);
  };

  const elementStyle = {
    position: 'absolute' as const,
    left: element.position.x,
    top: element.position.y,
    width: element.size.width,
    height: element.size.height,
    border: isSelected ? '2px solid #3b82f6' : isEditing ? '1px dashed #ccc' : 'none',
    cursor: isEditing ? 'move' : 'default',
    ...element.styles
  };

  return (
    <div
      style={elementStyle}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`${isSelected ? 'ring-2 ring-blue-500' : ''} ${isEditing ? 'hover:bg-blue-50' : ''}`}
    >
      {element.type === 'text' && (
        isEditingText ? (
          <input
            type="text"
            defaultValue={element.content}
            onBlur={(e) => handleTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleTextChange((e.target as HTMLInputElement).value);
              }
            }}
            className="w-full h-full border-none outline-none bg-transparent"
            autoFocus
          />
        ) : (
          <div style={element.styles}>{element.content}</div>
        )
      )}
      
      {element.type === 'image' && (
        <img
          src={element.content.src || '/placeholder.jpg'}
          alt={element.content.alt || 'Image'}
          className="w-full h-full object-cover"
        />
      )}
      
      {element.type === 'button' && (
        <button
          className="w-full h-full bg-blue-500 text-white rounded px-4 py-2"
          style={element.styles}
        >
          {element.content || 'Button'}
        </button>
      )}

      {/* Selection handles */}
      {isSelected && isEditing && (
        <>
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize"></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize"></div>
          
          {/* Context menu */}
          <div className="absolute -top-8 left-0 flex space-x-1">
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate(element.id); }}
              className="px-2 py-1 bg-gray-800 text-white text-xs rounded"
            >
              <Copy size={12} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(element.id); }}
              className="px-2 py-1 bg-red-500 text-white text-xs rounded"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Properties Panel Component
interface ElementPropertiesPanelProps {
  element: EditorElement;
  onUpdate: (updates: Partial<EditorElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function ElementPropertiesPanel({
  element,
  onUpdate,
  onDelete,
  onDuplicate
}: ElementPropertiesPanelProps) {
  const updateStyle = (property: string, value: string) => {
    onUpdate({
      styles: { ...element.styles, [property]: value }
    });
  };

  return (
    <div className="w-80 bg-white border-l h-full overflow-y-auto">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg">Properties</h3>
        <p className="text-sm text-gray-600">Element ID: {element.id}</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Content */}
        {element.type === 'text' && (
          <div>
            <label className="block text-sm font-medium mb-2">Text Content</label>
            <textarea
              value={element.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>
        )}

        {element.type === 'image' && (
          <div>
            <label className="block text-sm font-medium mb-2">Image Source</label>
            <input
              type="url"
              value={element.content.src || ''}
              onChange={(e) => onUpdate({ 
                content: { ...element.content, src: e.target.value } 
              })}
              className="w-full p-2 border rounded"
              placeholder="Enter image URL"
            />
          </div>
        )}

        {/* Positioning */}
        <div>
          <label className="block text-sm font-medium mb-2">Position</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={element.position.x}
              onChange={(e) => onUpdate({
                position: { ...element.position, x: parseInt(e.target.value) }
              })}
              placeholder="X"
              className="p-2 border rounded text-sm"
            />
            <input
              type="number"
              value={element.position.y}
              onChange={(e) => onUpdate({
                position: { ...element.position, y: parseInt(e.target.value) }
              })}
              placeholder="Y"
              className="p-2 border rounded text-sm"
            />
          </div>
        </div>

        {/* Size */}
        <div>
          <label className="block text-sm font-medium mb-2">Size</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={element.size.width}
              onChange={(e) => onUpdate({
                size: { ...element.size, width: parseInt(e.target.value) }
              })}
              placeholder="Width"
              className="p-2 border rounded text-sm"
            />
            <input
              type="number"
              value={element.size.height}
              onChange={(e) => onUpdate({
                size: { ...element.size, height: parseInt(e.target.value) }
              })}
              placeholder="Height"
              className="p-2 border rounded text-sm"
            />
          </div>
        </div>

        {/* Styling */}
        {element.type === 'text' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Font Size</label>
              <input
                type="text"
                value={element.styles.fontSize || ''}
                onChange={(e) => updateStyle('fontSize', e.target.value)}
                placeholder="e.g. 16px, 1.2rem"
                className="w-full p-2 border rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <input
                type="color"
                value={element.styles.color || '#000000'}
                onChange={(e) => updateStyle('color', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Font Weight</label>
              <select
                value={element.styles.fontWeight || 'normal'}
                onChange={(e) => updateStyle('fontWeight', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="lighter">Lighter</option>
                <option value="bolder">Bolder</option>
              </select>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="pt-4 border-t space-y-2">
          <Button
            variant="outline"
            onClick={onDuplicate}
            className="w-full"
          >
            <Copy size={16} className="mr-2" />
            Duplicate
          </Button>
          
          <Button
            variant="destructive"
            onClick={onDelete}
            className="w-full"
          >
            <Trash2 size={16} className="mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
