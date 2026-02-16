"use client";

import { FormInput } from "@/components/ui/FormInput";

interface ContactInfoSectionProps {
  formData: {
    phone: string;
    email: string;
    address: string;
    city: string;
  };
  onChange: (updates: Partial<ContactInfoSectionProps["formData"]>) => void;
}

export function ContactInfoSection({
  formData,
  onChange,
}: ContactInfoSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <span className="w-6 h-6 bg-pink-500/20 text-pink-400 rounded-full text-sm flex items-center justify-center">
          3
        </span>
        Contact Information
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Phone"
          value={formData.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="(555) 123-4567"
        />
        <FormInput
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="hello@business.com"
        />
      </div>

      <FormInput
        label="Address"
        value={formData.address}
        onChange={(e) => onChange({ address: e.target.value })}
        placeholder="123 Main St"
      />

      <FormInput
        label="City / Service Area"
        value={formData.city}
        onChange={(e) => onChange({ city: e.target.value })}
        placeholder="San Francisco, CA"
      />
    </div>
  );
}
