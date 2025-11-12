import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit, FiTrash2, FiX } from "react-icons/fi";

// --- Modal Component for Add/Edit ---
function CustomerModal({
  isOpen,
  onClose,
  onSubmit,
  customer,
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
            {customer ? "Edit Customer" : "Add New Customer"}
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
                Customer Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={onFormChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., John Doe"
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
                placeholder="e.g., 1-800-222-3333"
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
                placeholder="e.g., john.doe@example.com"
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
                placeholder="e.g., 123 Main St, Anytown, USA 12345"
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
              Save Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Main Application Component ---
export default function Customer() {
  // --- State ---

  // Default form state
  const defaultFormState = {
    name: "",
    phone: "",
    email: "",
    address: "",
  };

  // Stores the list of all customers
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: "John Doe",
      phone: "1-800-222-3333",
      email: "john.doe@example.com",
      address: "123 Main St, Anytown, USA 12345",
      createdAt: "2025-11-08T14:30:00Z",
    },
    {
      id: 2,
      name: "Jane Smith",
      phone: "1-888-333-4444",
      email: "jane.smith@example.com",
      address: "456 Oak Ave, Sometown, USA 54321",
      createdAt: "2025-11-09T16:45:00Z",
    },
    {
      id: 3,
      name: "Example Corp",
      phone: "1-234-567-8900",
      email: "billing@examplecorp.com",
      address: "789 Business Rd, Cityville, USA 67890",
      createdAt: "2025-11-10T10:15:00Z",
    },
  ]);

  // Controls the visibility of the Add/Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Holds the customer object being edited, or null if adding a new one
  const [currentCustomer, setCurrentCustomer] = useState(null);

  // Holds the form data for the modal inputs
  const [formData, setFormData] = useState(defaultFormState);

  // --- Effects ---

  // Effect to populate form when `currentCustomer` changes (i.e., when "Edit" is clicked)
  useEffect(() => {
    if (currentCustomer) {
      setFormData({
        name: currentCustomer.name,
        phone: currentCustomer.phone,
        email: currentCustomer.email,
        address: currentCustomer.address,
      });
    } else {
      // Reset form when adding a new customer
      setFormData(defaultFormState);
    }
  }, [currentCustomer]);

  // --- Event Handlers ---

  // Opens the modal in "Add New" mode
  const handleAddNewClick = () => {
    setCurrentCustomer(null); // Ensure we're in "add" mode
    setFormData(defaultFormState); // Clear form
    setIsModalOpen(true);
  };

  // Opens the modal in "Edit" mode for a specific customer
  const handleEditClick = (customer) => {
    setCurrentCustomer(customer); // Set the customer to be edited
    setIsModalOpen(true);
  };

  // Closes the modal and resets state
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCustomer(null);
    setFormData(defaultFormState);
  };

  // Deletes a customer by its ID
  const handleDeleteClick = (customerId) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      setCustomers((prevCustomers) =>
        prevCustomers.filter((customer) => customer.id !== customerId)
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
    if (currentCustomer) {
      // --- Edit Logic ---
      setCustomers((prevCustomers) =>
        prevCustomers.map((customer) =>
          customer.id === currentCustomer.id
            ? { ...customer, ...formData }
            : customer
        )
      );
    } else {
      // --- Add Logic ---
      const newCustomer = {
        id: Date.now(), // Use a simple timestamp for a unique ID
        ...formData,
        createdAt: new Date().toISOString(), // Add creation timestamp
      };
      setCustomers((prevCustomers) => [...prevCustomers, newCustomer]);
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
            Inventory Customers
          </h1>
          <button
            onClick={handleAddNewClick}
            className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow-md hover:bg-indigo-700 transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <FiPlus className="w-5 h-5" />
            Add New
          </button>
        </div>

        {/* --- Customer List / Table --- */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          {/* --- Table Header (Visible on large screens) --- */}
          <div className="hidden md:grid md:grid-cols-5 gap-4 text-sm font-medium uppercase tracking-wider text-slate-600 bg-slate-100 p-4 border-b border-slate-200">
            <div className="col-span-1">Customer Name</div>
            <div className="col-span-1">Contact Info</div>
            <div className="col-span-1">Address</div>
            <div className="col-span-1">Date Added</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* --- Customer Items --- */}
          <div className="divide-y divide-slate-200">
            {customers.length > 0 ? (
              customers.map((customer) => (
                <div
                  key={customer.id}
                  className="grid md:grid-cols-5 gap-4 p-4 items-start hover:bg-slate-50"
                >
                  {/* --- Customer Name --- */}
                  <div className="col-span-1">
                    <div className="md:hidden font-bold text-sm text-slate-500">
                      Name
                    </div>
                    <div className="font-semibold text-slate-800 text-lg">
                      {customer.name}
                    </div>
                  </div>

                  {/* --- Contact Info --- */}
                  <div className="col-span-1 text-sm text-slate-600">
                    <div className="md:hidden font-bold text-sm text-slate-500 mb-1">
                      Contact Info
                    </div>
                    <div className="font-medium text-slate-800">
                      {customer.phone}
                    </div>
                    <div className="truncate">{customer.email}</div>
                  </div>

                  {/* --- Address --- */}
                  <div className="col-span-1">
                    <div className="md:hidden font-bold text-sm text-slate-500">
                      Address
                    </div>
                    <div className="text-slate-600 text-sm whitespace-pre-line">
                      {customer.address}
                    </div>
                  </div>

                  {/* --- Date Added --- */}
                  <div className="col-span-1">
                    <div className="md:hidden font-bold text-sm text-slate-500">
                      Date Added
                    </div>
                    <div className="text-slate-600 text-sm">
                      {new Date(customer.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {/* --- Action Buttons --- */}
                  <div className="col-span-1 flex justify-end gap-3 mt-2 md:mt-0">
                    <button
                      onClick={() => handleEditClick(customer)}
                      className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-full transition duration-200"
                      title="Edit"
                    >
                      <FiEdit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(customer.id)}
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
                No customers found. Click "Add New" to get started!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Add/Edit Modal --- */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        customer={currentCustomer}
        formData={formData}
        onFormChange={handleFormChange}
      />
    </div>
  );
}
