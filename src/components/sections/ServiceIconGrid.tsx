'use client';

import { SectionProps } from './types';

export function ServiceIconGrid({ design, data }: SectionProps) {
  const services = data.items || [];

  return (
    <section style={{ backgroundColor: design.colors.background, padding: design.spacing['3xl'] + ' 0' }}>
      <div className="container mx-auto">
        <h2 
          style={{
            fontSize: design.typography.headingScale.h2.size,
            fontWeight: 'bold',
            marginBottom: design.spacing.lg,
            color: design.colors.foreground,
            textAlign: 'center'
          }}
        >
          {data.title}
        </h2>
        <p 
          style={{
            fontSize: design.typography.bodySize,
            color: design.colors.mutedForeground,
            textAlign: 'center',
            marginBottom: design.spacing['2xl'],
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}
        >
          {data.subtitle}
        </p>
        <div className="grid grid-cols-3 gap-8">
          {services.map((service: any, idx: number) => (
            <div
              key={idx}
              className="text-center group"
              style={{
                padding: design.spacing.lg,
                borderRadius: design.borderRadius.lg,
                backgroundColor: design.colors.card,
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.boxShadow = design.shadows.lg;
                el.style.transform = 'translateY(-8px)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.boxShadow = design.shadows.sm;
                el.style.transform = 'translateY(0)';
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: design.colors.primary,
                  borderRadius: design.borderRadius.full,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto ' + design.spacing.md,
                  fontSize: '2xl',
                  color: 'white',
                  transition: 'transform 0.3s ease'
                }}
                className="group-hover:scale-110"
              >
                {service.icon || '✨'}
              </div>
              <h3 style={{ fontSize: design.typography.headingScale.h4.size, fontWeight: 'bold', marginBottom: design.spacing.sm, color: design.colors.foreground }}>
                {service.name}
              </h3>
              <p style={{ fontSize: design.typography.bodySize, color: design.colors.mutedForeground }}>
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
