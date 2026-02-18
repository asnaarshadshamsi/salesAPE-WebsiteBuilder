'use client';

import { SectionProps } from './types';

export function ProductLuxury({ design, data }: SectionProps) {
  const products = data.items || [];

  return (
    <section style={{ backgroundColor: design.colors.background, padding: design.spacing['3xl'] + ' 0' }}>
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
          {data.title}
        </h2>
        <div className="grid grid-cols-2 gap-12">
          {products.map((product: any, idx: number) => (
            <div
              key={idx}
              className="group relative overflow-hidden"
              style={{
                borderRadius: design.borderRadius.lg,
                backgroundColor: design.colors.card,
                boxShadow: design.shadows.md,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.boxShadow = design.shadows.xl;
                el.style.transform = 'translateY(-8px)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.boxShadow = design.shadows.md;
                el.style.transform = 'translateY(0)';
              }}
            >
              {product.image && (
                <div className="overflow-hidden h-80">
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                    className="group-hover:scale-110"
                  />
                </div>
              )}
              <div style={{ padding: design.spacing.lg }}>
                <h3 style={{ fontSize: design.typography.headingScale.h3.size, fontWeight: 'bold', marginBottom: design.spacing.sm, color: design.colors.foreground }}>
                  {product.name}
                </h3>
                {product.description && (
                  <p style={{ fontSize: design.typography.bodySize, color: design.colors.mutedForeground, marginBottom: design.spacing.md }}>
                    {product.description}
                  </p>
                )}
                {product.price && (
                  <p style={{ fontSize: design.typography.headingScale.h4.size, fontWeight: 'bold', color: design.colors.primary }}>
                    ${product.price}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
