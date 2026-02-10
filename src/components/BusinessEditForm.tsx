"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateBusiness, deleteBusiness } from "@/actions/business";
import { Button, Input, Textarea } from "@/components/ui";
import { Save, Trash2, Plus, X, Loader2 } from "lucide-react";

interface BusinessEditFormProps {
  business: {
    id: string;
    name: string;
    description: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    services: string[];
    phone: string;
    email: string;
    address: string;
    city: string;
    calendlyUrl: string;
  };
  siteSlug?: string;
}

export function BusinessEditForm({ business, siteSlug }: BusinessEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [newService, setNewService] = useState("");

  const [formData, setFormData] = useState({
    name: business.name,
    description: business.description,
    logo: business.logo,
    primaryColor: business.primaryColor,
    secondaryColor: business.secondaryColor,
    services: business.services,
    phone: business.phone,
    email: business.email,
    address: business.address,
    city: business.city,
    calendlyUrl: business.calendlyUrl,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    const result = await updateBusiness(business.id, {
      name: formData.name,
      description: formData.description,
      logo: formData.logo || undefined,
      primaryColor: formData.primaryColor,
      secondaryColor: formData.secondaryColor,
      services: formData.services,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      address: formData.address || undefined,
      city: formData.city || undefined,
      calendlyUrl: formData.calendlyUrl || undefined,
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || "Failed to update business");
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this business? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteBusiness(business.id);

    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Failed to delete business");
      setIsDeleting(false);
    }
  };

  const addService = () => {
    if (newService.trim() && !formData.services.includes(newService.trim())) {
      setFormData((prev) => ({
        ...prev,
        services: [...prev.services, newService.trim()],
      }));
      setNewService("");
    }
  };

  const removeService = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s !== service),
    }));
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-xl shadow-lg border border-pink-500/20 p-6 space-y-6">
        {/* Site URL */}
        {siteSlug && (
          <div className="p-4 bg-pink-500/10 rounded-xl border border-pink-500/20">
            <p className="text-sm text-pink-300">
              <span className="font-medium">Your site URL:</span>{" "}
              <a
                href={`${process.env.NEXT_PUBLIC_APP_URL || ""}/sites/${siteSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-pink-400 hover:text-pink-300"
              >
                {typeof window !== "undefined" ? window.location.origin : ""}/sites/{siteSlug}
              </a>
            </p>
          </div>
        )}

        {/* Business Identity */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">
            Business Identity
          </h2>

          <Input
            label="Business Name *"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            rows={4}
          />

          <Input
            label="Logo URL"
            value={formData.logo}
            onChange={(e) => setFormData((prev) => ({ ...prev, logo: e.target.value }))}
            placeholder="https://example.com/logo.png"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData((prev) => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-12 h-12 rounded-lg cursor-pointer border border-zinc-700"
                />
                <Input
                  value={formData.primaryColor}
                  onChange={(e) => setFormData((prev) => ({ ...prev, primaryColor: e.target.value }))}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Secondary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                  className="w-12 h-12 rounded-lg cursor-pointer border border-zinc-700"
                />
                <Input
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Services</h2>

          <div className="flex flex-wrap gap-2">
            {formData.services.map((service, i) => (
              <span
                key={i}
                className="inline-flex items-center px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm"
              >
                {service}
                <button type="button" onClick={() => removeService(service)} className="ml-2 hover:text-pink-300">
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              placeholder="Add a service..."
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addService())}
            />
            <Button type="button" variant="outline" onClick={addService}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Contact Information</h2>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
          />

          <Input
            label="City / Service Area"
            value={formData.city}
            onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
          />
        </div>

        {/* Booking */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Booking</h2>

          <Input
            label="Calendly or Booking URL"
            value={formData.calendlyUrl}
            onChange={(e) => setFormData((prev) => ({ ...prev, calendlyUrl: e.target.value }))}
            placeholder="https://calendly.com/your-link"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && <p className="text-emerald-400 text-sm">Changes saved successfully!</p>}

        <div className="flex justify-between pt-4 border-t border-zinc-800">
          <Button type="button" variant="danger" onClick={handleDelete} isLoading={isDeleting}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Business
          </Button>
          <Button type="submit" isLoading={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
