"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  Globe, Image as ImageIcon, AlignLeft, Briefcase, Phone,
  Star, ChevronDown, ChevronUp, Plus, Trash2, Palette,
  User, Type, Link, Hash, UploadCloud, X
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface EditorChanges {
  // scraper site → saves to templateData
  templateData?: Record<string, any>;
  // chatbot site → saves to flat site/business fields
  headline?: string;
  subheadline?: string;
  aboutText?: string;
  ctaText?: string;
  features?: string[];
  testimonials?: any[];
  serviceDescriptions?: any[];
  businessName?: string;
  businessDescription?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessAddress?: string;
  businessCity?: string;
  businessServices?: string[];
  businessPrimaryColor?: string;
  businessSecondaryColor?: string;
  businessHeroImage?: string;
  businessLogo?: string;
  businessGalleryImages?: string[];
}

interface SiteEditorPanelProps {
  site: any;    // from getSiteForEditor
  business: any;
  onChange: (changes: EditorChanges) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "general",      label: "General",      icon: Globe },
  { id: "hero",         label: "Hero",         icon: Type },
  { id: "about",        label: "About",        icon: AlignLeft },
  { id: "services",     label: "Services",     icon: Briefcase },
  { id: "gallery",      label: "Gallery",      icon: ImageIcon },
  { id: "testimonials", label: "Reviews",      icon: Star },
  { id: "contact",      label: "Contact",      icon: Phone },
  { id: "colors",       label: "Colors",       icon: Palette },
];

// ─────────────────────────────────────────────────────────────────────────────
// Mini Components
// ─────────────────────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition"
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition resize-none"
    />
  );
}

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1 mb-4">{children}</div>;
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-5">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</span>
      <div className="flex-1 h-px bg-slate-700/60" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Image picker: click/drag-to-upload + optional URL fallback
// ─────────────────────────────────────────────────────────────────────────────
function ImagePickerField({
  value,
  onChange,
  maxSizeMB = 5,
}: {
  value: string;
  onChange: (url: string) => void;
  maxSizeMB?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [urlMode, setUrlMode] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    if (file.size / 1024 / 1024 > maxSizeMB) { setError(`Max size is ${maxSizeMB} MB.`); return; }
    setError("");
    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => { onChange(reader.result as string); setUploading(false); };
    reader.onerror  = () => { setError("Failed to read file."); setUploading(false); };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  };

  const hasImage = value && value.trim();

  return (
    <div className="space-y-2">
      {/* Drop-zone / thumbnail */}
      <div
        onClick={() => !hasImage && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative w-full overflow-hidden rounded-xl border-2 transition
          ${ dragging ? "border-violet-500 bg-violet-500/10" : "border-dashed border-slate-600 bg-slate-800/60" }
          ${ !hasImage ? "cursor-pointer hover:border-violet-500 hover:bg-slate-800" : "" }`}
      >
        {hasImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="preview"
              className="w-full h-36 object-cover"
            />
            {/* overlay buttons */}
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs rounded-lg transition"
              >
                <UploadCloud size={13} /> Change
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(""); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/60 hover:bg-red-500/80 text-white text-xs rounded-lg transition"
              >
                <X size={13} /> Remove
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-7 text-slate-500">
            {uploading ? (
              <svg className="animate-spin h-6 w-6 text-violet-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
            ) : (
              <UploadCloud size={24} className={dragging ? "text-violet-400" : ""} />
            )}
            <span className="text-xs">
              {uploading ? "Processing…" : "Click or drag & drop an image"}
            </span>
          </div>
        )}
      </div>

      {/* hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Error */}
      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* URL fallback toggle */}
      <button
        type="button"
        onClick={() => setUrlMode((v) => !v)}
        className="text-xs text-slate-500 hover:text-slate-300 transition underline"
      >
        {urlMode ? "Hide URL input" : "Or paste an image URL"}
      </button>
      {urlMode && (
        <input
          type="url"
          value={value.startsWith("data:") ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition"
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Collapsible card for items like services / testimonials
// ─────────────────────────────────────────────────────────────────────────────

function CollapsibleCard({
  title,
  index,
  onRemove,
  children,
}: {
  title: string;
  index: number;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className="border border-slate-700 rounded-xl overflow-hidden mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 hover:bg-slate-750 transition text-left"
      >
        <span className="text-sm font-medium text-white">{title || `Item ${index + 1}`}</span>
        <div className="flex items-center gap-2">
          <span
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition"
          >
            <Trash2 size={14} />
          </span>
          {open ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
        </div>
      </button>
      {open && <div className="p-4 space-y-3 bg-slate-850 border-t border-slate-700">{children}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Small helper: add a single image via URL input
// ─────────────────────────────────────────────────────────────────────────────
function AddImageByUrl({ onAdd }: { onAdd: (url: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="flex gap-2">
      <input
        type="url"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="https://example.com/photo.jpg"
        className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition"
      />
      <button
        type="button"
        disabled={!val.trim()}
        onClick={() => { if (val.trim()) { onAdd(val.trim()); setVal(""); } }}
        className="px-3 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white text-xs rounded-lg transition font-medium"
      >
        Add
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function SiteEditorPanel({ site, business, onChange }: SiteEditorPanelProps) {
  const [activeTab, setActiveTab] = useState("general");

  // ── Local state mirrors the editable data ──────────────────────────────────
  // For scraper sites we edit `businessData`; for chatbot sites we edit flat fields.
  const isScraperSite: boolean = site.isScraperSite ?? false;

  // Scraper: keep a mutable copy of the BusinessData tree
  const [bd, setBd] = useState<Record<string, any>>(site.businessData ?? {});

  // Chatbot: flat mirrors
  const [headline, setHeadline]       = useState<string>(site.headline ?? "");
  const [subheadline, setSubheadline] = useState<string>(site.subheadline ?? "");
  const [aboutText, setAboutText]     = useState<string>(site.aboutText ?? "");
  const [ctaText, setCtaText]         = useState<string>(site.ctaText ?? "");
  const [features, setFeatures]       = useState<string[]>(site.features ?? []);
  const [testimonials, setTestimonials] = useState<any[]>(site.testimonials ?? []);
  const [serviceDescs, setServiceDescs] = useState<any[]>(site.serviceDescriptions ?? []);

  // Business fields (both types)
  const [bizName, setBizName]         = useState<string>(business.name ?? "");
  const [bizDesc, setBizDesc]         = useState<string>(business.description ?? "");
  const [bizPhone, setBizPhone]       = useState<string>(business.phone ?? "");
  const [bizEmail, setBizEmail]       = useState<string>(business.email ?? "");
  const [bizAddress, setBizAddress]   = useState<string>(business.address ?? "");
  const [bizCity, setBizCity]         = useState<string>(business.city ?? "");
  const [bizServices, setBizServices] = useState<string[]>(
    Array.isArray(business.services) ? business.services : []
  );
  const [primaryColor, setPrimaryColor]   = useState<string>(business.primaryColor ?? "#6366f1");
  const [secondaryColor, setSecondaryColor] = useState<string>(business.secondaryColor ?? "#8b5cf6");

  // ── Emit changes upward ───────────────────────────────────────────────────
  const emitChanges = useCallback(
    (patch: Partial<EditorChanges>) => {
      if (isScraperSite) {
        // Always emit the full updated bd tree plus any business patches
        onChange({ templateData: bd, ...patch });
      } else {
        onChange(patch);
      }
    },
    [isScraperSite, bd, onChange]
  );

  // ── Scraper helpers ───────────────────────────────────────────────────────
  const updateBd = (path: string[], value: any) => {
    const updated = deepSet({ ...bd }, path, value);
    setBd(updated);
    emitChanges({ templateData: updated });
  };

  // ── Chatbot helpers ───────────────────────────────────────────────────────
  const handleChatbotField = (key: keyof EditorChanges, value: any) => {
    emitChanges({ [key]: value });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Tab rendering
  // ─────────────────────────────────────────────────────────────────────────

  const renderGeneral = () => (
    <div>
      <SectionDivider title="Brand" />
      <FieldGroup>
        <FieldLabel>Business Name</FieldLabel>
        <TextInput
          value={bizName}
          placeholder="Your Business Name"
          onChange={(v) => {
            setBizName(v);
            if (isScraperSite) {
              updateBd(["brand", "name"], v);
            } else {
              handleChatbotField("businessName", v);
            }
          }}
        />
      </FieldGroup>
      <FieldGroup>
        <FieldLabel>Tagline</FieldLabel>
        <TextInput
          value={isScraperSite ? (bd.brand?.tagline ?? "") : bizDesc}
          placeholder="Your catchy tagline…"
          onChange={(v) => {
            if (isScraperSite) {
              updateBd(["brand", "tagline"], v);
            } else {
              setBizDesc(v);
              handleChatbotField("businessDescription", v);
            }
          }}
        />
      </FieldGroup>

      {!isScraperSite && (
        <FieldGroup>
          <FieldLabel>Business Description</FieldLabel>
          <TextArea
            value={bizDesc}
            placeholder="Describe your business…"
            onChange={(v) => {
              setBizDesc(v);
              handleChatbotField("businessDescription", v);
            }}
          />
        </FieldGroup>
      )}

      <SectionDivider title="Logo & Images" />
      <FieldGroup>
        <FieldLabel>Logo</FieldLabel>
        <ImagePickerField
          value={isScraperSite ? (bd.brand?.logo ?? "") : (business.logo ?? "")}
          onChange={(v) => {
            if (isScraperSite) updateBd(["brand", "logo"], v);
            else handleChatbotField("businessLogo", v);
          }}
        />
      </FieldGroup>
    </div>
  );

  const renderHero = () => {
    const heroHeadline   = isScraperSite ? (bd.hero?.headline ?? "")    : headline;
    const heroSub        = isScraperSite ? (bd.hero?.subheadline ?? "")  : subheadline;
    const heroCtaLabel   = isScraperSite ? (bd.hero?.cta?.label ?? "")   : ctaText;
    const heroImage      = isScraperSite ? (bd.hero?.image ?? "")        : (business.heroImage ?? "");

    return (
      <div>
        <SectionDivider title="Hero Section" />
        <FieldGroup>
          <FieldLabel>Headline</FieldLabel>
          <TextArea
            value={heroHeadline}
            placeholder="Your main headline…"
            rows={2}
            onChange={(v) => {
              if (isScraperSite) { updateBd(["hero", "headline"], v); }
              else { setHeadline(v); handleChatbotField("headline", v); }
            }}
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel>Subheadline</FieldLabel>
          <TextArea
            value={heroSub}
            placeholder="Supporting tagline or description…"
            rows={3}
            onChange={(v) => {
              if (isScraperSite) { updateBd(["hero", "subheadline"], v); }
              else { setSubheadline(v); handleChatbotField("subheadline", v); }
            }}
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel>CTA Button Text</FieldLabel>
          <TextInput
            value={heroCtaLabel}
            placeholder="Get Started"
            onChange={(v) => {
              if (isScraperSite) { updateBd(["hero", "cta", "label"], v); }
              else { setCtaText(v); handleChatbotField("ctaText", v); }
            }}
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel>Hero Image</FieldLabel>
          <ImagePickerField
            value={heroImage}
            onChange={(v) => {
              if (isScraperSite) { updateBd(["hero", "image"], v); }
              else { handleChatbotField("businessHeroImage", v); }
            }}
          />
        </FieldGroup>
      </div>
    );
  };

  const renderAbout = () => {
    const aboutDesc = isScraperSite ? (bd.about?.description ?? "") : aboutText;
    const aboutTitle = isScraperSite ? (bd.about?.title ?? "") : "";

    return (
      <div>
        <SectionDivider title="About Section" />
        {isScraperSite && (
          <FieldGroup>
            <FieldLabel>Section Title</FieldLabel>
            <TextInput
              value={aboutTitle}
              placeholder="About Us"
              onChange={(v) => updateBd(["about", "title"], v)}
            />
          </FieldGroup>
        )}
        <FieldGroup>
          <FieldLabel>About Text</FieldLabel>
          <TextArea
            value={aboutDesc}
            placeholder="Tell visitors who you are and what you do…"
            rows={7}
            onChange={(v) => {
              if (isScraperSite) { updateBd(["about", "description"], v); }
              else { setAboutText(v); handleChatbotField("aboutText", v); }
            }}
          />
        </FieldGroup>
        {isScraperSite && (
          <FieldGroup>
            <FieldLabel>About Image</FieldLabel>
            <ImagePickerField
              value={bd.about?.image ?? ""}
              onChange={(v) => updateBd(["about", "image"], v)}
            />
          </FieldGroup>
        )}
      </div>
    );
  };

  const renderServices = () => {
    if (isScraperSite) {
      const items: any[] = bd.services?.items ?? [];
      return (
        <div>
          <SectionDivider title="Services" />
          <FieldGroup>
            <FieldLabel>Section Title</FieldLabel>
            <TextInput
              value={bd.services?.title ?? ""}
              placeholder="What We Offer"
              onChange={(v) => updateBd(["services", "title"], v)}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel>Subtitle</FieldLabel>
            <TextInput
              value={bd.services?.subtitle ?? ""}
              placeholder="Professional services tailored for you"
              onChange={(v) => updateBd(["services", "subtitle"], v)}
            />
          </FieldGroup>

          <div className="mt-4">
            {items.map((item: any, i: number) => (
              <CollapsibleCard
                key={i}
                title={item.title}
                index={i}
                onRemove={() => {
                  const newItems = items.filter((_, idx) => idx !== i);
                  updateBd(["services", "items"], newItems);
                }}
              >
                <FieldGroup>
                  <FieldLabel>Service Name</FieldLabel>
                  <TextInput value={item.title ?? ""} onChange={(v) => {
                    const upd = [...items]; upd[i] = { ...upd[i], title: v };
                    updateBd(["services", "items"], upd);
                  }} placeholder="e.g. Web Design" />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Description</FieldLabel>
                  <TextArea value={item.description ?? ""} rows={3} onChange={(v) => {
                    const upd = [...items]; upd[i] = { ...upd[i], description: v };
                    updateBd(["services", "items"], upd);
                  }} placeholder="What this service includes…" />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Price (optional)</FieldLabel>
                  <TextInput value={item.price ?? ""} onChange={(v) => {
                    const upd = [...items]; upd[i] = { ...upd[i], price: v };
                    updateBd(["services", "items"], upd);
                  }} placeholder="e.g. Starting at $99" />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Service Image (optional)</FieldLabel>
                  <ImagePickerField
                    value={item.image ?? ""}
                    onChange={(v) => {
                      const upd = [...items]; upd[i] = { ...upd[i], image: v };
                      updateBd(["services", "items"], upd);
                    }}
                  />
                </FieldGroup>
              </CollapsibleCard>
            ))}
          </div>

          <button
            onClick={() => {
              const newItems = [...items, { title: "New Service", description: "", price: "" }];
              updateBd(["services", "items"], newItems);
            }}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 border border-dashed border-slate-600 rounded-xl text-sm text-slate-400 hover:text-violet-400 hover:border-violet-500 transition"
          >
            <Plus size={16} /> Add Service
          </button>

          {/* Products (ecommerce) */}
          {bd.products && (
            <>
              <SectionDivider title="Products" />
              <FieldGroup>
                <FieldLabel>Products Section Title</FieldLabel>
                <TextInput
                  value={bd.products?.title ?? ""}
                  placeholder="Our Products"
                  onChange={(v) => updateBd(["products", "title"], v)}
                />
              </FieldGroup>
              <div className="mt-3">
                {(bd.products?.items ?? []).map((product: any, i: number) => (
                  <CollapsibleCard
                    key={i}
                    title={product.name}
                    index={i}
                    onRemove={() => {
                      const newItems = (bd.products?.items ?? []).filter((_: any, idx: number) => idx !== i);
                      updateBd(["products", "items"], newItems);
                    }}
                  >
                    <FieldGroup>
                      <FieldLabel>Product Name</FieldLabel>
                      <TextInput value={product.name ?? ""} onChange={(v) => {
                        const upd = [...(bd.products?.items ?? [])]; upd[i] = { ...upd[i], name: v };
                        updateBd(["products", "items"], upd);
                      }} placeholder="Product name" />
                    </FieldGroup>
                    <FieldGroup>
                      <FieldLabel>Description</FieldLabel>
                      <TextArea value={product.description ?? ""} rows={2} onChange={(v) => {
                        const upd = [...(bd.products?.items ?? [])]; upd[i] = { ...upd[i], description: v };
                        updateBd(["products", "items"], upd);
                      }} placeholder="Product description" />
                    </FieldGroup>
                    <div className="grid grid-cols-2 gap-3">
                      <FieldGroup>
                        <FieldLabel>Price ($)</FieldLabel>
                        <TextInput
                          value={String(product.price ?? "")}
                          type="number"
                          onChange={(v) => {
                            const upd = [...(bd.products?.items ?? [])]; upd[i] = { ...upd[i], price: parseFloat(v) || 0 };
                            updateBd(["products", "items"], upd);
                          }}
                          placeholder="0.00"
                        />
                      </FieldGroup>
                      <FieldGroup>
                        <FieldLabel>Sale Price ($)</FieldLabel>
                        <TextInput
                          value={String(product.salePrice ?? "")}
                          type="number"
                          onChange={(v) => {
                            const upd = [...(bd.products?.items ?? [])]; upd[i] = { ...upd[i], salePrice: parseFloat(v) || undefined };
                            updateBd(["products", "items"], upd);
                          }}
                          placeholder="Optional"
                        />
                      </FieldGroup>
                    </div>
                    <FieldGroup>
                      <FieldLabel>Product Image</FieldLabel>
                      <ImagePickerField
                        value={product.image ?? ""}
                        onChange={(v) => {
                          const upd = [...(bd.products?.items ?? [])]; upd[i] = { ...upd[i], image: v };
                          updateBd(["products", "items"], upd);
                        }}
                      />
                    </FieldGroup>
                  </CollapsibleCard>
                ))}
                <button
                  onClick={() => {
                    const newItems = [...(bd.products?.items ?? []), { name: "New Product", description: "", price: 0 }];
                    updateBd(["products", "items"], newItems);
                  }}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 border border-dashed border-slate-600 rounded-xl text-sm text-slate-400 hover:text-violet-400 hover:border-violet-500 transition"
                >
                  <Plus size={16} /> Add Product
                </button>
              </div>
            </>
          )}
        </div>
      );
    }

    // ── Chatbot services ─────────────────────────────────────────────────────
    return (
      <div>
        <SectionDivider title="Services" />
        <p className="text-xs text-slate-500 mb-3">List the main services you offer. One per line.</p>
        {bizServices.map((svc, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <TextInput
              value={svc}
              placeholder={`Service ${i + 1}`}
              onChange={(v) => {
                const upd = [...bizServices]; upd[i] = v;
                setBizServices(upd);
                handleChatbotField("businessServices", upd);
              }}
            />
            <button
              onClick={() => {
                const upd = bizServices.filter((_, idx) => idx !== i);
                setBizServices(upd);
                handleChatbotField("businessServices", upd);
              }}
              className="p-1.5 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition shrink-0"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button
          onClick={() => {
            const upd = [...bizServices, ""];
            setBizServices(upd);
            handleChatbotField("businessServices", upd);
          }}
          className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 border border-dashed border-slate-600 rounded-xl text-sm text-slate-400 hover:text-violet-400 hover:border-violet-500 transition"
        >
          <Plus size={16} /> Add Service
        </button>

        <SectionDivider title="Service Descriptions" />
        <p className="text-xs text-slate-500 mb-3">Optional: add richer descriptions shown on the site.</p>
        {serviceDescs.map((sd, i) => (
          <CollapsibleCard key={i} title={sd.name || `Service ${i + 1}`} index={i} onRemove={() => {
            const upd = serviceDescs.filter((_, idx) => idx !== i);
            setServiceDescs(upd);
            handleChatbotField("serviceDescriptions", upd);
          }}>
            <FieldGroup>
              <FieldLabel>Name</FieldLabel>
              <TextInput value={sd.name ?? ""} onChange={(v) => {
                const upd = [...serviceDescs]; upd[i] = { ...upd[i], name: v };
                setServiceDescs(upd);
                handleChatbotField("serviceDescriptions", upd);
              }} placeholder="Service name" />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Description</FieldLabel>
              <TextArea value={sd.description ?? ""} rows={3} onChange={(v) => {
                const upd = [...serviceDescs]; upd[i] = { ...upd[i], description: v };
                setServiceDescs(upd);
                handleChatbotField("serviceDescriptions", upd);
              }} placeholder="Describe this service…" />
            </FieldGroup>
          </CollapsibleCard>
        ))}
        <button
          onClick={() => {
            const upd = [...serviceDescs, { name: "", description: "" }];
            setServiceDescs(upd);
            handleChatbotField("serviceDescriptions", upd);
          }}
          className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 border border-dashed border-slate-600 rounded-xl text-sm text-slate-400 hover:text-violet-400 hover:border-violet-500 transition"
        >
          <Plus size={16} /> Add Description
        </button>
      </div>
    );
  };

  const renderTestimonials = () => {
    const items: any[] = isScraperSite
      ? (bd.testimonials?.items ?? [])
      : testimonials;

    const updateItems = (newItems: any[]) => {
      if (isScraperSite) {
        updateBd(["testimonials", "items"], newItems);
      } else {
        setTestimonials(newItems);
        handleChatbotField("testimonials", newItems);
      }
    };

    return (
      <div>
        <SectionDivider title="Customer Reviews" />
        {isScraperSite && (
          <FieldGroup>
            <FieldLabel>Section Title</FieldLabel>
            <TextInput
              value={bd.testimonials?.title ?? ""}
              placeholder="What Our Clients Say"
              onChange={(v) => updateBd(["testimonials", "title"], v)}
            />
          </FieldGroup>
        )}

        {items.map((item: any, i: number) => (
          <CollapsibleCard key={i} title={item.author || item.name || `Review ${i + 1}`} index={i} onRemove={() => {
            updateItems(items.filter((_, idx) => idx !== i));
          }}>
            <FieldGroup>
              <FieldLabel>Author Name</FieldLabel>
              <TextInput value={item.author ?? item.name ?? ""} onChange={(v) => {
                const upd = [...items]; upd[i] = { ...upd[i], author: v, name: v };
                updateItems(upd);
              }} placeholder="Jane Doe" />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Role / Title (optional)</FieldLabel>
              <TextInput value={item.role ?? item.position ?? ""} onChange={(v) => {
                const upd = [...items]; upd[i] = { ...upd[i], role: v, position: v };
                updateItems(upd);
              }} placeholder="CEO, Acme Corp" />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Review Text</FieldLabel>
              <TextArea value={item.quote ?? item.text ?? ""} rows={3} onChange={(v) => {
                const upd = [...items]; upd[i] = { ...upd[i], quote: v, text: v };
                updateItems(upd);
              }} placeholder="Write their testimonial here…" />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Star Rating (1–5)</FieldLabel>
              <TextInput type="number" value={String(item.rating ?? 5)} onChange={(v) => {
                const upd = [...items]; upd[i] = { ...upd[i], rating: Math.min(5, Math.max(1, parseInt(v) || 5)) };
                updateItems(upd);
              }} placeholder="5" />
            </FieldGroup>
          </CollapsibleCard>
        ))}

        <button
          onClick={() => updateItems([...items, { author: "", role: "", quote: "", rating: 5 }])}
          className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 border border-dashed border-slate-600 rounded-xl text-sm text-slate-400 hover:text-violet-400 hover:border-violet-500 transition"
        >
          <Plus size={16} /> Add Review
        </button>
      </div>
    );
  };

  const renderContact = () => {
    const contactEmail   = isScraperSite ? (bd.contact?.email   ?? bizEmail)   : bizEmail;
    const contactPhone   = isScraperSite ? (bd.contact?.phone   ?? bizPhone)   : bizPhone;
    const contactAddress = isScraperSite ? (bd.contact?.address ?? bizAddress) : bizAddress;
    const contactCity    = isScraperSite ? (bd.contact?.city    ?? bizCity)    : bizCity;

    const update = (field: string, value: string) => {
      if (isScraperSite) {
        const path = ["contact", field];
        updateBd(path, value);
      } else {
        switch (field) {
          case "email":   setBizEmail(value);   handleChatbotField("businessEmail",   value); break;
          case "phone":   setBizPhone(value);   handleChatbotField("businessPhone",   value); break;
          case "address": setBizAddress(value); handleChatbotField("businessAddress", value); break;
          case "city":    setBizCity(value);    handleChatbotField("businessCity",    value); break;
        }
      }
    };

    return (
      <div>
        <SectionDivider title="Contact Information" />
        <FieldGroup>
          <FieldLabel>Email Address</FieldLabel>
          <TextInput type="email" value={contactEmail} placeholder="hello@yourbusiness.com" onChange={(v) => update("email", v)} />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel>Phone Number</FieldLabel>
          <TextInput type="tel" value={contactPhone} placeholder="+1 (555) 123-4567" onChange={(v) => update("phone", v)} />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel>Street Address</FieldLabel>
          <TextArea value={contactAddress} rows={2} placeholder="123 Main St, Suite 100" onChange={(v) => update("address", v)} />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel>City</FieldLabel>
          <TextInput value={contactCity} placeholder="New York" onChange={(v) => update("city", v)} />
        </FieldGroup>
        {isScraperSite && (
          <FieldGroup>
            <FieldLabel>Calendly / Booking URL</FieldLabel>
            <TextInput
              value={bd.contact?.calendlyUrl ?? ""}
              placeholder="https://calendly.com/yourname"
              onChange={(v) => updateBd(["contact", "calendlyUrl"], v)}
            />
          </FieldGroup>
        )}
      </div>
    );
  };

  const renderColors = () => (
    <div>
      <SectionDivider title="Brand Colors" />
      <p className="text-xs text-slate-500 mb-4">
        These colors are used as your primary accent throughout the site.
      </p>
      <FieldGroup>
        <FieldLabel>Primary Color</FieldLabel>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => {
              setPrimaryColor(e.target.value);
              if (isScraperSite) { updateBd(["brand", "primaryColor"], e.target.value); }
              else { handleChatbotField("businessPrimaryColor", e.target.value); }
            }}
            className="h-10 w-14 rounded-lg border border-slate-600 cursor-pointer bg-transparent p-0.5"
          />
          <TextInput
            value={primaryColor}
            placeholder="#6366f1"
            onChange={(v) => {
              setPrimaryColor(v);
              if (isScraperSite) { updateBd(["brand", "primaryColor"], v); }
              else { handleChatbotField("businessPrimaryColor", v); }
            }}
          />
        </div>
      </FieldGroup>
      <FieldGroup>
        <FieldLabel>Secondary Color</FieldLabel>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={secondaryColor}
            onChange={(e) => {
              setSecondaryColor(e.target.value);
              if (isScraperSite) { updateBd(["brand", "secondaryColor"], e.target.value); }
              else { handleChatbotField("businessSecondaryColor", e.target.value); }
            }}
            className="h-10 w-14 rounded-lg border border-slate-600 cursor-pointer bg-transparent p-0.5"
          />
          <TextInput
            value={secondaryColor}
            placeholder="#8b5cf6"
            onChange={(v) => {
              setSecondaryColor(v);
              if (isScraperSite) { updateBd(["brand", "secondaryColor"], v); }
              else { handleChatbotField("businessSecondaryColor", v); }
            }}
          />
        </div>
      </FieldGroup>

      <div className="mt-4 p-4 rounded-xl border border-slate-700 bg-slate-800/50">
        <p className="text-xs text-slate-400 mb-3">Preview</p>
        <div className="flex gap-3">
          <div className="flex-1 h-12 rounded-lg flex items-center justify-center text-white text-xs font-semibold" style={{ backgroundColor: primaryColor }}>
            Primary
          </div>
          <div className="flex-1 h-12 rounded-lg flex items-center justify-center text-white text-xs font-semibold" style={{ backgroundColor: secondaryColor }}>
            Secondary
          </div>
        </div>
      </div>
    </div>
  );

  // ── Gallery ────────────────────────────────────────────────────────────────
  const renderGallery = () => {
    // Scraper: gallery lives in bd.gallery.data.images
    // Chatbot: gallery lives in business.galleryImages (passed via prop)
    const scraperImages: string[] = bd.gallery?.data?.images ?? bd.gallery?.images ?? [];
    const chatbotImages: string[] = business.galleryImages ?? [];
    const images: string[] = isScraperSite ? scraperImages : chatbotImages;

    const setImages = (next: string[]) => {
      if (isScraperSite) {
        // Try both known paths
        if (bd.gallery?.data) {
          updateBd(["gallery", "data", "images"], next);
        } else {
          updateBd(["gallery", "images"], next);
        }
      } else {
        handleChatbotField("businessGalleryImages", next);
      }
    };

    return (
      <div>
        <SectionDivider title="Gallery Images" />
        <p className="text-xs text-slate-500 mb-4">
          These images appear in the Gallery section of your website. Upload photos or paste image URLs.
        </p>

        {/* Image grid */}
        <div className="grid grid-cols-2 gap-3">
          {images.map((src, i) => (
            <div key={i} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Gallery ${i + 1}`}
                className="w-full h-24 object-cover rounded-xl border border-slate-700"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition rounded-xl flex flex-col items-center justify-center gap-1.5">
                {/* Replace via file pick */}
                <label className="flex items-center gap-1 px-2.5 py-1 bg-white/20 hover:bg-violet-500/70 text-white text-xs rounded-lg cursor-pointer transition">
                  <UploadCloud size={11} /> Replace
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const next = [...images];
                        next[i] = reader.result as string;
                        setImages(next);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                  className="flex items-center gap-1 px-2.5 py-1 bg-red-500/60 hover:bg-red-500/80 text-white text-xs rounded-lg transition"
                >
                  <X size={11} /> Remove
                </button>
              </div>
              <span className="absolute top-1 left-1.5 text-xs text-white/60 font-medium">{i + 1}</span>
            </div>
          ))}

          {/* Add new image slot */}
          <label className="flex flex-col items-center justify-center gap-2 h-24 border-2 border-dashed border-slate-600 rounded-xl text-slate-500 hover:border-violet-500 hover:text-violet-400 cursor-pointer transition">
            <UploadCloud size={20} />
            <span className="text-xs">Add Image</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onloadend = () => {
                  setImages([...images, reader.result as string]);
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>
        </div>

        {/* Or add by URL */}
        <div className="mt-4">
          <SectionDivider title="Add by URL" />
          <AddImageByUrl onAdd={(url) => setImages([...images, url])} />
        </div>

        {images.length === 0 && (
          <p className="text-center text-xs text-slate-600 mt-4">No gallery images yet. Upload some above.</p>
        )}
      </div>
    );
  };

  const tabContent: Record<string, () => React.ReactNode> = {
    general:      renderGeneral,
    hero:         renderHero,
    about:        renderAbout,
    services:     renderServices,
    gallery:      renderGallery,
    testimonials: renderTestimonials,
    contact:      renderContact,
    colors:       renderColors,
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 select-none">
      {/* Tab bar */}
      <nav className="shrink-0 overflow-x-auto border-b border-slate-700/60 px-2">
        <div className="flex gap-0.5 py-2 min-w-max">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap
                  ${active
                    ? "bg-violet-600 text-white shadow-sm shadow-violet-900/50"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {tabContent[activeTab]?.()}
      </div>

      {/* Site type badge */}
      <div className="shrink-0 px-4 py-3 border-t border-slate-700/60 bg-slate-900">
        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${isScraperSite ? "bg-blue-500/15 text-blue-400" : "bg-emerald-500/15 text-emerald-400"}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {isScraperSite ? `Scraper site · ${site.templateKind}` : "AI chatbot site"}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility: deep-set a value at a path in an object (immutable)
// ─────────────────────────────────────────────────────────────────────────────

function deepSet(obj: any, path: string[], value: any): any {
  if (path.length === 0) return value;
  const [head, ...tail] = path;
  return {
    ...obj,
    [head]: deepSet(obj?.[head] ?? {}, tail, value),
  };
}
