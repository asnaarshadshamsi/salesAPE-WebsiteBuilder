'use client';

import { SectionProps } from './types';

export function HeroOverlay({ design, data }: SectionProps) {
  return (
    <section 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url(${data.heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${design.colors.primary}80 0%, ${design.colors.secondary}80 100%)`
        }}
      />
      <div className="container mx-auto max-w-2xl relative z-10 text-center text-white" style={{ padding: design.spacing.xl }}>
        <h1 
          style={{ 
            fontSize: design.typography.headingScale.h1.size,
            fontWeight: 'bold',
            marginBottom: design.spacing.lg,
            lineHeight: design.typography.headingScale.h1.lineHeight
          }}
        >
          {data.headline}
        </h1>
        <p 
          style={{ 
            fontSize: design.typography.headingScale.h2.size,
            marginBottom: design.spacing.xl,
            lineHeight: design.typography.headingScale.h2.lineHeight,
            opacity: 0.9
          }}
        >
          {data.subheadline}
        </p>
        <button
          style={{
            backgroundColor: 'white',
            color: design.colors.primary,
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
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = design.shadows.xl;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = design.shadows.lg;
          }}
        >
          {data.ctaText}
        </button>
      </div>
    </section>
  );
}
