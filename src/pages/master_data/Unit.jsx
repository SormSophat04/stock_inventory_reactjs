import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit, FiTrash2, FiX } from "react-icons/fi";

// --- Modal Component for Add/Edit ---
function UnitModal({
  isOpen,
  onClose,
  onSubmit,
  unit,
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
            {unit ? "Edit Unit" : "Add New Unit"}
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
                Unit Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={onFormChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., PCS, KG, Box"
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
              Save Unit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Main Unit Page Component ---
export default function Unit() {
  // --- State ---
  const defaultFormState = { name: "" };

  const [units, setUnits] = useState([
    { id: 1, name: "PCS", createdAt: "2025-11-08T10:00:00Z" },
    { id: 2, name: "KG", createdAt: "2025-11-09T11:30:00Z" },
    { id: 3, name: "Box", createdAt: "2025-11-10T14:00:00Z" },
    { id: 4, name: "Meter", createdAt: "2025-11-11T09:45:00Z" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUnit, setCurrentUnit] = useState(null);
  const [formData, setFormData] = useState(defaultFormState);

  // --- Effects ---
  useEffect(() => {
    if (currentUnit) {
      setFormData({ name: currentUnit.name });
    } else {
      setFormData(defaultFormState);
    }
  }, [currentUnit]);

  // --- Event Handlers ---
  const handleAddNewClick = () => {
    setCurrentUnit(null);
    setFormData(defaultFormState);
    setIsModalOpen(true);
  };

  const handleEditClick = (unit) => {
    setCurrentUnit(unit);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUnit(null);
    setFormData(defaultFormState);
  };

  const handleDeleteClick = (unitId) => {
    if (window.confirm("Are you sure you want to delete this unit?")) {
      setUnits((prevUnits) => prevUnits.filter((unit) => unit.id !== unitId));
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (currentUnit) {
      setUnits((prevUnits) =>
        prevUnits.map((unit) =>
          unit.id === currentUnit.id ? { ...unit, ...formData } : unit
        )
      );
    } else {
      const newUnit = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setUnits((prevUnits) => [...prevUnits, newUnit]);
    }
    handleCloseModal();
  };

  // --- Render ---
  return (
    <div className="p-4 sm:p-8 font-inter">
      <div className="mx-auto">
        {/* --- Header --- */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Inventory Units</h1>
          <button
            onClick={handleAddNewClick}
            className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow-md hover:bg-indigo-700 transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <FiPlus className="w-5 h-5" />
            Add New
          </button>
        </div>

        {/* --- Unit List / Table --- */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="hidden md:grid md:grid-cols-3 gap-4 text-sm font-medium uppercase tracking-wider text-slate-600 bg-slate-100 p-4 border-b border-slate-200">
            <div className="col-span-1">Unit Name</div>
            <div className="col-span-1">Date Added</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          <div className="divide-y divide-slate-200">
            {units.length > 0 ? (
              units.map((unit) => (
                <div
                  key={unit.id}
                  className="grid md:grid-cols-3 gap-4 p-4 items-center hover:bg-slate-50"
                >
                  <div className="col-span-1 font-semibold text-slate-800 text-lg">
                    {unit.name}
                  </div>
                  <div className="col-span-1 text-slate-600 text-sm">
                    {new Date(unit.createdAt).toLocaleString()}
                  </div>
                  <div className="col-span-1 flex justify-end gap-3 mt-2 md:mt-0">
                    <button
                      onClick={() => handleEditClick(unit)}
                      className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-full transition duration-200"
                      title="Edit"
                    >
                      <FiEdit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(unit.id)}
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
                No units found. Click "Add New" to get started!
              </div>
            )}
          </div>
        </div>
      </div>

      <UnitModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        unit={currentUnit}
        formData={formData}
        onFormChange={handleFormChange}
      />
    </div>
  );
}
