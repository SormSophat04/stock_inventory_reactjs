import React from "react";
import {
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiImage,
} from "react-icons/fi";

const inventoryData = [
  {
    id: 1,
    name: "Sports jacket",
    img: null,
    category: "Sportswear",
    sku: "tsh-blu-med",
    status: "In Stock",
    quantity: 120,
    reorder: 180,
    price: 120.5,
  },
  {
    id: 2,
    name: "Gray Backpack",
    img: null,
    category: "Accessories",
    sku: "gtb-rblu-sma",
    status: "In Stock",
    quantity: 170,
    reorder: 150,
    price: 105.55,
  },
  {
    id: 3,
    name: "Blaze Sneakers",
    img: null,
    category: "Footwear",
    sku: "ftw-gr-big",
    status: "Stock Out",
    quantity: 0,
    reorder: 300,
    price: 175.43,
  },
  {
    id: 4,
    name: "Leather Tote Bag",
    img: null,
    category: "Lifestyle",
    sku: "ltb-gry-sma",
    status: "Low Stock",
    quantity: 103,
    reorder: 197,
    price: 130.44,
  },
  {
    id: 5,
    name: "Leather Jacket",
    img: null,
    category: "Apparel",
    sku: "lj-ylw-med",
    status: "In Stock",
    quantity: 270,
    reorder: 30,
    price: 182.01,
  },
  {
    id: 6,
    name: "Black T-shirt",
    img: null,
    category: "T-shirts",
    sku: "ts-bts-big",
    status: "Low Stock",
    quantity: 80,
    reorder: 220,
    price: 96.84,
  },
  {
    id: 7,
    name: "Black Boots",
    img: null,
    category: "Footwear",
    sku: "bbt-blk-sma",
    status: "Stock Out",
    quantity: 0,
    reorder: 300,
    price: 106.27,
  },
  {
    id: 8,
    name: "Men Short Pants",
    img: null,
    category: "Sportswear",
    sku: "msp-gry-med",
    status: "In Stock",
    quantity: 180,
    reorder: 120,
    price: 228.41,
  },
];

const StatusBadge = ({ status }) => {
  let colorClasses = "";
  let dotColor = "";
  switch (status) {
    case "In Stock":
      colorClasses = "bg-green-100 text-green-700";
      dotColor = "bg-green-500";
      break;
    case "Stock Out":
      colorClasses = "bg-red-100 text-red-700";
      dotColor = "bg-red-500";
      break;
    case "Low Stock":
      colorClasses = "bg-yellow-100 text-yellow-700";
      dotColor = "bg-yellow-500";
      break;
    default:
      colorClasses = "bg-gray-100 text-gray-700";
      dotColor = "bg-gray-500";
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${colorClasses} inline-flex items-center`}
    >
      <span
        className={`inline-block w-2 h-2 rounded-full mr-2 ${dotColor}`}
      ></span>
      {status}
    </span>
  );
};

function InventoryTable() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 mb-6">
        <div className="relative w-full md:w-auto">
          <FiSearch
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search order..."
            className="w-full md:w-64 pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button className="flex items-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm w-full justify-center md:w-auto">
            <FiFilter size={16} className="mr-2" />
            Filter
          </button>
          <button className="flex items-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm w-full justify-center md:w-auto">
            All Category
            <FiChevronDown size={16} className="ml-2" />
          </button>
          <button className="flex items-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm w-full justify-center md:w-auto">
            Status
            <FiChevronDown size={16} className="ml-2" />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase font-medium bg-gray-50">
              <th className="px-4 py-3 w-12">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-3">Product Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Stock Status</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Reorder Level</th>
              <th className="px-4 py-3">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {inventoryData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center border border-gray-200">
                      {item.img ? (
                        <img
                          src={item.img}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <FiImage size={20} className="text-gray-400" />
                      )}
                    </div>
                    <span className="font-medium text-gray-800">
                      {item.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {item.category}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">{item.sku}</td>
                <td className="px-4 py-4">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {item.quantity} pcs
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {item.reorder}
                </td>
                <td className="px-4 py-4 text-sm font-medium text-gray-800">
                  ${item.price.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center pt-4 mt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600 mb-4 md:mb-0">
          Result 1 - {inventoryData.length} of 160
          <FiChevronDown size={16} className="inline-block ml-1" />
        </div>
        <nav className="flex items-center space-x-2">
          <button className="flex items-center justify-center w-8 h-8 rounded-md text-gray-600 hover:bg-gray-100">
            <FiChevronLeft size={16} />
          </button>
          <button className="w-8 h-8 rounded-md text-sm bg-blue-600 text-white font-medium">
            1
          </button>
          <button className="w-8 h-8 rounded-md text-sm text-gray-600 hover:bg-gray-100 font-medium">
            2
          </button>
          <button className="w-8 h-8 rounded-md text-sm text-gray-600 hover:bg-gray-100 font-medium">
            3
          </button>
          <span className="text-gray-600">...</span>
          <button className="w-8 h-8 rounded-md text-sm text-gray-600 hover:bg-gray-100 font-medium">
            8
          </button>
          <button className="w-8 h-8 rounded-md text-sm text-gray-600 hover:bg-gray-100 font-medium">
            9
          </button>
          <button className="w-8 h-8 rounded-md text-sm text-gray-600 hover:bg-gray-100 font-medium">
            10
          </button>
          <button className="flex items-center justify-center w-8 h-8 rounded-md text-gray-600 hover:bg-gray-100">
            <FiChevronRight size={16} />
          </button>
        </nav>
      </div>
    </div>
  );
}

export default InventoryTable;
