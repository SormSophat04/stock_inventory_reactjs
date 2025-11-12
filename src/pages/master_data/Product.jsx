import React, { useState } from "react";
import ProductHeader from "./components/ProductHeader";
import ProductControls from "./components/ProductControls";
import ProductCard from "./components/ProductCard";
import ProductPagination from "./components/ProductPagination";

// Mock data
const products = [
  {
    id: 1,
    name: "Xiaomi Monitor 27 Inch",
    category: "Monitor",
    price: 100.0,
    rating: 4.6,
    imageUrl: "https://placehold.co/300x300/EBF4FF/333?text=Xiaomi+Monitor",
  },
  {
    id: 2,
    name: "Xiaomi 14T",
    category: "Smartphone",
    price: 450.0,
    rating: 4.6,
    imageUrl: "https://placehold.co/300x300/333/FFF?text=Xiaomi+14T",
  },
  {
    id: 3,
    name: "Xiaomi 14T Pro",
    category: "Smartphone",
    price: 520.0,
    rating: 4.6,
    imageUrl: "https://placehold.co/300x300/CCC/333?text=Xiaomi+14T+Pro",
  },
  {
    id: 4,
    name: "Philips Monitor 24inch",
    category: "Monitor",
    price: 140.0,
    rating: 4.6,
    imageUrl: "https://placehold.co/300x300/B0E0E6/333?text=Philips+Monitor",
  },
  {
    id: 5,
    name: "Xiaomi Monitor 24 Inch",
    category: "Monitor",
    price: 362.0,
    rating: 4.6,
    imageUrl: "https://placehold.co/300x300/FF8C00/FFF?text=Xiaomi+Monitor+24",
  },
  {
    id: 6,
    name: "Samsung Galaxy A35",
    category: "Smartphone",
    price: 274.0,
    rating: 4.6,
    imageUrl: "https://placehold.co/300x300/F0E6FF/333?text=Galaxy+A35",
  },
  {
    id: 7,
    name: "Xiaomi 13T",
    category: "Smartphone",
    price: 410.0,
    rating: 4.6,
    imageUrl: "https://placehold.co/300x300/500/FFF?text=Xiaomi+13T",
  },
  {
    id: 8,
    name: "Samsung Galaxy A55",
    category: "Smartphone",
    price: 340.0,
    rating: 4.6,
    imageUrl: "https://placehold.co/300x300/F4F4F4/333?text=Galaxy+A55",
  },
];

function Product() {
  const [activeTab, setActiveTab] = useState("All");
  const [activeView, setActiveView] = useState("Columns");
  const [currentPage, setCurrentPage] = useState(2);

  return (
    <div className="bg-gray-100 p-4 sm:p-4 font-sans">
      <div className="mx-auto ">
        <ProductHeader />
        <ProductControls
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeView={activeView}
          setActiveView={setActiveView}
        />

        {/* Product Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <ProductPagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
}

export default Product;
