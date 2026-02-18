'use client';

import { SectionProps } from './types';
import { useState } from 'react';

export function GallerySection({ design, data }: SectionProps) {
  const images = data.items || [];
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

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
        <div className="grid grid-cols-4 gap-4">
          {images.map((image: any, idx: number) => (
            <div
              key={idx}
              className="group overflow-hidden rounded-lg cursor-pointer relative h-64"
              style={{
                borderRadius: design.borderRadius.lg,
                boxShadow: design.shadows.md,
                transition: 'all 0.3s ease'
              }}
              onClick={() => setSelectedImage(idx)}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.boxShadow = design.shadows.lg;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.boxShadow = design.shadows.md;
              }}
            >
              <img
                src={image.url || image}
                alt="Gallery"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease'
                }}
                className="group-hover:scale-110"
              />
              <div 
                className="absolute inset-0 flex items-end justify-start opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  padding: design.spacing.md
                }}
              >
                <p style={{ color: 'white', fontSize: design.typography.bodySize }}>
                  {image.title || `Gallery ${idx + 1}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
