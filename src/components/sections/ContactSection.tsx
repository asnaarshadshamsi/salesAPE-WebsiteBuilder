'use client';

import { SectionProps } from './types';

export function ContactSection({ design, data }: SectionProps) {
  return (
    <section style={{ backgroundColor: design.colors.background, padding: design.spacing['3xl'] + ' 0' }}>
      <div className="container mx-auto max-w-4xl">
        <h2 
          style={{
            fontSize: design.typography.headingScale.h2.size,
            fontWeight: 'bold',
            marginBottom: design.spacing.xl,
            color: design.colors.foreground,
            textAlign: 'center'
          }}
        >
          {data.title || 'Get In Touch'}
        </h2>
        <div className="grid grid-cols-2 gap-12">
          <div>
            <h3 style={{ fontSize: design.typography.headingScale.h3.size, fontWeight: 'bold', marginBottom: design.spacing.lg, color: design.colors.foreground }}>
              Contact Info
            </h3>
            {data.phone && (
              <p style={{ fontSize: design.typography.bodySize, marginBottom: design.spacing.md, color: design.colors.mutedForeground }}>
                <strong>Phone:</strong>{' '}
                <a 
                  href={`tel:${data.phone.replace(/[^\d+]/g, '')}`}
                  style={{ color: design.colors.primary, textDecoration: 'underline' }}
                >
                  {data.phone}
                </a>
              </p>
            )}
            {data.email && (
              <p style={{ fontSize: design.typography.bodySize, marginBottom: design.spacing.md, color: design.colors.mutedForeground }}>
                <strong>Email:</strong>{' '}
                <a 
                  href={`mailto:${data.email}`}
                  style={{ color: design.colors.primary, textDecoration: 'underline' }}
                >
                  {data.email}
                </a>
              </p>
            )}
            {data.address && (
              <p style={{ fontSize: design.typography.bodySize, color: design.colors.mutedForeground }}>
                <strong>Address:</strong> {data.address}
              </p>
            )}
          </div>
          <form style={{ display: 'flex', flexDirection: 'column', gap: design.spacing.md }}>
            <input
              type="text"
              placeholder="Your Name"
              style={{
                padding: design.spacing.md,
                borderRadius: design.borderRadius.md,
                border: `1px solid ${design.colors.border}`,
                backgroundColor: design.colors.card,
                fontSize: design.typography.bodySize
              }}
            />
            <input
              type="email"
              placeholder="Your Email"
              style={{
                padding: design.spacing.md,
                borderRadius: design.borderRadius.md,
                border: `1px solid ${design.colors.border}`,
                backgroundColor: design.colors.card,
                fontSize: design.typography.bodySize
              }}
            />
            <textarea
              placeholder="Your Message"
              rows={4}
              style={{
                padding: design.spacing.md,
                borderRadius: design.borderRadius.md,
                border: `1px solid ${design.colors.border}`,
                backgroundColor: design.colors.card,
                fontSize: design.typography.bodySize,
                resize: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: design.colors.primary,
                color: 'white',
                padding: design.spacing.md,
                borderRadius: design.borderRadius.md,
                border: 'none',
                cursor: 'pointer',
                fontSize: design.typography.bodySize,
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
