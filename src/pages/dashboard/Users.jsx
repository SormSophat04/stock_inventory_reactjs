import React, { useState, useEffect } from "react";
import { Plus, Upload, Search, ChevronDown, X, Trash2, Edit2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    selectAllUsers,
    selectUserStatus,
    selectUserError
} from "../../redux/slices/userSlice";

const getRoleClass = (role) => {
  const baseClass =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  switch (role) {
    case "admin":
      return `${baseClass} bg-purple-100 text-purple-800`;
    case "manager":
      return `${baseClass} bg-yellow-100 text-yellow-800`;
    case "cashier":
      return `${baseClass} bg-cyan-100 text-cyan-800`;
    case "warehouse_stuff":
      return `${baseClass} bg-indigo-100 text-indigo-800`;
    default:
      return `${baseClass} bg-gray-100 text-gray-800`;
  }
};


// --- Main App Component ---
// --- Main App Component ---
export default function Users() {
  const dispatch = useDispatch();
  const users = useSelector(selectAllUsers);
  const status = useSelector(selectUserStatus);
  const error = useSelector(selectUserError);

  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const defaultFormState = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "cashier", // Default to cashier
  };
  
  const [newUserData, setNewUserData] = useState(defaultFormState);

  useEffect(() => {
    if (status === "idle") {
        dispatch(fetchUsers());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (editingUser) {
        setNewUserData({
            name: editingUser.name,
            email: editingUser.email,
            password: "", // Don't populate password on edit
            confirmPassword: "",
            role: editingUser.role
        });
    } else {
        setNewUserData(defaultFormState);
    }
  }, [editingUser]);

  // --- Filter Tabs Data ---
  const tabs = [
    { name: "All", count: users.length },
    { name: "admin", count: users.filter((u) => u.role === "admin").length },
    {
      name: "manager",
      count: users.filter((u) => u.role === "manager").length,
    },
    {
      name: "cashier",
      count: users.filter((u) => u.role === "cashier").length,
    },
    {
      name: "warehouse_stuff",
      count: users.filter((u) => u.role === "warehouse_stuff").length,
    },
  ];

  // Filter users based on the active tab and search term
  const filteredUsers = users.filter((user) => {
    // Tab filter logic
    const tabMatch = activeTab === "All" || user.role === activeTab;

    // Search filter logic
    const searchMatch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    return tabMatch && searchMatch;
  });

  // Handle "select all" checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(new Set(filteredUsers.map((u) => u.user_id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  // Handle individual row checkbox
  const handleSelectUser = (userId) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const isAllSelected =
    filteredUsers.length > 0 && selectedUsers.size === filteredUsers.length;

  // Handle form input changes for new user
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDeleteClick = async (userId) => {
      if (window.confirm("Are you sure you want to delete this user?")) {
          try {
              await dispatch(deleteUser(userId)).unwrap();
          } catch (err) {
              console.error("Delete failed: ", err);
              alert("Failed to delete user: " + (err.message || err));
          }
      }
  };

  const handleEditClick = (user) => {
      setEditingUser(user);
      setIsModalOpen(true);
  };

  // Handle form submission for new user
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    if (newUserData.password !== newUserData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
        if (editingUser) {
            // Update logic
            const updateData = { ...newUserData };
            if (!updateData.password) delete updateData.password; // Don't send empty password
            delete updateData.confirmPassword;
            
            await dispatch(updateUser({ id: editingUser.user_id, data: updateData })).unwrap();
        } else {
            // Add logic
            await dispatch(addUser(newUserData)).unwrap();
        }
        setIsModalOpen(false); // Close modal on success
        setEditingUser(null);
        setNewUserData(defaultFormState);
    } catch (err) {
        console.error("Operation failed:", err);
        // Error is handled by Redux state, but we could show an alert here too
    }
  };

  return (
    <div className=" bg-gray-100 p-4 sm:p-8 font-inter">
      {/* Main content card */}
      <div className="mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                User Management
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage registered users and their permissions
              </p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingUser(null);
                  setNewUserData(defaultFormState);
                  setIsModalOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus size={16} />
                Add User
              </button>
              <button className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white text-gray-700 text-sm font-medium rounded-md shadow-sm border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Upload size={16} />
                Export CSV
              </button>
            </div>
          </div>

          {/* Tabs & Search Section */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            {/* Tabs */}
            <div className="flex-shrink-0">
              <nav className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.name
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tab.name.charAt(0).toUpperCase() +
                      tab.name.slice(1).replace("_", " ")}{" "}
                    ({tab.count})
                  </button>
                ))}
              </nav>
            </div>

            {/* Search & Filter */}
            <div className="flex-shrink-0 flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm">
                Filters <ChevronDown size={16} />
              </button>
            </div>
          </div>

          {/* User Table Section */}
          <div className="mt-6 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-200">
                  {/* Table Header */}
                  <thead>
                    <tr className="bg-gray-50">
                      <th scope="col" className="relative px-6 py-3.5">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                          aria-label="Select all users"
                        />
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Role
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Joined
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  {/* Table Body */}
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {status === 'loading' ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          Loading users...
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center py-4 text-red-500"
                        >
                          Error: {typeof error === 'object' ? error.message || JSON.stringify(error) : error}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.user_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={selectedUsers.has(user.user_id)}
                              onChange={() => handleSelectUser(user.user_id)}
                              aria-label={`Select user ${user.name}`}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={`https://placehold.co/40x40/E2E8F0/4A5568?text=${user.name
                                    .substring(0, 2)
                                    .toUpperCase()}`}
                                  alt={`${user.name} avatar`}
                                />
                              </div>
                              <div className="ml-3">
                                <a
                                  href="#"
                                  className="text-sm font-medium text-blue-600 hover:underline"
                                >
                                  {user.name}
                                </a>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">
                              {user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getRoleClass(user.role)}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => handleEditClick(user)}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-1 rounded-full transition-colors"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteClick(user.user_id)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-100 p-1 rounded-full transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Simple Pagination (placeholder) */}
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to{" "}
              <span className="font-medium">{filteredUsers.length}</span> of{" "}
              <span className="font-medium">{users.length}</span> results
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                disabled
              >
                Previous
              </button>
              <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm transition-opacity"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg m-4 transition-all transform opacity-100 scale-100">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-4 border-b rounded-t">
              <h3
                className="text-xl font-semibold text-gray-900"
                id="modal-title"
              >
                {editingUser ? "Edit User" : "Add New User"}
              </h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body - Form */}
            <form onSubmit={handleAddUserSubmit}>
              <div className="p-6 space-y-4">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={newUserData.name}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="e.g. Sarah Johnson"
                    required
                  />
                </div>
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={newUserData.email}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="name@company.com"
                    required
                  />
                </div>
                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={newUserData.password}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="••••••••"
                    required
                  />
                </div>
                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    value={newUserData.confirmPassword}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="••••••••"
                    required
                  />
                </div>
                {/* Role */}
                <div>
                  <label
                    htmlFor="role"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={newUserData.role}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="cashier">Cashier</option>
                    <option value="warehouse_stuff">Warehouse Staff</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer - Actions */}
              <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b">
                <button
                  type="submit"
                  className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  {editingUser ? "Save Changes" : "Add User"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
