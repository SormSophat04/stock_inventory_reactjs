import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit, FiTrash2, FiX } from "react-icons/fi";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md m-4 transform transition-all duration-300 scale-100">
        {/* --- Modal Header --- */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-900">
            {brand ? "Edit Brand" : "Add New Brand"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* --- Modal Form --- */}
        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            {/* --- Name Input --- */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Brand Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={onFormChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Apple"
              />
            </div>

            {/* --- Supplier Input --- */}
            <div>
              <label
                htmlFor="supplier"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Supplier
              </label>
              <input
                type="text"
                id="supplier"
                name="supplier"
                value={formData.supplier}
                onChange={onFormChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Apple Inc."
              />
            </div>
          </div>

          {/* --- Modal Footer (Actions) --- */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200"
            >
              Save Brand
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Main Brand Page Component ---
export default function Brand() {
  // --- State ---

  // Stores the list of all brands
  const [brands, setBrands] = useState([
    {
      id: 1,
      name: "Apple",
      supplier: "Apple Inc.",
      createdAt: "2025-11-09T10:30:00Z",
    },
    {
      id: 2,
      name: "Samsung",
      supplier: "Samsung Electronics",
      createdAt: "2025-11-10T11:45:00Z",
    },
    {
      id: 3,
      name: "Logitech",
      supplier: "TechData Distribution",
      createdAt: "2025-11-11T09:15:00Z",
    },
    {
      id: 4,
      name: "Steelcase",
      supplier: "OfficeWorld Supplies",
      createdAt: "2025-11-11T14:20:00Z",
    },
  ]);

  // Controls the visibility of the Add/Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Holds the brand object being edited, or null if adding a new one
  const [currentBrand, setCurrentBrand] = useState(null);

  // Holds the form data for the modal inputs
  const [formData, setFormData] = useState({ name: "", supplier: "" });

  // --- Effects ---

  // Effect to populate form when `currentBrand` changes (i.e., when "Edit" is clicked)
  useEffect(() => {
    if (currentBrand) {
      setFormData({
        name: currentBrand.name,
        supplier: currentBrand.supplier,
      });
    } else {
      // Reset form when adding a new brand
      setFormData({ name: "", supplier: "" });
    }
  }, [currentBrand]);

  // --- Event Handlers ---

  // Opens the modal in "Add New" mode
  const handleAddNewClick = () => {
    setCurrentBrand(null); // Ensure we're in "add" mode
    setFormData({ name: "", supplier: "" }); // Clear form
    setIsModalOpen(true);
  };

  // Opens the modal in "Edit" mode for a specific brand
  const handleEditClick = (brand) => {
    setCurrentBrand(brand); // Set the brand to be edited
    setIsModalOpen(true);
  };

  // Closes the modal and resets state
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentBrand(null);
    setFormData({ name: "", supplier: "" });
  };

  // Deletes a brand by its ID
  const handleDeleteClick = (brandId) => {
    if (window.confirm("Are you sure you want to delete this brand?")) {
      // In a real app, you'd call an API to delete the brand.
      setBrands((prevBrands) =>
        prevBrands.filter((brand) => brand.id !== brandId)
      );
    }
  };

  // Handles changes to form inputs
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handles the form submission (both Add and Edit)
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (currentBrand) {
      // --- Edit Logic ---
      setBrands((prevBrands) =>
        prevBrands.map((brand) =>
          brand.id === currentBrand.id ? { ...brand, ...formData } : brand
        )
      );
    } else {
      // --- Add Logic ---
      const newBrand = {
        id: Date.now(), // Use a simple timestamp for a unique ID
        ...formData,
        createdAt: new Date().toISOString(), // Add creation timestamp
      };
      setBrands((prevBrands) => [...prevBrands, newBrand]);
    }
    handleCloseModal(); // Close modal on success
  };

  // --- Render ---
  return (
    <div className=" p-4 sm:p-8 font-inter">
      <div className="mx-auto">
        {/* --- Header --- */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Inventory Brands
          </h1>
          <button
            onClick={handleAddNewClick}
            className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow-md hover:bg-indigo-700 transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <FiPlus className="w-5 h-5" />
            Add New
          </button>
        </div>

        {/* --- Brand List / Table --- */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          {/* --- Table Header (Visible on large screens) --- */}
          <div className="hidden md:grid md:grid-cols-4 gap-4 text-sm font-medium uppercase tracking-wider text-slate-600 bg-slate-100 p-4 border-b border-slate-200">
            <div className="col-span-1">Brand Name</div>
            <div className="col-span-1">Supplier</div>
            <div className="col-span-1">Date Added</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* --- Brand Items --- */}
          <div className="divide-y divide-slate-200">
            {brands.length > 0 ? (
              brands.map((brand) => (
                <div
                  key={brand.id}
                  className="grid md:grid-cols-4 gap-4 p-4 items-center hover:bg-slate-50"
                >
                  {/* --- Brand Name --- */}
                  <div className="col-span-1">
                    <div className="md:hidden font-bold text-sm text-slate-500">
                      Name
                    </div>
                    <div className="font-semibold text-slate-800 text-lg">
                      {brand.name}
                    </div>
                  </div>

                  {/* --- Brand Supplier --- */}
                  <div className="col-span-1">
                    <div className="md:hidden font-bold text-sm text-slate-500">
                      Supplier
                    </div>
                    <div className="text-slate-600">{brand.supplier}</div>
                  </div>

                  {/* --- Date Added --- */}
                  <div className="col-span-1">
                    <div className="md:hidden font-bold text-sm text-slate-500">
                      Date Added
                    </div>
                    <div className="text-slate-600 text-sm">
                      {/* Format the date string to be more readable */}
                      {new Date(brand.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {/* --- Action Buttons --- */}
                  <div className="col-span-1 flex justify-end gap-3 mt-2 md:mt-0">
                    <button
                      onClick={() => handleEditClick(brand)}
                      className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-full transition duration-200"
                      title="Edit"
                    >
                      <FiEdit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(brand.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-full transition duration-200"
                      title="Delete"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              // --- Empty State ---
              <div className="text-center p-12 text-slate-500">
                No brands found. Click "Add New" to get started!
              </div>
            )}
          </div>
        </div>
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
