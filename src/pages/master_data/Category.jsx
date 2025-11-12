import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit, FiTrash2, FiX } from "react-icons/fi";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md m-4 transform transition-all duration-300 scale-100">
        {/* --- Modal Header --- */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-900">
            {category ? "Edit Category" : "Add New Category"}
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
                Category Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={onFormChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Electronics"
              />
            </div>

            {/* --- Description Input --- */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={onFormChange}
                rows="3"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="A brief description of the category"
              ></textarea>
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
              Save Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Main Category Page Component ---
export default function Category() {
  // --- State ---

  // Stores the list of all categories
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: "Electronics",
      description: "Gadgets, computers, and accessories",
      createdAt: "2025-11-08T10:00:00Z",
    },
    {
      id: 2,
      name: "Books",
      description: "Fiction, non-fiction, and textbooks",
      createdAt: "2025-11-09T12:00:00Z",
    },
    {
      id: 3,
      name: "Apparel",
      description: "Clothing, shoes, and fashion items",
      createdAt: "2025-11-10T14:30:00Z",
    },
    {
      id: 4,
      name: "Office Supplies",
      description: "Stationery, furniture, and equipment",
      createdAt: "2025-11-11T09:00:00Z",
    },
  ]);

  // Controls the visibility of the Add/Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Holds the category object being edited, or null if adding a new one
  const [currentCategory, setCurrentCategory] = useState(null);

  // Holds the form data for the modal inputs
  const [formData, setFormData] = useState({ name: "", description: "" });

  // --- Effects ---

  // Effect to populate form when `currentCategory` changes (i.e., when "Edit" is clicked)
  useEffect(() => {
    if (currentCategory) {
      setFormData({
        name: currentCategory.name,
        description: currentCategory.description,
      });
    } else {
      // Reset form when adding a new category
      setFormData({ name: "", description: "" });
    }
  }, [currentCategory]);

  // --- Event Handlers ---

  // Opens the modal in "Add New" mode
  const handleAddNewClick = () => {
    setCurrentCategory(null); // Ensure we're in "add" mode
    setFormData({ name: "", description: "" }); // Clear form
    setIsModalOpen(true);
  };

  // Opens the modal in "Edit" mode for a specific category
  const handleEditClick = (category) => {
    setCurrentCategory(category); // Set the category to be edited
    setIsModalOpen(true);
  };

  // Closes the modal and resets state
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCategory(null);
    setFormData({ name: "", description: "" });
  };

  // Deletes a category by its ID
  const handleDeleteClick = (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      // In a real app, you'd call an API to delete the category.
      setCategories((prevCategories) =>
        prevCategories.filter((category) => category.id !== categoryId)
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
    if (currentCategory) {
      // --- Edit Logic ---
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category.id === currentCategory.id
            ? { ...category, ...formData }
            : category
        )
      );
    } else {
      // --- Add Logic ---
      const newCategory = {
        id: Date.now(), // Use a simple timestamp for a unique ID
        ...formData,
        createdAt: new Date().toISOString(), // Add creation timestamp
      };
      setCategories((prevCategories) => [...prevCategories, newCategory]);
    }
    handleCloseModal(); // Close modal on success
  };

  // --- Render ---
  return (
    <div className="p-4 sm:p-8 font-inter">
      <div className=" mx-auto">
        {/* --- Header --- */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Inventory Categories
          </h1>
          <button
            onClick={handleAddNewClick}
            className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow-md hover:bg-indigo-700 transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <FiPlus className="w-5 h-5" />
            Add New
          </button>
        </div>

        {/* --- Category List / Table --- */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          {/* --- Table Header (Visible on large screens) --- */}
          <div className="hidden md:grid md:grid-cols-4 gap-4 text-sm font-medium uppercase tracking-wider text-slate-600 bg-slate-100 p-4 border-b border-slate-200">
            <div className="col-span-1">Category Name</div>
            <div className="col-span-1">Description</div>
            <div className="col-span-1">Date Added</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* --- Category Items --- */}
          <div className="divide-y divide-slate-200">
            {categories.length > 0 ? (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="grid md:grid-cols-4 gap-4 p-4 items-center hover:bg-slate-50"
                >
                  {/* --- Category Name --- */}
                  <div className="col-span-1">
                    <div className="md:hidden font-bold text-sm text-slate-500">
                      Name
                    </div>
                    <div className="font-semibold text-slate-800 text-lg">
                      {category.name}
                    </div>
                  </div>

                  {/* --- Category Description --- */}
                  <div className="col-span-1">
                    <div className="md:hidden font-bold text-sm text-slate-500">
                      Description
                    </div>
                    <div className="text-slate-600">{category.description}</div>
                  </div>

                  {/* --- Date Added --- */}
                  <div className="col-span-1">
                    <div className="md:hidden font-bold text-sm text-slate-500">
                      Date Added
                    </div>
                    <div className="text-slate-600 text-sm">
                      {new Date(category.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {/* --- Action Buttons --- */}
                  <div className="col-span-1 flex justify-end gap-3 mt-2 md:mt-0">
                    <button
                      onClick={() => handleEditClick(category)}
                      className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-full transition duration-200"
                      title="Edit"
                    >
                      <FiEdit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(category.id)}
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
                No categories found. Click "Add New" to get started!
              </div>
            )}
          </div>
        </div>
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
