"use client";

import { motion } from "framer-motion";
import { BusinessData } from "../../types/landing";
import { ShoppingCart } from "lucide-react";

interface ProductsSectionProps {
  data: NonNullable<BusinessData["products"]>;
}

const ProductsSection = ({ data }: ProductsSectionProps) => {
  return (
    <section id="products" className="py-24 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {data.title && (
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              {data.title}
            </h2>
          )}
          {data.subtitle && (
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              {data.subtitle}
            </p>
          )}
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.items.map((product, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative rounded-xl bg-card border border-border hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col"
            >
              {/* Product Image */}
              {product.image ? (
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <ShoppingCart className="w-16 h-16 text-muted-foreground/30" />
                </div>
              )}

              {/* Sale Badge */}
              {product.salePrice && product.price && product.salePrice < product.price && (
                <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  SALE
                </div>
              )}

              {/* Product Info */}
              <div className="p-5 flex flex-col flex-1">
                {product.category && (
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    {product.category}
                  </div>
                )}
                
                <h3 className="font-display text-lg font-semibold text-card-foreground mb-2 line-clamp-2">
                  {product.name}
                </h3>
                
                {product.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                    {product.description}
                  </p>
                )}

                {/* Pricing */}
                <div className="flex items-center gap-2 mt-auto">
                  {product.salePrice && product.price && product.salePrice < product.price ? (
                    <>
                      <span className="text-xl font-bold text-destructive">
                        ${product.salePrice.toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        ${product.price.toFixed(2)}
                      </span>
                    </>
                  ) : product.price ? (
                    <span className="text-xl font-bold text-foreground">
                      ${product.price.toFixed(2)}
                    </span>
                  ) : null}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Products CTA */}
        {data.items.length > 8 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <a
              href="#products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-lg transition-colors"
            >
              View All Products
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;
