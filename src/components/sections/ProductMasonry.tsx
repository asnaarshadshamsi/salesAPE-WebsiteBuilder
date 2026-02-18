'use client';

import { SectionProps } from './types';

export function ProductMasonry({ design, data }: SectionProps) {
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
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
          {products.map((product: any, idx: number) => (
            <div
              key={idx}
              className="break-inside-avoid group mb-6 overflow-hidden rounded-lg cursor-pointer"
              style={{
                backgroundColor: design.colors.card,
                boxShadow: design.shadows.md,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.boxShadow = design.shadows.lg;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.boxShadow = design.shadows.md;
              }}
            >
              {product.image && (
                <div className="overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      transition: 'transform 0.3s ease'
                    }}
                    className="group-hover:scale-110"
                  />
                </div>
              )}
              <div style={{ padding: design.spacing.md }}>
                <h3 style={{ fontSize: design.typography.headingScale.h4.size, fontWeight: 'bold', marginBottom: design.spacing.xs, color: design.colors.foreground }}>
                  {product.name}
                </h3>
                {product.price && (
                  <p style={{ fontSize: design.typography.headingScale.h5.size, color: design.colors.primary, fontWeight: 'bold' }}>
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
