import React, { useState, useEffect, useRef } from "react";
import {
  FiX,
  FiUpload,
  FiImage,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import api from "../../../api/axios";
import { useDispatch } from "react-redux";
import { addProduct, updateProduct } from "../../../redux/slices/productSlice";

function AddProductModal({ isOpen, onClose, initialData = null }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    brand_id: "",
    unit_id: "",
    sku: "",
    sell_price: "",
    barcode: "",
    reorder_level: "",
    //     image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Ref for the file input to reset it manually
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
            name: initialData.name || "",
            category_id: initialData.category_id || "",
            brand_id: initialData.brand_id || "",
            unit_id: initialData.unit_id || "",
            sku: initialData.sku || "",
            sell_price: initialData.sell_price || "",
            barcode: initialData.barcode || "",
            reorder_level: initialData.reorder_level || "",
            image: null
        });
        setImagePreview(initialData.image ? `${import.meta.env.VITE_API_BASE_URL}/storage/${initialData.image}` : null);
      } else {
         resetForm();
      }

      const fetchData = async () => {
        try {
           const [categoriesRes, brandsRes, unitsRes] = await Promise.all([
             api.get("/categories"),
             api.get("/brands"),
             api.get("/units"),
           ]);
           
           // Helper to extract data array safely from { success, message, data: [...] }
           const extractData = (res) => {
               if (res.data && Array.isArray(res.data.data)) return res.data.data;
               if (res.data && Array.isArray(res.data)) return res.data;
               return [];
           };

           setCategories(extractData(categoriesRes));
           setBrands(extractData(brandsRes));
           setUnits(extractData(unitsRes));
        } catch (err) {
          setError("Failed to load dropdown data.");
          console.error(err);
        }
      };
      fetchData();
    }
  }, [isOpen, initialData]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("File size too large. Max 10MB.");
        return;
      }
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category_id: "",
      brand_id: "",
      unit_id: "",
      sku: "",
      sell_price: "",
      barcode: "",
      reorder_level: "",
      image: null,
    });
    setImagePreview(null);
    setError(null);
    setSubmitting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
     e.preventDefault();
     setSubmitting(true);
     setError(null);
 
     const submissionData = new FormData();
     for (const key in formData) {
       // Check if image is null or hasn't changed (if editing). 
       // If image is null, it might mean we removed it OR we didn't change it. 
       // However, for update, usually if we don't send 'image' key, backend keeps the old one.
       // If we want to delete image logic might be needed, but usually we just replace or keep.
       // Here, if formData.image is null, we skip appending it, so backend keeps original.
       if (key === 'image' && !formData[key]) continue;
       
       submissionData.append(key, formData[key]);
     }
 
     try {
       if (initialData) {
          await dispatch(updateProduct({ id: initialData.product_id, data: submissionData })).unwrap();
       } else {
          await dispatch(addProduct(submissionData)).unwrap();
       }
       handleClose();
     } catch (err) {
       const errorMsg =
         err.message || (err.errors ? Object.values(err.errors).join(' ') : `Failed to ${initialData ? 'update' : 'add'} the product.`);
       setError(errorMsg);
     } finally {
       setSubmitting(false);
     }
   };

  if (!isOpen) return null;

  // Helper styles
  const labelStyle =
    "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5";
  const inputStyle =
    "w-full px-4 py-2.5 text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 outline-none placeholder:text-slate-400";
  const selectStyle = `${inputStyle} appearance-none`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      ></div>

      {/* Modal Content */}
      <div className="relative flex flex-col w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{initialData ? 'Edit Product' : 'New Product'}</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {initialData ? 'Update product details' : 'Add a new item to your inventory'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white">
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
              <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form
            id="addProductForm"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Column - Inputs */}
            <div className="lg:col-span-8 space-y-6">
              {/* Product Name */}
              <div>
                <label htmlFor="name" className={labelStyle}>
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  className={inputStyle}
                  placeholder="e.g. Nike Air Max 97"
                />
              </div>

              {/* Grid for SKU & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="sku" className={labelStyle}>
                    SKU Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      onChange={handleFormChange}
                      className={inputStyle}
                      placeholder="AUTO-GEN"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="sell_price" className={labelStyle}>
                    Selling Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                      $
                    </span>
                    <input
                      type="number"
                      id="sell_price"
                      name="sell_price"
                      value={formData.sell_price}
                      onChange={handleFormChange}
                      required
                      step="0.01"
                      className={`${inputStyle} pl-7`}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="barcode" className={labelStyle}>
                    Barcode (ISBN, UPC, etc.)
                  </label>
                  <input
                    type="text"
                    id="barcode"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleFormChange}
                    className={inputStyle}
                    placeholder="e.g., 9780141036144"
                  />
                </div>
                <div>
                  <label htmlFor="reorder_level" className={labelStyle}>
                    Re-order Level
                  </label>
                  <input
                    type="number"
                    id="reorder_level"
                    name="reorder_level"
                    value={formData.reorder_level}
                    onChange={handleFormChange}
                    className={inputStyle}
                    placeholder="e.g., 10"
                  />
                </div>
              </div>

              {/* Category & Details */}
              <div>
                <label htmlFor="category_id" className={labelStyle}>
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="category_id"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleFormChange}
                    required
                    className={selectStyle}
                  >
                    <option value="">Select a category...</option>
                    {categories.map((cat) => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="brand_id" className={labelStyle}>
                    Brand
                  </label>
                  <div className="relative">
                    <select
                      id="brand_id"
                      name="brand_id"
                      value={formData.brand_id}
                      onChange={handleFormChange}
                      className={selectStyle}
                    >
                      <option value="">Select Brand</option>
                      {brands.map((brand) => (
                        <option key={brand.brand_id} value={brand.brand_id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="unit_id" className={labelStyle}>
                    Unit
                  </label>
                  <div className="relative">
                    <select
                      id="unit_id"
                      name="unit_id"
                      value={formData.unit_id}
                      onChange={handleFormChange}
                      className={selectStyle}
                    >
                      <option value="">Select Unit</option>
                      {units.map((unit) => (
                        <option key={unit.unit_id} value={unit.unit_id}>
                          {unit.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Image Upload */}
            {/* Right Column - Image Upload */}
            <div className="lg:col-span-4">
              <label className={labelStyle}>Product Image</label>
              <div className="mt-1 group relative h-full min-h-[240px] bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-100 hover:border-indigo-400 transition-colors flex flex-col items-center justify-center text-center overflow-hidden">
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-contain p-4"
                    />
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center">
                      <button
                        type="button"
                        onClick={removeImage}
                        className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all bg-white text-red-600 p-3 rounded-full shadow-lg hover:bg-red-50"
                        title="Remove image"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 space-y-4">
                    <div className="w-16 h-16 mx-auto bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <FiImage className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Click to upload
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        or drag and drop
                      </p>
                    </div>
                    <p className="text-[10px] uppercase tracking-wide text-slate-400">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                )}

                <input
                  id="image"
                  name="image"
                  type="file"
                  ref={fileInputRef}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  onChange={handleFileChange}
                  accept="image/*"
                  disabled={imagePreview !== null}
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer (Sticky) */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 transition-all"
          >
            Cancel
          </button>
          <button
            form="addProductForm"
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 transition-all transform active:scale-95"
          >
            {submitting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <FiCheckCircle className="w-4 h-4" />
                {initialData ? 'Update Product' : 'Save Product'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddProductModal;
