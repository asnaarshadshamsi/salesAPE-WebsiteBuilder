'use client';

import { SectionProps } from './types';
import { useState } from 'react';

export function NewsletterSection({ design, data }: SectionProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section style={{ backgroundColor: design.colors.muted, padding: design.spacing['3xl'] + ' 0' }}>
      <div className="container mx-auto max-w-2xl text-center">
        <h2 
          style={{
            fontSize: design.typography.headingScale.h2.size,
            fontWeight: 'bold',
            marginBottom: design.spacing.sm,
            color: design.colors.foreground
          }}
        >
          {data.title || 'Stay Updated'}
        </h2>
        <p 
          style={{
            fontSize: design.typography.bodySize,
            color: design.colors.mutedForeground,
            marginBottom: design.spacing.lg
          }}
        >
          {data.description}
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: design.spacing.sm }}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              flex: 1,
              padding: design.spacing.md,
              borderRadius: design.borderRadius.md,
              border: `1px solid ${design.colors.border}`,
              fontSize: design.typography.bodySize,
              backgroundColor: design.colors.background,
              color: design.colors.foreground
            }}
          />
          <button
            type="submit"
            style={{
              backgroundColor: design.colors.primary,
              color: 'white',
              padding: `${design.spacing.md} ${design.spacing.lg}`,
              borderRadius: design.borderRadius.md,
              border: 'none',
              cursor: 'pointer',
              fontSize: design.typography.bodySize,
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = design.shadows.md;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {submitted ? 'Subscribed!' : 'Subscribe'}
          </button>
        </form>
      </div>
    </section>
  );
}
