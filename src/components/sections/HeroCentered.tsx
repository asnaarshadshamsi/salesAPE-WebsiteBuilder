'use client';

import { SectionProps } from './types';

export function HeroCentered({ design, data }: SectionProps) {
  return (
    <section 
      className="min-h-screen flex items-center justify-center text-center relative overflow-hidden"
      style={{ backgroundColor: design.colors.background }}
    >
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${design.colors.primary}20 0%, ${design.colors.secondary}20 100%)`
        }}
      />
      <div className="container mx-auto max-w-3xl relative z-10" style={{ padding: design.spacing.xl }}>
        <h1 
          style={{ 
            fontSize: design.typography.headingScale.h1.size,
            fontWeight: 'bold',
            marginBottom: design.spacing.lg,
            color: design.colors.foreground,
            lineHeight: design.typography.headingScale.h1.lineHeight
          }}
        >
          {data.headline}
        </h1>
        <p 
          style={{ 
            fontSize: design.typography.headingScale.h2.size,
            marginBottom: design.spacing.xl,
            color: design.colors.mutedForeground,
            lineHeight: design.typography.headingScale.h2.lineHeight
          }}
        >
          {data.subheadline}
        </p>
        <button
          style={{
            backgroundColor: design.colors.primary,
            color: 'white',
            padding: `${design.spacing.md} ${design.spacing.xl}`,
            borderRadius: design.borderRadius.full,
            fontSize: design.typography.bodySize,
            cursor: 'pointer',
            border: 'none',
            boxShadow: design.shadows.lg,
            transition: 'all 0.3s ease',
            fontWeight: 600
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = design.shadows.xl;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = design.shadows.lg;
          }}
        >
          {data.ctaText}
        </button>
      </div>
    </section>
  );
}
