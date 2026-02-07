import React, { useState, useEffect, useContext } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiTag, FiSearch } from "react-icons/fi";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { AuthContext } from "../../contexts/AuthContext";
import api from "../../api/axios";

// --- Modal Component for Add/Edit ---
function BrandModal({
  isOpen,
  onClose,
  onSubmit,
  brand,
  formData,
  onFormChange,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-all p-4">
       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 flex flex-col">
        {/* --- Modal Header --- */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {brand ? "Edit Brand" : "New Brand"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* --- Modal Form --- */}
        <form onSubmit={onSubmit} className="p-6 space-y-5">
           <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700">Brand Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={onFormChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                placeholder="e.g. Apple, Nike..."
              />
            </div>
          
            {/* --- Modal Footer (Actions) --- */}
            <div className="flex justify-end gap-3 pt-4">
                <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                >
                Cancel
                </button>
                <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
                >
                {brand ? "Update Brand" : "Create Brand"}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}

// --- Main Brand Page Component ---
export default function Brand() {
  const { user } = useContext(AuthContext);
  const ROLES = { ADMIN: "admin", MANAGER: "manager" };

  const [brands, setBrands] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentBrand, setCurrentBrand] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const [searchQuery, setSearchQuery] = useState("");

  const hasRole = (roles) => user && user.role && roles.includes(user.role);

  useEffect(() => {
    if (currentBrand) {
      setFormData({ name: currentBrand.name });
    } else {
      setFormData({ name: "" });
    }
  }, [currentBrand]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const response = await api.get("/brands");
        setBrands(response.data.data || response.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch brands.");
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  const handleAddNewClick = () => {
    setCurrentBrand(null);
    setFormData({ name: "" });
    setIsModalOpen(true);
  };

  const handleEditClick = (brand) => {
    setCurrentBrand(brand);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentBrand(null);
    setFormData({ name: "" });
  };

  const handleDeleteClick = async (brandId) => {
    if (window.confirm("Are you sure you want to delete this brand?")) {
      try {
        await api.delete(`/brands/${brandId}`);
        setBrands((prev) => prev.filter((b) => b.brand_id !== brandId));
        setError(null);
      } catch {
        setError("Failed to delete brand.");
      }
    }
  };

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (currentBrand) {
        const response = await api.put(`/brands/${currentBrand.brand_id}`, formData);
        const updated = response.data.data || response.data.brand;
        setBrands((prev) => prev.map((b) => (b.brand_id === currentBrand.brand_id ? updated : b)));
      } else {
        const response = await api.post("/brands", formData);
        const newBrand = response.data.data || response.data.brand;
        setBrands((prev) => [newBrand, ...prev]);
      }
      handleCloseModal();
    } catch {
      setError("Failed to save brand.");
    }
  };

  const filteredBrands = brands.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans min-h-[calc(100vh-80px)]">
      
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                <span className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                    <FiTag size={24} />
                </span>
                Brands
            </h1>
            <p className="mt-1 text-gray-500 text-sm ml-14">Manage brands associated with your products.</p>
          </div>
          
           <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FiSearch />
                </div>
                <input
                    type="text"
                    placeholder="Search brands..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-sm shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            
             {hasRole([ROLES.ADMIN, ROLES.MANAGER]) && (
                <button
                onClick={handleAddNewClick}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-600/20 transition-all transform hover:scale-[1.02] whitespace-nowrap"
                >
                <FiPlus size={20} />
                <span>New Brand</span>
                </button>
            )}
          </div>
        </div>

        {/* --- Error Display --- */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-red-500"></div>
            {error}
          </div>
        )}

        {/* --- Brand List / Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loading ? (
                <div className="col-span-full flex justify-center py-20">
                    <LoadingSpinner message="Loading Brands..." />
                </div>
            ) : filteredBrands.length > 0 ? (
              filteredBrands.map((brand) => (
                <div
                  key={brand.brand_id}
                  className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all duration-200 relative overflow-hidden flex flex-col justify-between h-full"
                >
                   <div className="absolute top-0 right-0 p-4 transition-opacity opacity-0 group-hover:opacity-100 flex gap-2">
                       {hasRole([ROLES.ADMIN, ROLES.MANAGER]) && (
                           <>
                            <button
                                onClick={() => handleEditClick(brand)}
                                className="p-2 bg-gray-50 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-gray-100"
                                title="Edit"
                            >
                                <FiEdit2 size={16} />
                            </button>
                             {hasRole([ROLES.ADMIN]) && (
                                <button
                                    onClick={() => handleDeleteClick(brand.brand_id)}
                                    className="p-2 bg-gray-50 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-gray-100"
                                    title="Delete"
                                >
                                    <FiTrash2 size={16} />
                                </button>
                             )}
                           </>
                       )}
                  </div>
                  
                  <div>
                    <div className="inline-flex p-3 bg-gray-50 text-gray-400 rounded-xl mb-3">
                         <FiTag size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{brand.name}</h3>
                    <p className="text-xs text-gray-400 font-mono">ID: {brand.brand_id}</p>
                  </div>
                </div>
              ))
            ) : (
                <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <FiTag size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">No brands found.</p>
                </div>
            )}
        </div>

      {/* --- Add/Edit Modal --- */}
      <BrandModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        brand={currentBrand}
        formData={formData}
        onFormChange={handleFormChange}
      />
    </div>
  );
}
