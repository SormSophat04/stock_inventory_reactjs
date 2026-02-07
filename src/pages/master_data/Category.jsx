import React, { useState, useEffect, useContext } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiLayers, FiSearch } from "react-icons/fi";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { AuthContext } from "../../contexts/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  selectAllCategories,
  selectCategoryStatus,
  selectCategoryError,
} from "../../redux/slices/categorySlice";

// --- Modal Component for Add/Edit ---
function CategoryModal({
  isOpen,
  onClose,
  onSubmit,
  category,
  formData,
  onFormChange,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-all p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 flex flex-col max-h-[90vh]">
        {/* --- Modal Header --- */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {category ? "Edit Category" : "New Category"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* --- Modal Form --- */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
           {/* --- Name Input --- */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700">Category Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={onFormChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                placeholder="e.g. Electronics, Groceries..."
              />
            </div>

            {/* --- Description Input --- */}
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={onFormChange}
                rows="4"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none"
                placeholder="Optional description for this category..."
              ></textarea>
            </div>
        </form>

         {/* --- Modal Footer (Actions) --- */}
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
            >
              {category ? "Update Category" : "Create Category"}
            </button>
          </div>
      </div>
    </div>
  );
}

// --- Main Category Page Component ---
export default function Category() {
  const { user } = useContext(AuthContext);
  const dispatch = useDispatch();
  const categories = useSelector(selectAllCategories);
  const status = useSelector(selectCategoryStatus);
  const error = useSelector(selectCategoryError);

  const ROLES = { ADMIN: "admin", MANAGER: "manager" };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [searchQuery, setSearchQuery] = useState("");

  const hasRole = (roles) => user && user.role && roles.includes(user.role);

  useEffect(() => {
    if (status === "idle") {
        dispatch(fetchCategories());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (currentCategory) {
      setFormData({
        name: currentCategory.name,
        description: currentCategory.description || "",
      });
    } else {
      setFormData({ name: "", description: "" });
    }
  }, [currentCategory]);

  const handleAddNewClick = () => {
    setCurrentCategory(null);
    setFormData({ name: "", description: "" });
    setIsModalOpen(true);
  };

  const handleEditClick = (category) => {
    setCurrentCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCategory(null);
    setFormData({ name: "", description: "" });
  };

  const handleDeleteClick = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await dispatch(deleteCategory(categoryId)).unwrap();
      } catch (err) {
        console.error("Delete Error:", err);
        alert(err.message || "Failed to delete category");
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentCategory) {
        await dispatch(
          updateCategory({ id: currentCategory.category_id, data: formData })
        ).unwrap();
      } else {
        await dispatch(addCategory(formData)).unwrap();
      }
      handleCloseModal();
    } catch (err) {
      console.error("Submit Error:", err);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans min-h-[calc(100vh-80px)]">
      
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                <span className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                    <FiLayers size={24} />
                </span>
                Categories
            </h1>
            <p className="mt-1 text-gray-500 text-sm ml-14">Organize your products into logical groups.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FiSearch />
                </div>
                <input
                    type="text"
                    placeholder="Search categories..."
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
                <span>New Category</span>
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

        {/* --- Category List / Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {status === "loading" ? (
                <div className="col-span-full flex justify-center py-20">
                    <LoadingSpinner message="Loading Categories..." />
                </div>
            ) : filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <div
                  key={category.category_id}
                  className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all duration-200 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 transition-opacity opacity-0 group-hover:opacity-100 flex gap-2">
                       {hasRole([ROLES.ADMIN, ROLES.MANAGER]) && (
                           <>
                            <button
                                onClick={() => handleEditClick(category)}
                                className="p-2 bg-gray-50 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-gray-100"
                                title="Edit"
                            >
                                <FiEdit2 size={16} />
                            </button>
                             {hasRole([ROLES.ADMIN]) && (
                                <button
                                    onClick={() => handleDeleteClick(category.category_id)}
                                    className="p-2 bg-gray-50 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-gray-100"
                                    title="Delete"
                                >
                                    <FiTrash2 size={16} />
                                </button>
                             )}
                           </>
                       )}
                  </div>

                  <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                          <FiLayers size={24} />
                      </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">
                      {category.description || "No description provided."}
                  </p>
                  
                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                      <span>Created: {new Date(category.created_at).toLocaleDateString()}</span>
                      <span className="bg-gray-50 px-2 py-1 rounded text-gray-500">ID: {category.category_id}</span>
                  </div>
                </div>
              ))
            ) : (
                <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <FiLayers size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">No categories found.</p>
                    <button onClick={handleAddNewClick} className="text-indigo-600 font-semibold hover:underline mt-2">Create your first category</button>
                </div>
            )}
        </div>

      {/* --- Add/Edit Modal --- */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        category={currentCategory}
        formData={formData}
        onFormChange={handleFormChange}
      />
    </div>
  );
}
