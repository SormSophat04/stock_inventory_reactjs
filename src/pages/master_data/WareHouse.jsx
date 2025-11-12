import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit, FiTrash2, FiX } from "react-icons/fi";

// --- Modal Component for Add/Edit ---
function WareHouseModal({
  isOpen,
  onClose,
  onSubmit,
  warehouse,
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
            {warehouse ? "Edit Warehouse" : "Add New Warehouse"}
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
                Warehouse Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={onFormChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Main Warehouse"
              />
            </div>
            {/* --- Location Input --- */}
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={onFormChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Phnom Penh"
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
              Save Warehouse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Main Warehouse Page Component ---
export default function WareHouse() {
  // --- State ---
  const defaultFormState = { name: "", location: "" };

  const [warehouses, setWarehouses] = useState([
    {
      id: 1,
      name: "Main Warehouse",
      location: "Phnom Penh",
      createdAt: "2025-11-08T10:00:00Z",
    },
    {
      id: 2,
      name: "Siem Reap Branch",
      location: "Siem Reap",
      createdAt: "2025-11-09T11:30:00Z",
    },
    {
      id: 3,
      name: "Battambang Storage",
      location: "Battambang",
      createdAt: "2025-11-10T14:00:00Z",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentWarehouse, setCurrentWarehouse] = useState(null);
  const [formData, setFormData] = useState(defaultFormState);

  // --- Effects ---
  useEffect(() => {
    if (currentWarehouse) {
      setFormData({
        name: currentWarehouse.name,
        location: currentWarehouse.location,
      });
    } else {
      setFormData(defaultFormState);
    }
  }, [currentWarehouse]);

  // --- Event Handlers ---
  const handleAddNewClick = () => {
    setCurrentWarehouse(null);
    setFormData(defaultFormState);
    setIsModalOpen(true);
  };

  const handleEditClick = (warehouse) => {
    setCurrentWarehouse(warehouse);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentWarehouse(null);
    setFormData(defaultFormState);
  };

  const handleDeleteClick = (warehouseId) => {
    if (window.confirm("Are you sure you want to delete this warehouse?")) {
      setWarehouses((prev) => prev.filter((wh) => wh.id !== warehouseId));
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (currentWarehouse) {
      setWarehouses((prev) =>
        prev.map((wh) =>
          wh.id === currentWarehouse.id ? { ...wh, ...formData } : wh
        )
      );
    } else {
      const newWarehouse = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setWarehouses((prev) => [...prev, newWarehouse]);
    }
    handleCloseModal();
  };

  // --- Render ---
  return (
    <div className="p-4 sm:p-8 font-inter">
      <div className="mx-auto">
        {/* --- Header --- */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Warehouses</h1>
          <button
            onClick={handleAddNewClick}
            className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow-md hover:bg-indigo-700 transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <FiPlus className="w-5 h-5" />
            Add New
          </button>
        </div>

        {/* --- Warehouse List / Table --- */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="hidden md:grid md:grid-cols-4 gap-4 text-sm font-medium uppercase tracking-wider text-slate-600 bg-slate-100 p-4 border-b border-slate-200">
            <div className="col-span-1">Warehouse Name</div>
            <div className="col-span-1">Location</div>
            <div className="col-span-1">Date Added</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          <div className="divide-y divide-slate-200">
            {warehouses.length > 0 ? (
              warehouses.map((warehouse) => (
                <div
                  key={warehouse.id}
                  className="grid md:grid-cols-4 gap-4 p-4 items-center hover:bg-slate-50"
                >
                  <div className="col-span-1 font-semibold text-slate-800 text-lg">
                    {warehouse.name}
                  </div>
                  <div className="col-span-1 text-slate-600 text-sm">
                    {warehouse.location}
                  </div>
                  <div className="col-span-1 text-slate-600 text-sm">
                    {new Date(warehouse.createdAt).toLocaleString()}
                  </div>
                  <div className="col-span-1 flex justify-end gap-3 mt-2 md:mt-0">
                    <button
                      onClick={() => handleEditClick(warehouse)}
                      className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-full transition duration-200"
                      title="Edit"
                    >
                      <FiEdit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(warehouse.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-full transition duration-200"
                      title="Delete"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-12 text-slate-500">
                No warehouses found. Click "Add New" to get started!
              </div>
            )}
          </div>
        </div>
      </div>

      <WareHouseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        warehouse={currentWarehouse}
        formData={formData}
        onFormChange={handleFormChange}
      />
    </div>
  );
}
