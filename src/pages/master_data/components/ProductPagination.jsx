import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

function ProductPagination({ currentPage, setCurrentPage }) {
  return (
    <footer className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
      <div className="flex items-center gap-2">
        <span>Show</span>
        <select className="border border-gray-200 rounded-lg px-2 py-1 focus:outline-none">
          <option value="8">8</option>
          <option value="12">12</option>
          <option value="16">16</option>
        </select>
        <span>per page</span>
      </div>
      
      <nav className="flex items-center gap-1">
        <button className="p-2 rounded-md hover:bg-gray-100">
          <FaChevronLeft />
        </button>
        {[1, 2, 3, 4, 5, 6].map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 rounded-md transition-colors
              ${currentPage === page 
                ? 'bg-gray-800 text-white' 
                : 'hover:bg-gray-100'}
            `}
          >
            {page}
          </button>
        ))}
        <button className="p-2 rounded-md hover:bg-gray-100">
          <FaChevronRight />
        </button>
      </nav>
    </footer>
  );
}

export default ProductPagination;
