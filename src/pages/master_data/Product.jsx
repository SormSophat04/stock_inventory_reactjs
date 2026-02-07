import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  deleteProduct,
  selectAllProducts,
  selectProductStatus,
  selectProductError,
} from "../../redux/slices/productSlice";
import AddProductModal from "./components/AddProductModal";
import { 
    FiPlus, 
    FiSearch, 
    FiGrid, 
    FiList, 
    FiTag, 
    FiBox, 
    FiDollarSign, 
    FiMoreVertical,
    FiFilter,
    FiUpload,
    FiEdit2,
    FiTrash2
} from "react-icons/fi";
import axios from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import LoadingSpinner from "../../components/common/LoadingSpinner";

/**
 * Product Master Data Page
 * Premium design for managing products.
 * Theme: Indigo/Blue
 */
export default function Product() {
  const dispatch = useDispatch();
  const products = useSelector(selectAllProducts);
  const status = useSelector(selectProductStatus);
  const error = useSelector(selectProductError);

  const [activeView, setActiveView] = useState("list"); // 'list' or 'grid'
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  
  const [editingProduct, setEditingProduct] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const fileInputRef = React.useRef(null);
  const menuRef = React.useRef(null);

  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddProduct = () => {
      setEditingProduct(null);
      setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
      setEditingProduct(product);
      setIsModalOpen(true);
      setOpenMenuId(null);
  };

  const handleDeleteProduct = async (id) => {
      if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
          try {
              await dispatch(deleteProduct(id)).unwrap();
              toast.success("Product deleted successfully");
          } catch (err) {
              toast.error("Failed to delete product");
              console.error(err);
          }
      }
      setOpenMenuId(null);
  };

  const toggleMenu = (id, e) => {
      e.stopPropagation();
      setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    
    const toastId = toast.loading('Importing products...');

    try {
      await axios.post('/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Products imported successfully', { id: toastId });
      dispatch(fetchProducts());
    } catch (error) {
      console.error('Import error:', error);
       toast.error('Failed to import products', { id: toastId });
    }
    event.target.value = null;
  };

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProducts());
    }
  }, [status, dispatch]);

  const filteredProducts = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === "All" ? true : 
                            activeFilter === "Active" ? (product.status === "active" || !product.status) : 
                            activeFilter === "Inactive" ? product.status === "inactive" : true;
      return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto font-sans h-[calc(100vh-80px)] flex flex-col">
       <Toaster position="top-center" reverseOrder={false} />
       <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".xlsx,.xls,.csv"
        />

       {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Products</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your inventory catalog, prices, and stock levels.</p>
        </div>
        <div className="flex gap-3">
            <button
              onClick={handleImportClick}
              className="flex items-center gap-2 bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all"
            >
              <FiUpload size={20} />
              <span>Import</span>
            </button>
            <button
              onClick={handleAddProduct}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-600/20 transition-all transform hover:scale-[1.02]"
            >
              <FiPlus size={20} />
              <span>Add Product</span>
            </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
         {/* Search */}
         <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FiSearch size={18} />
            </div>
            <input
                type="text"
                placeholder="Search by name or SKU..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
         </div>

         {/* Filters & View Toggle */}
         <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
                 {['All', 'Active', 'Inactive'].map((filter) => (
                     <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                            activeFilter === filter 
                            ? 'bg-white text-indigo-600 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                     >
                        {filter}
                     </button>
                 ))}
             </div>

             <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>

             <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-200">
                <button 
                    onClick={() => setActiveView('list')}
                    className={`p-2 rounded-md transition-all ${activeView === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <FiList size={18} />
                </button>
                <button 
                    onClick={() => setActiveView('grid')}
                    className={`p-2 rounded-md transition-all ${activeView === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <FiGrid size={18} />
                </button>
             </div>
         </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 rounded-2xl border border-gray-100 bg-white shadow-sm relative">
         {status === 'loading' && (
             <div className="absolute inset-0 z-10 bg-white/50 flex items-center justify-center">
                 <LoadingSpinner message="Loading Products..." />
             </div>
         )}
         
         {error && (
             <div className="p-8 text-center text-red-500 bg-red-50 m-4 rounded-xl border border-red-100">
                 {typeof error === 'string' ? error : "Failed to load products"}
             </div>
         )}

         {!status.includes('fail') && filteredProducts.length === 0 && !status.includes('load') && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <FiBox size={48} className="mb-4 text-gray-300" />
                  <p className="text-lg font-medium text-gray-900">No products found</p>
                  <p className="text-sm">Try adjusting your search or filters.</p>
              </div>
         )}

         {filteredProducts.length > 0 && (
             activeView === 'list' ? (
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-sm">
                        <tr>
                            <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">Image</th>
                            <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Info</th>
                            <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Brand</th>
                            <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Stock</th>
                            <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                            <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredProducts.map((product) => (
                            <tr key={product.product_id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="py-3 px-6">
                                    <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                                         <img 
                                            src={product.image ? `${import.meta.env.VITE_API_BASE_URL}/storage/${product.image}` : "https://placehold.co/100x100?text=No+Img"} 
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = "https://placehold.co/100x100?text=Error" }} 
                                         />
                                    </div>
                                </td>
                                <td className="py-3 px-6">
                                    <div className="font-semibold text-gray-900">{product.name}</div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                        <FiTag size={10} /> {product.sku || 'No SKU'}
                                    </div>
                                </td>
                                <td className="py-3 px-6 text-sm text-gray-600">{product.category?.name || '-'}</td>
                                <td className="py-3 px-6 text-sm text-gray-600">{product.brand?.name || '-'}</td>
                                <td className="py-3 px-6 text-sm font-medium text-gray-900">${Number(product.sell_price).toFixed(2)}</td>
                                <td className="py-3 px-6 text-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                                        (product.stocks?.reduce((acc, stock) => acc + stock.quantity, 0) || 0) > 10 
                                            ? 'bg-green-50 text-green-700' 
                                            : 'bg-amber-50 text-amber-700'
                                    }`}>
                                        {product.stocks?.reduce((acc, stock) => acc + stock.quantity, 0) || 0}
                                    </span>
                                </td>
                                <td className="py-3 px-6 text-center">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                                        product.status === 'active' || !product.status
                                            ? 'bg-green-50 text-green-700 border-green-100' 
                                            : 'bg-gray-50 text-gray-600 border-gray-200'
                                    }`}>
                                        {product.status === 'active' || !product.status ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="py-3 px-6 text-right relative">
                                    <button 
                                        onClick={(e) => toggleMenu(product.product_id, e)}
                                        className="text-gray-400 hover:text-indigo-600 p-2 rounded-full hover:bg-indigo-50 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <FiMoreVertical size={18} />
                                    </button>
                                    
                                    {openMenuId === product.product_id && (
                                        <div 
                                            ref={menuRef}
                                            className="absolute right-0 top-10 w-40 bg-white shadow-xl rounded-lg border border-gray-100 z-50 overflow-hidden"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button 
                                                onClick={() => handleEditProduct(product)}
                                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 transition-colors"
                                            >
                                                <FiEdit2 size={16} /> Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteProduct(product.product_id)}
                                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                            >
                                                <FiTrash2 size={16} /> Delete
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             ) : (
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <div key={product.product_id} className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-lg transition-shadow duration-300 flex flex-col group relative">
                             <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="relative">
                                    <button 
                                        onClick={(e) => toggleMenu(product.product_id, e)}
                                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:text-indigo-600 border border-gray-100"
                                    >
                                         <FiMoreVertical />
                                    </button>
                                    {openMenuId === product.product_id && (
                                        <div 
                                            ref={menuRef}
                                            className="absolute right-0 top-10 w-40 bg-white shadow-xl rounded-lg border border-gray-100 z-50 overflow-hidden"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button 
                                                onClick={() => handleEditProduct(product)}
                                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 transition-colors"
                                            >
                                                <FiEdit2 size={16} /> Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteProduct(product.product_id)}
                                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                            >
                                                <FiTrash2 size={16} /> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                             </div>
                             
                             <div className="aspect-square w-full bg-gray-50 rounded-xl overflow-hidden mb-4 relative">
                                  <img 
                                    src={product.image ? `${import.meta.env.VITE_API_BASE_URL}/storage/${product.image}` : "https://placehold.co/300x300?text=No+Img"} 
                                    alt={product.name}
                                    className="w-full h-full object-cover mix-blend-multiply"
                                 />
                                 <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
                                     Stock: {product.stocks?.reduce((acc, stock) => acc + stock.quantity, 0) || 0}
                                 </div>
                             </div>

                             <div className="flex-1">
                                 <div className="text-xs text-indigo-600 font-semibold uppercase tracking-wide mb-1">
                                     {product.category?.name || 'Uncategorized'}
                                 </div>
                                 <h3 className="font-bold text-gray-900 text-lg mb-1 leading-tight line-clamp-2">{product.name}</h3>
                                 <div className="text-xs text-gray-500 mb-4 font-mono">{product.sku}</div>
                             </div>

                             <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                                 <div className="text-xl font-bold text-gray-900">${Number(product.sell_price).toFixed(2)}</div>
                                 <span className={`h-2 w-2 rounded-full ${product.status === 'active' || !product.status ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                             </div>
                        </div>
                    ))}
                </div>
             )
         )}
      </div>

      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingProduct}
      />
    </div>
  );
}
