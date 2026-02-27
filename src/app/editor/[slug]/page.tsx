"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Eye, ExternalLink, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { SiteEditorPanel, EditorChanges } from "@/components/editor/SiteEditorPanel";
import { saveSiteEditorChanges } from "@/actions/sites";

// ─────────────────────────────────────────────────────────────────────────────
// Save-status indicator
// ─────────────────────────────────────────────────────────────────────────────
type SaveStatus = "idle" | "saving" | "saved" | "error";

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  if (status === "saving")
    return <span className="flex items-center gap-1.5 text-xs text-slate-400"><RefreshCw size={13} className="animate-spin" /> Saving…</span>;
  if (status === "saved")
    return <span className="flex items-center gap-1.5 text-xs text-emerald-400"><CheckCircle size={13} /> Saved</span>;
  return <span className="flex items-center gap-1.5 text-xs text-red-400"><AlertCircle size={13} /> Save failed</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function SiteEditorPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [site, setSite] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isDirty, setIsDirty] = useState(false);
  const [previewKey, setPreviewKey] = useState(0); // bump to force iframe reload

  // Accumulate pending changes between saves
  const pendingChanges = useRef<EditorChanges>({});
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load site ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const res = await fetch(`/api/sites/${slug}/editor`);
        const data = await res.json();
        if (data.success) {
          setSite(data.site);
          setBusiness(data.business);
        } else {
          router.push("/dashboard");
        }
      } catch {
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, router]);

  // ── Persist changes ────────────────────────────────────────────────────────
  const persist = useCallback(async (changes: EditorChanges) => {
    if (!site?.id) return;
    setSaveStatus("saving");
    try {
      const result = await saveSiteEditorChanges(site.id, changes);
      if (result.success) {
        setSaveStatus("saved");
        setIsDirty(false);
        pendingChanges.current = {};
        // Refresh the preview iframe after a successful save
        setPreviewKey((k) => k + 1);
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    }
  }, [site?.id]);

  // ── onChange from panel → merge + auto-save ────────────────────────────────
  const handleChange = useCallback((changes: EditorChanges) => {
    pendingChanges.current = { ...pendingChanges.current, ...changes };
    setIsDirty(true);
    setSaveStatus("idle");

    // Debounce: auto-save 2 s after last keystroke
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      persist(pendingChanges.current);
    }, 2000);
  }, [persist]);

  // ── Manual save ────────────────────────────────────────────────────────────
  const handleManualSave = () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    persist(pendingChanges.current);
  };

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-violet-500 mx-auto" />
          <p className="mt-4 text-slate-400 text-sm">Loading editor…</p>
        </div>
      </div>
    );
  }

  if (!site || !business) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-white text-lg font-semibold">Site not found</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="shrink-0 flex items-center justify-between px-4 h-14 border-b border-slate-800 bg-slate-900 z-10">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition"
          >
            <ArrowLeft size={15} />
            Dashboard
          </button>
          <span className="text-slate-700">|</span>
          <div>
            <span className="text-white text-sm font-semibold">{business.name}</span>
            <span className="ml-2 text-slate-500 text-xs">{slug}</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <SaveIndicator status={saveStatus} />

          {isDirty && saveStatus !== "saving" && (
            <span className="text-xs text-amber-400">Unsaved changes</span>
          )}

          <button
            onClick={() => window.open(`/sites/${slug}`, "_blank")}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs border border-slate-700 rounded-lg px-3 py-1.5 transition hover:border-slate-500"
          >
            <Eye size={13} />
            View Live
            <ExternalLink size={11} />
          </button>

          <button
            onClick={handleManualSave}
            disabled={saveStatus === "saving"}
            className="flex items-center gap-1.5 text-white text-xs bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg px-3 py-1.5 transition font-medium"
          >
            <Save size={13} />
            Save
          </button>
        </div>
      </header>

      {/* ── Split pane ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: editor panel */}
        <aside className="w-72 shrink-0 overflow-hidden border-r border-slate-800">
          <SiteEditorPanel
            site={site}
            business={business}
            onChange={handleChange}
          />
        </aside>

        {/* Right: live preview */}
        <main className="flex-1 overflow-hidden bg-slate-800 flex flex-col">
          {/* Preview toolbar */}
          <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-900">
            <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">Preview</span>
            <button
              onClick={() => setPreviewKey((k) => k + 1)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition"
            >
              <RefreshCw size={12} />
              Refresh
            </button>
          </div>

          {/* Iframe */}
          <div className="flex-1 overflow-hidden p-4">
            <iframe
              key={previewKey}
              src={`/sites/${slug}?preview=true&t=${previewKey}`}
              className="w-full h-full rounded-xl border border-slate-700 bg-white"
              title="Site Preview"
            />
          </div>
        </main>
      </div>
    </div>
  );
}
