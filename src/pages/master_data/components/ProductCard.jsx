import React from 'react';
import { FaStar } from 'react-icons/fa';

function ProductCard({ product }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      <div className="bg-gray-50 flex items-center justify-center p-4 min-h-[360px]">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover"
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x300/EEE/AAA?text=Image+Error'; }}
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-2">{product.category}</p>
        <div className="flex justify-between items-center">
          <p className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</p>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <FaStar className="text-yellow-400" />
            <span>{product.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
