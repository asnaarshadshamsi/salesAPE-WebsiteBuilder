import { Input } from "@/components/ui/input";
import { ComponentProps } from "react";

interface FormInputProps extends ComponentProps<typeof Input> {
  label?: string;
  error?: string;
}

export function FormInput({ label, error, ...props }: FormInputProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <Input {...props} />
      {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
    </div>
  );
}
