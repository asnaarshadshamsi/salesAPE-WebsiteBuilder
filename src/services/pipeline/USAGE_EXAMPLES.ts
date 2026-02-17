/**
 * Landing Page Generation Pipeline - Usage Example
 * 
 * This file demonstrates how to use the complete pipeline to generate
 * landing pages from various input sources.
 */

import { generateLandingPage } from './landing-page-pipeline.service';
import { adaptToTemplateFormat } from './template-adapter.service';

// ==================== EXAMPLE 1: URL ONLY ====================

export async function exampleUrlOnly() {
  const result = await generateLandingPage({
    url: 'https://example.com'
  });

  console.log('Generated with confidence:', result.meta.confidence);
  console.log('Missing fields:', result.meta.missingFields);
  console.log('Warnings:', result.warnings);

  // Convert to template format
  const templateData = adaptToTemplateFormat(result.data);
  
  return {
    ...templateData,
    pipelineMeta: result.meta,
  };
}

// ==================== EXAMPLE 2: TEXT ONLY ====================

export async function exampleTextOnly() {
  const result = await generateLandingPage({
    text: `
      I run a boutique digital marketing agency called "Creative Minds".
      We specialize in social media marketing, content creation, and brand strategy.
      Our target audience is small to medium businesses looking to grow their online presence.
      We pride ourselves on personalized service and data-driven results.
      Contact: hello@creativeminds.com
    `
  });

  return adaptToTemplateFormat(result.data);
}

// ==================== EXAMPLE 3: VOICE ONLY ====================

export async function exampleVoiceOnly() {
  const result = await generateLandingPage({
    voice: `
      Hi, I'm Sarah and I run a fitness studio in San Francisco.
      We offer personal training, group classes, yoga, and nutrition coaching.
      Our studio is modern, welcoming, and focused on helping people achieve
      their health goals in a supportive environment.
    `
  });

  return adaptToTemplateFormat(result.data);
}

// ==================== EXAMPLE 4: URL + TEXT (COMBINED) ====================

export async function exampleUrlPlusText() {
  const result = await generateLandingPage({
    url: 'https://existingwebsite.com',
    text: `
      Update: We now offer 24/7 customer support and have expanded 
      our services to include AI-powered analytics.
      New contact: support@newdomain.com
      We want a modern, professional tone with blue and purple colors.
    `
  });

  // The pipeline will intelligently merge:
  // - Website data (images, existing colors, structure)
  // - User input (new services, tone, color preferences)
  
  console.log('Data sources:', result.meta.sources);
  console.log('Merged with confidence:', result.meta.confidence);

  return adaptToTemplateFormat(result.data);
}

// ==================== EXAMPLE 5: REACT COMPONENT USAGE ====================

/**
 * Example React component using the pipeline
 */
/*
import { useState } from 'react';
import { AgencyTemplate } from '@/components/templates/AgencyTemplate';
import { generateLandingPage } from '@/services/pipeline/landing-page-pipeline.service';
import { adaptToTemplateFormat } from '@/services/pipeline/template-adapter.service';

export function LandingPageGenerator() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  async function handleGenerate(url?: string, text?: string) {
    setLoading(true);
    try {
      const result = await generateLandingPage({ url, text });
      const templateData = adaptToTemplateFormat(result.data);
      setData(templateData);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState('loading');
    
    // Submit form data
    setTimeout(() => {
      setFormState('success');
      setTimeout(() => setFormState('idle'), 3000);
    }, 1000);
  }

  if (loading) return <div>Generating landing page...</div>;
  if (!data) return <div>Enter URL or description to generate</div>;

  return (
    <AgencyTemplate
      site={data.site}
      business={data.business}
      products={data.products}
      formState={formState}
      formData={formData}
      onFormChange={setFormData}
      onFormSubmit={handleFormSubmit}
    />
  );
}
*/

// ==================== EXAMPLE 6: API ROUTE USAGE ====================

/**
 * Example Next.js API route
 */
/*
// app/api/generate-landing-page/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateLandingPage } from '@/services/pipeline/landing-page-pipeline.service';
import { adaptToTemplateFormat } from '@/services/pipeline/template-adapter.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, text, voice } = body;

    // Generate landing page
    const result = await generateLandingPage({ url, text, voice });

    // Convert to template format
    const templateData = adaptToTemplateFormat(result.data);

    return NextResponse.json({
      success: true,
      data: templateData,
      meta: result.meta,
      warnings: result.warnings,
    });
  } catch (error) {
    console.error('Landing page generation failed:', error);
    return NextResponse.json(
      { success: false, error: 'Generation failed' },
      { status: 500 }
    );
  }
}
*/

// ==================== EXAMPLE 7: SERVER ACTION USAGE ====================

/**
 * Example Next.js Server Action
 */
/*
// actions/landing-page.ts
'use server'

import { generateLandingPage } from '@/services/pipeline/landing-page-pipeline.service';
import { adaptToTemplateFormat } from '@/services/pipeline/template-adapter.service';

export async function generateLandingPageAction(input: {
  url?: string;
  text?: string;
  voice?: string;
}) {
  try {
    const result = await generateLandingPage(input);
    const templateData = adaptToTemplateFormat(result.data);

    return {
      success: true,
      data: templateData,
      meta: result.meta,
      warnings: result.warnings,
    };
  } catch (error) {
    console.error('Generation failed:', error);
    return {
      success: false,
      error: 'Failed to generate landing page',
    };
  }
}
*/
