import React from "react";
import { FiTag, FiMoreHorizontal } from "react-icons/fi";

function ProductCard({ product }) {
  // Construct the full image URL from the backend's storage path
  const imageUrl = product.image
    ? `${import.meta.env.VITE_API_BASE_URL}/storage/${product.image}`
    : "https://placehold.co/400x400/f1f5f9/64748b?text=No+Image";

  return (
    <div className="group relative bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
      <div className="bg-slate-50 aspect-square flex items-center justify-center overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/400x400/f1f5f9/64748b?text=No+Image";
          }}
        />
      </div>
      <div className="p-4 space-y-2">
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
          {product.category?.name || "Uncategorized"}
        </p>
        <h3
          className="text-base font-bold text-slate-800 truncate"
          title={product.name}
        >
          {product.name}
        </h3>
        <div className="flex justify-between items-center">
          <p className="text-lg font-extrabold text-slate-900">
            ${Number(product.sell_price).toFixed(2)}
          </p>
          <div className="flex items-center gap-1 text-sm text-slate-500 font-medium">
            <FiTag className="w-4 h-4" />
            <span>{product.sku}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
