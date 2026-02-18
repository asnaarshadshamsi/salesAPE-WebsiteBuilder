'use client';

import { SectionProps } from './types';

export function TestimonialsSection({ design, data }: SectionProps) {
  const testimonials = data.items || [];

  return (
    <section style={{ backgroundColor: design.colors.card, padding: design.spacing['3xl'] + ' 0' }}>
      <div className="container mx-auto">
        <h2 
          style={{
            fontSize: design.typography.headingScale.h2.size,
            fontWeight: 'bold',
            marginBottom: design.spacing.xl,
            color: design.colors.foreground,
            textAlign: 'center'
          }}
        >
          {data.title || 'What Our Clients Say'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial: any, idx: number) => (
            <div
              key={idx}
              style={{
                padding: design.spacing.lg,
                borderRadius: design.borderRadius.lg,
                backgroundColor: design.colors.background,
                boxShadow: design.shadows.md,
                border: `1px solid ${design.colors.border}`
              }}
            >
              <div style={{ marginBottom: design.spacing.md }}>
                {'★'.repeat(testimonial.rating || 5)}
              </div>
              <p 
                style={{
                  fontSize: design.typography.bodySize,
                  color: design.colors.foreground,
                  marginBottom: design.spacing.lg,
                  fontStyle: 'italic'
                }}
              >
                "{testimonial.text}"
              </p>
              <p style={{ fontSize: design.typography.bodySize, fontWeight: 'bold', color: design.colors.foreground }}>
                {testimonial.name}
              </p>
              {testimonial.title && (
                <p style={{ fontSize: design.typography.bodySize, color: design.colors.mutedForeground }}>
                  {testimonial.title}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
