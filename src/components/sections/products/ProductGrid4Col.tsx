/**
 * Product Grid - 4 Column Luxury Layout
 * Premium product grid with spacious layout
 * Best for: Luxury, High-end brands
 */

"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { DesignSystem } from "@/services/design-system-resolver.service";
import { ProductData } from "@/types/product";
import { ShoppingBag } from "lucide-react";

export interface ProductGrid4ColProps {
  title?: string;
  subtitle?: string;
  products: ProductData[];
  designSystem: DesignSystem;
  showAddToCart?: boolean;
}

export function ProductGrid4Col({
  title,
  subtitle,
  products,
  designSystem,
  showAddToCart = true,
}: ProductGrid4ColProps) {
  const { typography, spacing, colors, animations, borderRadius, shadows } = designSystem;

  return (
    <section
      style={{
        backgroundColor: colors.background,
        paddingTop: spacing.section,
        paddingBottom: spacing.section,
      }}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        {title && (
          <div className="text-center mb-20">
            <motion.h2
              style={{
                fontSize: typography.h1.size,
                lineHeight: typography.h1.lineHeight,
                fontWeight: typography.h1.weight,
                letterSpacing: typography.h1.letterSpacing,
                color: colors.foreground,
                fontFamily: typography.fontFamily.heading,
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {title}
            </motion.h2>
            {subtitle && (
              <motion.p
                style={{
                  fontSize: typography.h3.size,
                  color: colors.foreground,
                  opacity: 0.7,
                  marginTop: spacing.md,
                  fontFamily: typography.fontFamily.body,
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 0.7, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {products.slice(0, 8).map((product, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <motion.div
                className="group cursor-pointer"
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {/* Product Image */}
                <div
                  className="relative overflow-hidden mb-6"
                  style={{
                    borderRadius: borderRadius.md,
                    aspectRatio: '3/4',
                  }}
                >
                  <motion.img
                    src={product.image || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                  />
                  
                  {/* Sale Badge */}
                  {product.salePrice && (
                    <div
                      className="absolute top-4 right-4 px-3 py-1 backdrop-blur-sm"
                      style={{
                        backgroundColor: colors.accent,
                        color: colors.background,
                        borderRadius: borderRadius.md,
                        fontSize: typography.small.size,
                        fontWeight: typography.h3.weight,
                      }}
                    >
                      SALE
                    </div>
                  )}

                  {/* Quick View Overlay */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      backgroundColor: `${colors.foreground}`,
                      opacity: 0,
                    }}
                    whileHover={{ opacity: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    {showAddToCart && (
                      <Button
                        style={{
                          backgroundColor: colors.background,
                          color: colors.foreground,
                          borderRadius: borderRadius.lg,
                          padding: `${spacing.sm} ${spacing.lg}`,
                        }}
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Quick View
                      </Button>
                    )}
                  </motion.div>
                </div>

                {/* Product Info */}
                <div className="text-center">
                  {product.category && (
                    <p
                      style={{
                        fontSize: typography.small.size,
                        color: colors.foreground,
                        opacity: 0.5,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: spacing.xs,
                        fontFamily: typography.fontFamily.body,
                      }}
                    >
                      {product.category}
                    </p>
                  )}
                  
                  <h3
                    style={{
                      fontSize: typography.h3.size,
                      fontWeight: typography.body.weight,
                      color: colors.foreground,
                      marginBottom: spacing.sm,
                      fontFamily: typography.fontFamily.heading,
                    }}
                  >
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-center justify-center gap-3">
                    {product.salePrice ? (
                      <>
                        <span
                          style={{
                            fontSize: typography.body.size,
                            color: colors.foreground,
                            opacity: 0.4,
                            textDecoration: 'line-through',
                          }}
                        >
                          ${product.price}
                        </span>
                        <span
                          style={{
                            fontSize: typography.h3.size,
                            fontWeight: typography.h1.weight,
                            color: colors.accent,
                          }}
                        >
                          ${product.salePrice}
                        </span>
                      </>
                    ) : (
                      <span
                        style={{
                          fontSize: typography.h3.size,
                          fontWeight: typography.h3.weight,
                          color: colors.foreground,
                        }}
                      >
                        ${product.price}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        {products.length > 8 && (
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button
              size="lg"
              style={{
                backgroundColor: 'transparent',
                color: colors.foreground,
                border: `2px solid ${colors.border}`,
                borderRadius: borderRadius.md,
                padding: `${spacing.sm} ${spacing.xl}`,
                fontSize: typography.body.size,
              }}
            >
              View All Products
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
