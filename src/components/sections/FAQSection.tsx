'use client';

import { SectionProps } from './types';
import { useState } from 'react';

export function FAQSection({ design, data }: SectionProps) {
  const faqs = data.items || [];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section style={{ backgroundColor: design.colors.background, padding: design.spacing['3xl'] + ' 0' }}>
      <div className="container mx-auto max-w-3xl">
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
        <div className="space-y-4">
          {faqs.map((faq: any, idx: number) => (
            <div
              key={idx}
              style={{
                borderRadius: design.borderRadius.md,
                border: `1px solid ${design.colors.border}`,
                backgroundColor: design.colors.card,
                overflow: 'hidden'
              }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                style={{
                  width: '100%',
                  padding: design.spacing.lg,
                  textAlign: 'left',
                  backgroundColor: design.colors.card,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: design.typography.bodySize,
                  fontWeight: 'bold',
                  color: design.colors.foreground,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = design.colors.muted;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = design.colors.card;
                }}
              >
                {faq.question}
                <span>{openIndex === idx ? '−' : '+'}</span>
              </button>
              {openIndex === idx && (
                <div
                  style={{
                    padding: design.spacing.lg,
                    backgroundColor: design.colors.background,
                    borderTop: `1px solid ${design.colors.border}`,
                    color: design.colors.mutedForeground,
                    fontSize: design.typography.bodySize
                  }}
                >
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
