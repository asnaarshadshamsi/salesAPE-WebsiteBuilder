"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { EnhancedVisualEditor } from '@/components/editor/EnhancedVisualEditor';
import { updateSiteData } from '../../../actions/sites';
import { ArrowLeft, Save, Eye, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SiteEditorProps {
  site: any;
  business: any;
}

export default function SiteEditor() {
  const params = useParams();
  const router = useRouter();
  const [site, setSite] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    async function loadSite() {
      try {
        const response = await fetch(`/api/sites/${params.slug}/editor`);
        const data = await response.json();
        
        if (data.success) {
          setSite(data.site);
          setBusiness(data.business);
        } else {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error loading site:', error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    }

    if (params.slug) {
      loadSite();
    }
  }, [params.slug, router]);

  const handleSave = async (editorData: any) => {
    if (!site?.id) {
      alert('Error: Site ID not found');
      return;
    }

    setSaving(true);
    try {
      // The enhanced editor already converts data to the correct format
      const result = await updateSiteData(site.id, editorData);
      
      if (result.success) {
        setSite({ ...site, ...editorData });
        // Show success message
        alert('Site saved successfully!');
      } else {
        alert('Error saving site: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving site:', error);
      alert('Error saving site: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (!site?.slug) {
      alert('Error: Site slug not found');
      return;
    }
    window.open(`/sites/${site.slug}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto w-16 h-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Site not found</h1>
          <Button onClick={() => router.push('/dashboard')}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="flex items-center"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Dashboard
              </Button>
              
              <div className="border-l pl-4">
                <h1 className="text-lg font-semibold text-gray-900">
                  Editing: {business?.name}
                </h1>
                <p className="text-sm text-gray-500">{site.slug}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye size={16} className="mr-2" />
                {previewMode ? 'Edit Mode' : 'Preview'}
              </Button>

              <Button
                onClick={() => window.open(`/sites/${site.slug}`, '_blank')}
                variant="outline"
              >
                View Live Site
              </Button>

              <Button
                onClick={() => handleSave({})}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save size={16} className="mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="h-[calc(100vh-4rem)]">
        {previewMode ? (
          <div className="h-full">
            {/* Render the actual site for preview */}
            <iframe
              src={`/sites/${site.slug}?preview=true`}
              className="w-full h-full border-none"
              title="Site Preview"
            />
          </div>
        ) : (
          <EnhancedVisualEditor
            siteData={{ ...site, business }}
            onSave={handleSave}
          />
        )}
      </main>
    </div>
  );
}
