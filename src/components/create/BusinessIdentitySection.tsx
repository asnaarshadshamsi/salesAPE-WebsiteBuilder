"use client";

import { FormInput } from "@/components/ui/FormInput";
import { VoiceEnabledTextarea } from "@/components/VoiceInput";

interface BusinessIdentitySectionProps {
  formData: {
    name: string;
    description: string;
    businessType: string;
    primaryColor: string;
    secondaryColor: string;
  };
  onChange: (updates: Partial<BusinessIdentitySectionProps["formData"]>) => void;
  businessTypeLabels: Record<string, string>;
}

export function BusinessIdentitySection({
  formData,
  onChange,
  businessTypeLabels,
}: BusinessIdentitySectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <span className="w-6 h-6 bg-pink-500/20 text-pink-400 rounded-full text-sm flex items-center justify-center">
          1
        </span>
        Business Identity
      </h2>

      <FormInput
        label="Business Name *"
        value={formData.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="My Awesome Business"
        required
      />

      <VoiceEnabledTextarea
        label="Description"
        value={formData.description}
        onChange={(val) => onChange({ description: val })}
        placeholder="Tell potential customers what you do..."
        rows={4}
      />

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Business Type
        </label>
        <select
          value={formData.businessType}
          onChange={(e) => onChange({ businessType: e.target.value })}
          className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        >
          {Object.entries(businessTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Primary Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={formData.primaryColor}
              onChange={(e) => onChange({ primaryColor: e.target.value })}
              className="w-12 h-12 rounded-lg cursor-pointer border border-zinc-700"
            />
            <FormInput
              value={formData.primaryColor}
              onChange={(e) => onChange({ primaryColor: e.target.value })}
              className="flex-1"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Secondary Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={formData.secondaryColor}
              onChange={(e) => onChange({ secondaryColor: e.target.value })}
              className="w-12 h-12 rounded-lg cursor-pointer border border-zinc-700"
            />
            <FormInput
              value={formData.secondaryColor}
              onChange={(e) => onChange({ secondaryColor: e.target.value })}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
