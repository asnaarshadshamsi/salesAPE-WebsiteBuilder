"use client";

import { useState } from "react";
import { FormInput } from "@/components/ui/FormInput";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";

interface TagManagerSectionProps {
  title: string;
  icon: React.ReactNode;
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (item: string) => void;
  placeholder: string;
  colorClass?: string;
}

export function TagManagerSection({
  title,
  icon,
  items,
  onAdd,
  onRemove,
  placeholder,
  colorClass = "pink",
}: TagManagerSectionProps) {
  const [newItem, setNewItem] = useState("");

  const handleAdd = () => {
    if (newItem.trim() && !items.includes(newItem.trim())) {
      onAdd(newItem.trim());
      setNewItem("");
    }
  };

  const bgClass =
    colorClass === "emerald"
      ? "bg-emerald-500/20 text-emerald-400"
      : "bg-pink-500/20 text-pink-400";
  const hoverClass =
    colorClass === "emerald" ? "hover:text-emerald-300" : "hover:text-pink-300";

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <span className={`w-6 h-6 ${bgClass} rounded-full text-sm flex items-center justify-center`}>
          {icon}
        </span>
        {title}
      </h2>

      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={i}
            className={`inline-flex items-center px-3 py-1 ${bgClass} rounded-full text-sm`}
          >
            {item}
            <button
              type="button"
              onClick={() => onRemove(item)}
              className={`ml-2 ${hoverClass}`}
            >
              <X className="w-4 h-4" />
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <FormInput
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <Button type="button" onClick={handleAdd}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
