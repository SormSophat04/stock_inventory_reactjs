import React, { useState, useEffect, useContext } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiHome, FiSearch, FiMapPin } from "react-icons/fi";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { AuthContext } from "../../contexts/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWarehouses,
  addWarehouse,
  updateWarehouse,
  deleteWarehouse,
  selectAllWarehouses,
  selectWarehouseStatus,
  selectWarehouseError,
} from "../../redux/slices/warehouseSlice";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-all p-4">
       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 flex flex-col">
        {/* --- Modal Header --- */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {warehouse ? "Edit Warehouse" : "New Warehouse"}
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
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700">Warehouse Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={onFormChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                placeholder="e.g. Central Hub"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-semibold text-gray-700">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={onFormChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                placeholder="City or Region"
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
                {warehouse ? "Update Warehouse" : "Create Warehouse"}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}

// --- Main Warehouse Page Component ---
export default function WareHouse() {
  const { user } = useContext(AuthContext);
  const dispatch = useDispatch();
  const warehouses = useSelector(selectAllWarehouses);
  const status = useSelector(selectWarehouseStatus);
  const error = useSelector(selectWarehouseError);

  const ROLES = { ADMIN: "admin", MANAGER: "manager" };

  const defaultFormState = { name: "", location: "" };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentWarehouse, setCurrentWarehouse] = useState(null);
  const [formData, setFormData] = useState(defaultFormState);
  const [searchQuery, setSearchQuery] = useState("");

  const hasRole = (roles) => user && user.role && roles.includes(user.role);

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

  useEffect(() => {
    if (status === "idle") {
        dispatch(fetchWarehouses());
    }
  }, [status, dispatch]);

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

  const handleDeleteClick = async (warehouseId) => {
    if (window.confirm("Are you sure you want to delete this warehouse?")) {
      try {
        await dispatch(deleteWarehouse(warehouseId)).unwrap();
      } catch (err) {
        alert(err.message || "Failed to delete warehouse");
      }
    }
  };

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      if (currentWarehouse) {
        await dispatch(updateWarehouse({ id: currentWarehouse.warehouse_id, data: formData })).unwrap();
      } else {
        await dispatch(addWarehouse(formData)).unwrap();
      }
      handleCloseModal();
    } catch (err) {
      console.error("Submit Error:", err);
    }
  };

  const filteredWarehouses = warehouses.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans min-h-[calc(100vh-80px)]">
      
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                <span className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                    <FiHome size={24} />
                </span>
                Warehouses
            </h1>
            <p className="mt-1 text-gray-500 text-sm ml-14">Manage physical storage locations.</p>
          </div>
          
           <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FiSearch />
                </div>
                <input
                    type="text"
                    placeholder="Search warehouses..."
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
                <span>New Warehouse</span>
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

        {/* --- Warehouse Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {status === 'loading' ? (
                <div className="col-span-full flex justify-center py-20">
                    <LoadingSpinner message="Loading Warehouses..." />
                </div>
            ) : filteredWarehouses.length > 0 ? (
              filteredWarehouses.map((warehouse) => (
                <div
                  key={warehouse.warehouse_id}
                  className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all duration-200 relative overflow-hidden flex flex-col justify-between h-48"
                >
                   <div className="absolute top-4 right-4 transition-opacity opacity-0 group-hover:opacity-100 flex gap-2">
                       {hasRole([ROLES.ADMIN, ROLES.MANAGER]) && (
                           <>
                            <button
                                onClick={() => handleEditClick(warehouse)}
                                className="p-2 bg-gray-50 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-gray-100"
                                title="Edit"
                            >
                                <FiEdit2 size={16} />
                            </button>
                             {hasRole([ROLES.ADMIN]) && (
                                <button
                                    onClick={() => handleDeleteClick(warehouse.warehouse_id)}
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
                    <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-xl mb-4">
                         <FiHome size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{warehouse.name}</h3>
                  </div>

                  <div className="flex items-center gap-2 text-gray-500 text-sm mt-4">
                      <FiMapPin className="shrink-0" />
                      <span className="truncate">{warehouse.location}</span>
                  </div>
                </div>
              ))
            ) : (
                 <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <FiHome size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">No warehouses found.</p>
                </div>
            )}
        </div>

      {/* --- Add/Edit Modal --- */}
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
