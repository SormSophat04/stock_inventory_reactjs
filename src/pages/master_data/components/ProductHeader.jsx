import React from 'react';
import { FaPlus } from 'react-icons/fa';

function ProductHeader({ openModal }) {
  return (
    <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Management Product</h1>
        <p className="text-sm text-gray-600">Add Product to your store</p>
      </div>
      <button
        onClick={openModal}
        className="flex items-center justify-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-gray-700 transition-colors"
      >
        <FaPlus size={16} />
        <span>Add Product</span>
      </button>
    </header>
  );
}

export default ProductHeader;

