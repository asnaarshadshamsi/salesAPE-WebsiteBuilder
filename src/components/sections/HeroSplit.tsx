'use client';

import { SectionProps } from './types';

export function HeroSplit({ design, data }: SectionProps) {
  return (
    <section className="min-h-screen flex items-center" style={{ backgroundColor: design.colors.background }}>
      <div className="container mx-auto grid grid-cols-2 gap-12 items-center">
        <div style={{ color: design.colors.foreground }}>
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
              fontSize: design.typography.bodySize,
              marginBottom: design.spacing.xl,
              lineHeight: design.typography.bodyLineHeight,
              color: design.colors.mutedForeground
            }}
          >
            {data.subheadline}
          </p>
          <button
            style={{
              backgroundColor: design.colors.primary,
              color: 'white',
              padding: `${design.spacing.md} ${design.spacing.lg}`,
              borderRadius: design.borderRadius.md,
              fontSize: design.typography.bodySize,
              cursor: 'pointer',
              border: 'none',
              boxShadow: design.shadows.md,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = design.shadows.lg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = design.shadows.md;
            }}
          >
            {data.ctaText}
          </button>
        </div>
        {data.heroImage && (
          <div className="relative h-full">
            <img 
              src={data.heroImage} 
              alt="Hero"
              style={{
                borderRadius: design.borderRadius.lg,
                width: '100%',
                height: '500px',
                objectFit: 'cover',
                boxShadow: design.shadows.lg
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
