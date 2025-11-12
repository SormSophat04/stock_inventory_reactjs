import React from "react";
import { FiSearch, FiPlus, FiDownload, FiUpload, FiBell } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";

function Header() {
  return (
    <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      <div className="flex items-center w-full max-w-md">
        <div className="relative w-full">
          <FiSearch
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search here..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs bg-white border border-gray-300 rounded-md px-1.5 py-0.5">
            ⌘ K
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100">
          <FiBell size={20} />
        </button>
        <button className="flex items-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm">
          <FiDownload size={16} className="mr-2" />
          Import
        </button>
        <button className="flex items-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm">
          <FiUpload size={16} className="mr-2" />
          Export
        </button>
        <button className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm">
          View Products
        </button>
        <button className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium p-2 rounded-lg text-sm">
          <FiPlus size={20} />
        </button>
        <FaUserCircle size={36} className="text-gray-400 cursor-pointer" />
      </div>
    </header>
  );
}

export default Header;
