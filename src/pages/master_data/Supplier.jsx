import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit, FiTrash2, FiX } from "react-icons/fi";

// --- Modal Component for Add/Edit ---
function SupplierModal({
  isOpen,
  onClose,
  onSubmit,
  supplier,
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
            {supplier ? "Edit Supplier" : "Add New Supplier"}
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
                Supplier Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={onFormChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., TechData Distribution"
              />
            </div>

            {/* --- Phone Input --- */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={onFormChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., 1-800-555-1234"
              />
            </div>

            {/* --- Email Input --- */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={onFormChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., sales@techdata.com"
              />
            </div>

            {/* --- Address Input --- */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={onFormChange}
                rows="3"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., 123 Tech Way, Silicon Valley, CA 94043"
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
              Save Supplier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Main Supplier Page Component ---
export default function Supplier() {
  // --- State ---

  // Default form state
  const defaultFormState = {
    name: "",
    phone: "",
    email: "",
    address: "",
  };

  // Stores the list of all suppliers
  const [suppliers, setSuppliers] = useState([
    {
      id: 1,
      name: "TechData Distribution",
      phone: "1-800-555-1234",
      email: "sales@techdata.com",
      address: "123 Tech Way, Silicon Valley, CA 94043",
      createdAt: "2025-11-09T10:30:00Z",
    },
    {
      id: 2,
      name: "OfficeWorld Supplies",
      phone: "1-888-555-4321",
      email: "contact@officeworld.com",
      address: "456 Business Park, New York, NY 10001",
      createdAt: "2025-11-10T11:45:00Z",
    },
    {
      id: 3,
      name: "Global Electronics",
      phone: "1-234-567-8901",
      email: "info@globalelectro.com",
      address: "789 Industrial Rd, Austin, TX 78701",
      createdAt: "2025-11-11T09:15:00Z",
    },
  ]);

  // Controls the visibility of the Add/Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Holds the supplier object being edited, or null if adding a new one
  const [currentSupplier, setCurrentSupplier] = useState(null);

  // Holds the form data for the modal inputs
  const [formData, setFormData] = useState(defaultFormState);

  // --- Effects ---

  // Effect to populate form when `currentSupplier` changes (i.e., when "Edit" is clicked)
  useEffect(() => {
    if (currentSupplier) {
      setFormData({
        name: currentSupplier.name,
        phone: currentSupplier.phone,
        email: currentSupplier.email,
        address: currentSupplier.address,
      });
    } else {
      // Reset form when adding a new supplier
      setFormData(defaultFormState);
    }
  }, [currentSupplier]);

  // --- Event Handlers ---

  // Opens the modal in "Add New" mode
  const handleAddNewClick = () => {
    setCurrentSupplier(null); // Ensure we're in "add" mode
    setFormData(defaultFormState); // Clear form
    setIsModalOpen(true);
  };

  // Opens the modal in "Edit" mode for a specific supplier
  const handleEditClick = (supplier) => {
    setCurrentSupplier(supplier); // Set the supplier to be edited
    setIsModalOpen(true);
  };

  // Closes the modal and resets state
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentSupplier(null);
    setFormData(defaultFormState);
  };

  // Deletes a supplier by its ID
  const handleDeleteClick = (supplierId) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      // In a real app, you'd call an API to delete the supplier.
      setSuppliers((prevSuppliers) =>
        prevSuppliers.filter((supplier) => supplier.id !== supplierId)
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
    if (currentSupplier) {
      // --- Edit Logic ---
      setSuppliers((prevSuppliers) =>
        prevSuppliers.map((supplier) =>
          supplier.id === currentSupplier.id
            ? { ...supplier, ...formData }
            : supplier
        )
      );
    } else {
      // --- Add Logic ---
      const newSupplier = {
        id: Date.now(), // Use a simple timestamp for a unique ID
        ...formData,
        createdAt: new Date().toISOString(), // Add creation timestamp
      };
      setSuppliers((prevSuppliers) => [...prevSuppliers, newSupplier]);
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
            Inventory Suppliers
          </h1>
          <button
            onClick={handleAddNewClick}
            className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow-md hover:bg-indigo-700 transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <FiPlus className="w-5 h-5" />
            Add New
          </button>
        </div>

        {/* --- Supplier List / Table --- */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          {/* --- Table Header (Visible on large screens) --- */}
          <div className="hidden md:grid md:grid-cols-5 gap-4 text-sm font-medium uppercase tracking-wider text-slate-600 bg-slate-100 p-4 border-b border-slate-200">
            <div className="col-span-1">Supplier Name</div>
            <div className="col-span-1">Contact Info</div>
            <div className="col-span-1">Address</div>
            <div className="col-span-1">Date Added</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* --- Supplier Items --- */}
          <div className="divide-y divide-slate-200">
            {suppliers.length > 0 ? (
              suppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="grid md:grid-cols-5 gap-4 p-4 items-start hover:bg-slate-50"
                >
                  {/* --- Supplier Name --- */}
                  <div className="col-span-1">
                    <div className="md:hidden font-bold text-sm text-slate-500">
                      Name
                    </div>
                    <div className="font-semibold text-slate-800 text-lg">
                      {supplier.name}
                    </div>
                  </div>

                  {/* --- Contact Info --- */}
                  <div className="col-span-1 text-sm text-slate-600">
                    <div className="md:hidden font-bold text-sm text-slate-500 mb-1">
                      Contact Info
                    </div>
                    <div className="font-medium text-slate-800">
                      {supplier.phone}
                    </div>
                    <div className="truncate">{supplier.email}</div>
                  </div>

                  {/* --- Address --- */}
                  <div className="col-span-1">
                    <div className="md:hidden font-bold text-sm text-slate-500">
                      Address
                    </div>
                    <div className="text-slate-600 text-sm whitespace-pre-line">
                      {supplier.address}
                    </div>
                  </div>

                  {/* --- Date Added --- */}
                  <div className="col-span-1">
                    <div className="md:hidden font-bold text-sm text-slate-500">
                      Date Added
                    </div>
                    <div className="text-slate-600 text-sm">
                      {new Date(supplier.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {/* --- Action Buttons --- */}
                  <div className="col-span-1 flex justify-end gap-3 mt-2 md:mt-0">
                    <button
                      onClick={() => handleEditClick(supplier)}
                      className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-full transition duration-200"
                      title="Edit"
                    >
                      <FiEdit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(supplier.id)}
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
                No suppliers found. Click "Add New" to get started!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Add/Edit Modal --- */}
      <SupplierModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        supplier={currentSupplier}
        formData={formData}
        onFormChange={handleFormChange}
      />
    </div>
  );
}
