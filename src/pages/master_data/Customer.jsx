import React, { useState, useEffect, useContext } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUsers, FiSearch, FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { AuthContext } from "../../contexts/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  selectAllCustomers,
  selectCustomerStatus,
  selectCustomerError,
} from "../../redux/slices/customerSlice";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-all p-4">
       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 flex flex-col max-h-[90vh]">
        {/* --- Modal Header --- */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {customer ? "Edit Customer" : "New Customer"}
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
           <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700">Customer Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={onFormChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                placeholder="e.g. John Doe"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">Phone</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={onFormChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                        placeholder="+1 234 567 890"
                    />
                </div>
                 <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={onFormChange}
                         className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                        placeholder="john@example.com"
                    />
                </div>
            </div>
            
             <div className="space-y-2">
                <label htmlFor="address" className="block text-sm font-semibold text-gray-700">Address</label>
                <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={onFormChange}
                    rows="3"
                     className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none"
                    placeholder="Delivery address..."
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
              {customer ? "Update Customer" : "Create Customer"}
            </button>
          </div>
      </div>
    </div>
  );
}

// --- Main Application Component ---
export default function Customer() {
  const { user } = useContext(AuthContext);
  const dispatch = useDispatch();
  const customers = useSelector(selectAllCustomers);
  const status = useSelector(selectCustomerStatus);
  const error = useSelector(selectCustomerError);

  const ROLES = { ADMIN: "admin", MANAGER: "manager", CASHIER: "cashier" };

  const defaultFormState = { name: "", phone: "", email: "", address: "" };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [formData, setFormData] = useState(defaultFormState);
  const [searchQuery, setSearchQuery] = useState("");

  const hasRole = (roles) => user && user.role && roles.includes(user.role);

  useEffect(() => {
    if (status === "idle") {
        dispatch(fetchCustomers());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (currentCustomer) {
      setFormData({
        name: currentCustomer.name,
        phone: currentCustomer.phone,
        email: currentCustomer.email || "",
        address: currentCustomer.address || "",
      });
    } else {
      setFormData(defaultFormState);
    }
  }, [currentCustomer]);

  const handleAddNewClick = () => {
    setCurrentCustomer(null);
    setFormData(defaultFormState);
    setIsModalOpen(true);
  };

  const handleEditClick = (customer) => {
    setCurrentCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCustomer(null);
    setFormData(defaultFormState);
  };

  const handleDeleteClick = async (customerId) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await dispatch(deleteCustomer(customerId)).unwrap();
      } catch (err) {
         alert(err.message || "Failed to delete customer");
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
      if (currentCustomer) {
        await dispatch(updateCustomer({ id: currentCustomer.customer_id, data: formData })).unwrap();
      } else {
        await dispatch(addCustomer(formData)).unwrap();
      }
      handleCloseModal();
    } catch (err) {
      console.error("Submit Error:", err);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans min-h-[calc(100vh-80px)]">
      
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                <span className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                    <FiUsers size={24} />
                </span>
                Customers
            </h1>
            <p className="mt-1 text-gray-500 text-sm ml-14">Manage your customer base.</p>
          </div>
          
           <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FiSearch />
                </div>
                <input
                    type="text"
                    placeholder="Search customers..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-sm shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            
             {hasRole([ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER]) && (
                <button
                onClick={handleAddNewClick}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-600/20 transition-all transform hover:scale-[1.02] whitespace-nowrap"
                >
                <FiPlus size={20} />
                <span>New Customer</span>
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

        {/* --- Customer Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {status === 'loading' ? (
                <div className="col-span-full flex justify-center py-20">
                    <LoadingSpinner message="Loading Customers..." />
                </div>
            ) : filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <div
                  key={customer.customer_id}
                  className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all duration-200 relative overflow-hidden flex flex-col h-full"
                >
                   <div className="absolute top-4 right-4 transition-opacity opacity-0 group-hover:opacity-100 flex gap-2">
                       {hasRole([ROLES.ADMIN, ROLES.MANAGER]) && (
                           <>
                            <button
                                onClick={() => handleEditClick(customer)}
                                className="p-2 bg-gray-50 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-gray-100"
                                title="Edit"
                            >
                                <FiEdit2 size={16} />
                            </button>
                             {hasRole([ROLES.ADMIN]) && (
                                <button
                                    onClick={() => handleDeleteClick(customer.customer_id)}
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
                            <FiUsers size={24} />
                       </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-4 pr-16">{customer.name}</h3>
                  
                  <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3 text-gray-600 text-sm">
                          <FiPhone className="text-gray-400 shrink-0" />
                          <span>{customer.phone || "No phone"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600 text-sm">
                          <FiMail className="text-gray-400 shrink-0" />
                          <span className="truncate">{customer.email || "No email"}</span>
                      </div>
                       <div className="flex items-start gap-3 text-gray-600 text-sm">
                          <FiMapPin className="text-gray-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{customer.address || "No address"}</span>
                      </div>
                  </div>

                   <div className="pt-4 mt-4 border-t border-gray-50 text-xs text-gray-400 flex justify-between">
                      <span>Added: {new Date(customer.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
                 <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <FiUsers size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">No customers found.</p>
                </div>
            )}
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
