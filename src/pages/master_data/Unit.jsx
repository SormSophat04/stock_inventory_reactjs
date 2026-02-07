import React, { useState, useEffect, useContext } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiBox, FiSearch } from "react-icons/fi";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { AuthContext } from "../../contexts/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUnits,
  addUnit,
  updateUnit,
  deleteUnit,
  selectAllUnits,
  selectUnitStatus,
  selectUnitError,
} from "../../redux/slices/unitSlice";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-all p-4">
       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 flex flex-col">
        {/* --- Modal Header --- */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {unit ? "Edit Unit" : "New Unit"}
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
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700">Unit Name (e.g. PCS, KG)</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={onFormChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                placeholder="e.g. Box, Liter..."
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
                {unit ? "Update Unit" : "Create Unit"}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}

// --- Main Unit Page Component ---
export default function Unit() {
  const { user } = useContext(AuthContext);
  const dispatch = useDispatch();
  const units = useSelector(selectAllUnits);
  const status = useSelector(selectUnitStatus);
  const error = useSelector(selectUnitError);

  const ROLES = { ADMIN: "admin", MANAGER: "manager" };

  const defaultFormState = { name: "" };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUnit, setCurrentUnit] = useState(null);
  const [formData, setFormData] = useState(defaultFormState);
  const [searchQuery, setSearchQuery] = useState("");

  const hasRole = (roles) => user && user.role && roles.includes(user.role);

  useEffect(() => {
    if (currentUnit) {
      setFormData({ name: currentUnit.name });
    } else {
      setFormData(defaultFormState);
    }
  }, [currentUnit]);

  useEffect(() => {
    if (status === "idle") {
        dispatch(fetchUnits());
    }
  }, [status, dispatch]);

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

  const handleDeleteClick = async (unitId) => {
    if (window.confirm("Are you sure you want to delete this unit?")) {
      try {
        await dispatch(deleteUnit(unitId)).unwrap();
      } catch (err) {
        alert(err.message || "Failed to delete unit");
      }
    }
  };

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentUnit) {
        await dispatch(updateUnit({ id: currentUnit.unit_id, data: formData })).unwrap();
      } else {
        await dispatch(addUnit(formData)).unwrap();
      }
      handleCloseModal();
    } catch (err) {
      console.error("Submit Error:", err);
    }
  };

   const filteredUnits = units.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans min-h-[calc(100vh-80px)]">
      
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                <span className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                    <FiBox size={24} />
                </span>
                Units
            </h1>
            <p className="mt-1 text-gray-500 text-sm ml-14">Define measurement units for your inventory.</p>
          </div>
          
           <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FiSearch />
                </div>
                <input
                    type="text"
                    placeholder="Search units..."
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
                <span>New Unit</span>
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

        {/* --- Unit Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {status === 'loading' ? (
                <div className="col-span-full flex justify-center py-20">
                    <LoadingSpinner message="Loading Units..." />
                </div>
            ) : filteredUnits.length > 0 ? (
              filteredUnits.map((unit) => (
                <div
                  key={unit.unit_id}
                  className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all duration-200 relative overflow-hidden flex flex-col items-center justify-center text-center h-40"
                >
                   <div className="absolute top-2 right-2 transition-opacity opacity-0 group-hover:opacity-100 flex gap-1">
                       {hasRole([ROLES.ADMIN, ROLES.MANAGER]) && (
                           <>
                            <button
                                onClick={() => handleEditClick(unit)}
                                className="p-1.5 bg-gray-50 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-gray-100"
                                title="Edit"
                            >
                                <FiEdit2 size={14} />
                            </button>
                             {hasRole([ROLES.ADMIN]) && (
                                <button
                                    onClick={() => handleDeleteClick(unit.unit_id)}
                                    className="p-1.5 bg-gray-50 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-gray-100"
                                    title="Delete"
                                >
                                    <FiTrash2 size={14} />
                                </button>
                             )}
                           </>
                       )}
                  </div>
                  
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full mb-3">
                        <FiBox size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{unit.name}</h3>
                </div>
              ))
            ) : (
                 <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <FiBox size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">No units found.</p>
                </div>
            )}
        </div>

      {/* --- Add/Edit Modal --- */}
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
