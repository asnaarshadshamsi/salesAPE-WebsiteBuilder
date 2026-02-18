'use client';

import { SectionProps } from './types';

export function CTASection({ design, data }: SectionProps) {
  return (
    <section 
      style={{
        background: `linear-gradient(135deg, ${design.colors.primary} 0%, ${design.colors.secondary} 100%)`,
        padding: design.spacing['3xl'] + ' 0',
        textAlign: 'center'
      }}
    >
      <div className="container mx-auto max-w-2xl" style={{ color: 'white' }}>
        <h2 
          style={{
            fontSize: design.typography.headingScale.h2.size,
            fontWeight: 'bold',
            marginBottom: design.spacing.lg,
            lineHeight: design.typography.headingScale.h2.lineHeight
          }}
        >
          {data.headline}
        </h2>
        <p 
          style={{
            fontSize: design.typography.headingScale.h4.size,
            marginBottom: design.spacing.xl,
            lineHeight: design.typography.headingScale.h4.lineHeight,
            opacity: 0.95
          }}
        >
          {data.description}
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
