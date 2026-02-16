"use client";

import { ShoppingBag, X } from "lucide-react";

interface ProductData {
  name: string;
  description?: string;
  price?: number;
  salePrice?: number;
  image?: string;
  category?: string;
}

interface ProductsDisplayProps {
  products: ProductData[];
  onRemove: (index: number) => void;
}

export function ProductsDisplay({ products, onRemove }: ProductsDisplayProps) {
  if (products.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <span className="w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full text-sm flex items-center justify-center">
          <ShoppingBag className="w-3 h-3" />
        </span>
        Products ({products.length})
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {products.slice(0, 8).map((product, i) => (
          <div
            key={i}
            className="bg-zinc-800 rounded-lg p-2 text-center relative group"
          >
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-16 object-cover rounded mb-1"
              />
            ) : (
              <div className="w-full h-16 bg-zinc-700 rounded mb-1 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-gray-500" />
              </div>
            )}
            <p className="text-xs text-gray-400 truncate">{product.name}</p>
            {product.price && (
              <p className="text-xs font-semibold text-pink-400">
                ${product.price}
              </p>
            )}
          </div>
        ))}
      </div>
      {products.length > 8 && (
        <p className="text-xs text-gray-400 text-center">
          +{products.length - 8} more products will be added
        </p>
      )}
    </div>
  );
}
