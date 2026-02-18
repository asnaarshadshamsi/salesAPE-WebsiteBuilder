/**
 * Product Grid - 3 Column Layout
 * Standard product grid with hover effects
 * Best for: General e-commerce, Corporate
 */

"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { DesignSystem } from "@/services/design-system-resolver.service";
import { ProductData } from "@/types/product";

export interface ProductGrid3ColProps {
  title?: string;
  subtitle?: string;
  products: ProductData[];
  designSystem: DesignSystem;
  showAddToCart?: boolean;
}

export function ProductGrid3Col({
  title,
  subtitle,
  products,
  designSystem,
  showAddToCart = true,
}: ProductGrid3ColProps) {
  const { typography, spacing, colors, animations, borderRadius, shadows } = designSystem;

  return (
    <section
      style={{
        backgroundColor: colors.background,
        paddingTop: spacing.section,
        paddingBottom: spacing.section,
      }}
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        {title && (
          <div className="text-center mb-12" style={{ marginBottom: spacing['2xl'] }}>
            <motion.h2
              style={{
                fontSize: typography.h2.size,
                lineHeight: typography.h2.lineHeight,
                fontWeight: typography.h2.weight,
                letterSpacing: typography.h2.letterSpacing,
                color: colors.foreground,
                marginBottom: spacing.sm,
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: parseFloat(animations.durations.normal) * 2 }}
            >
              {title}
            </motion.h2>
            {subtitle && (
              <motion.p
                style={{
                  fontSize: typography.body.size,
                  color: colors.mutedForeground,
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: parseFloat(animations.durations.normal) * 2, delay: 0.1 }}
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={index}
              className="group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: parseFloat(animations.durations.normal) * 2,
                delay: index * 0.1,
                ease: "easeOut",
              }}
            >
              <div
                className="overflow-hidden"
                style={{
                  backgroundColor: colors.card,
                  borderRadius: borderRadius.card,
                  boxShadow: shadows.card,
                  transition: `all ${animations.durations.normal} ${animations.easings.easeOut}`,
                }}
              >
                {/* Product Image */}
                <div className="relative overflow-hidden aspect-square">
                  {product.image ? (
                    <motion.img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.4 }}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: colors.muted }}
                    >
                      <svg
                        className="w-20 h-20 opacity-30"
                        style={{ color: colors.mutedForeground }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Sale Badge */}
                  {product.salePrice && product.price && product.salePrice < product.price && (
                    <div
                      className="absolute top-4 right-4 px-3 py-1"
                      style={{
                        backgroundColor: colors.accent,
                        color: colors.background,
                        borderRadius: borderRadius.sm,
                        fontSize: typography.small.size,
                        fontWeight: typography.small.weight,
                      }}
                    >
                      Sale
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div style={{ padding: spacing.md }}>
                  {product.category && (
                    <div
                      style={{
                        fontSize: typography.small.size,
                        color: colors.mutedForeground,
                        marginBottom: spacing.xs,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {product.category}
                    </div>
                  )}

                  <h3
                    style={{
                      fontSize: typography.h4.size,
                      fontWeight: typography.h4.weight,
                      color: colors.foreground,
                      marginBottom: spacing.xs,
                    }}
                  >
                    {product.name}
                  </h3>

                  {product.description && (
                    <p
                      className="line-clamp-2"
                      style={{
                        fontSize: typography.small.size,
                        color: colors.mutedForeground,
                        marginBottom: spacing.sm,
                      }}
                    >
                      {product.description}
                    </p>
                  )}

                  {/* Price */}
                  <div className="flex items-center gap-2" style={{ marginBottom: spacing.sm }}>
                    {product.salePrice ? (
                      <>
                        <span
                          style={{
                            fontSize: typography.h4.size,
                            fontWeight: typography.h4.weight,
                            color: colors.accent,
                          }}
                        >
                          ${product.salePrice.toFixed(2)}
                        </span>
                        <span
                          className="line-through"
                          style={{
                            fontSize: typography.body.size,
                            color: colors.mutedForeground,
                          }}
                        >
                          ${product.price?.toFixed(2)}
                        </span>
                      </>
                    ) : product.price ? (
                      <span
                        style={{
                          fontSize: typography.h4.size,
                          fontWeight: typography.h4.weight,
                          color: colors.foreground,
                        }}
                      >
                        ${product.price.toFixed(2)}
                      </span>
                    ) : null}
                  </div>

                  {/* Add to Cart Button */}
                  {showAddToCart && (
                    <Button
                      className="w-full hover:scale-105"
                      style={{
                        backgroundColor: colors.primary,
                        color: colors.background,
                        borderRadius: borderRadius.button,
                        transition: `all ${animations.durations.normal} ${animations.easings.easeOut}`,
                      }}
                    >
                      Add to Cart
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
