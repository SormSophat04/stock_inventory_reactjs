import React from "react";
import SidebarItem from "./SidebarItem";
import { BsBoxSeam, BsBarChartFill } from "react-icons/bs";
import { FaRuler } from "react-icons/fa";
import {
  FiBookmark,
  FiTruck,
  FiLogOut,
  FiRepeat,
  FiEdit,
  FiCheckSquare,
  FiChevronDown,
  FiAlertTriangle,
  FiFilePlus,
  FiFile,
  FiLogIn,
  FiCornerUpLeft,
  FiGrid,
  FiDollarSign,
  FiPackage,
  FiArchive,
  FiShoppingCart,
  FiLayers,
  FiFileText,
  FiUsers,
  FiSettings,
} from "react-icons/fi";
import SidebarDropdown from "./SidebarDropdown";
import { AuthContext } from "../contexts/AuthContext";

const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  CASHIER: "cashier",
  WAREHOUSE_STAFF: "warehouse_stuff",
};

function SideBar() {
  const { user, logout } = React.useContext(AuthContext);

  const hasRole = (roles) => {
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  };

  return (
    <aside className="h-screen w-64 bg-white border-r border-gray-200 fixed top-0 left-0 overflow-y-auto">
      <nav className="h-full flex flex-col">
        <div className="p-4 pb-2 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BsBarChartFill className="text-blue-600" size={24} />
            <span className="text-xl font-bold text-gray-800">InsData</span>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <FiSettings size={20} />
          </button>
        </div>
        <div className="p-4">
          <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between cursor-pointer border border-gray-200 hover:bg-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BsBoxSeam size={20} className="text-blue-600" />
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-800">
                  Ziplox
                </span>
                <span className="text-xs text-gray-500 block">
                  Online Store
                </span>
              </div>
            </div>
            <FiChevronDown size={16} className="text-gray-500" />
          </div>
        </div>
        <ul className="flex-1 px-4">
          <SidebarItem
            to="/dashboard"
            icon={<FiGrid size={20} />}
            text="Dashboard"
          />
          {hasRole([ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER]) && (
            <SidebarItem
              to="/point-of-sales"
              icon={<FiShoppingCart size={20} />}
              text="Point of Sales"
            />
          )}
          {hasRole([ROLES.ADMIN]) && (
            <SidebarItem
              to="/users"
              icon={<FiUsers size={20} />}
              text="Users"
            />
          )}

          {hasRole([ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER]) && (
            <SidebarDropdown text="Master Data" defaultOpen={true}>
              {hasRole([ROLES.ADMIN, ROLES.MANAGER]) && (
                <>
                  <SidebarItem
                    to="/products"
                    icon={<FiPackage size={20} />}
                    text="Products"
                  />
                  <SidebarItem
                    to="/categories"
                    icon={<FiLayers size={20} />}
                    text="Categories"
                  />
                  <SidebarItem
                    to="/brands"
                    icon={<FiBookmark size={20} />}
                    text="Brands"
                  />
                  <SidebarItem
                    to="/suppliers"
                    icon={<FiTruck size={20} />}
                    text="Suppliers"
                  />
                </>
              )}
              {hasRole([ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER]) && (
                <SidebarItem
                  to="/customers"
                  icon={<FiUsers size={20} />}
                  text="Customers"
                />
              )}
              {hasRole([ROLES.ADMIN, ROLES.MANAGER]) && (
                <>
                  <SidebarItem
                    to="/units"
                    icon={<FaRuler size={20} />}
                    text="Units"
                  />
                  <SidebarItem
                    to="/warehouses"
                    icon={<FiArchive size={20} />}
                    text="Warehouses"
                  />
                </>
              )}
            </SidebarDropdown>
          )}

          {hasRole([ROLES.ADMIN, ROLES.MANAGER, ROLES.WAREHOUSE_STAFF]) && (
            <SidebarDropdown text="Inventory" defaultOpen={true}>
              {hasRole([ROLES.ADMIN, ROLES.MANAGER]) && (
                <>
                  <SidebarItem
                    to="/inventory/stock-in"
                    icon={<FiLogIn size={20} />}
                    text="Stock In (Purchase)"
                  />
                  <SidebarItem
                    to="/inventory/stock-out"
                    icon={<FiLogOut size={20} />}
                    text="Stock Out (Sales)"
                  />
                </>
              )}
              {hasRole([ROLES.ADMIN, ROLES.MANAGER, ROLES.WAREHOUSE_STAFF]) && (
                <>
                  <SidebarItem
                    to="/inventory/transfer"
                    icon={<FiRepeat size={20} />}
                    text="Stock Transfer"
                  />
                  {/* <SidebarItem
                    to="/inventory/adjustment"
                    icon={<FiEdit size={20} />}
                    text="Stock Adjustment"
                  /> */}
                  <SidebarItem
                    to="/inventory/count"
                    icon={<FiCheckSquare size={20} />}
                    text="Stock Count"
                  />
                </>
              )}
              {hasRole([ROLES.ADMIN, ROLES.MANAGER]) && (
                <SidebarItem
                  to="/inventory/low-stock"
                  icon={<FiAlertTriangle size={20} />}
                  text="Low Stock Alerts"
                />
              )}
            </SidebarDropdown>
          )}

          {hasRole([ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER]) && (
            <SidebarDropdown text="Transactions" defaultOpen={true}>
              {hasRole([ROLES.ADMIN, ROLES.MANAGER]) && (
                <>
                  <SidebarItem
                    to="/transactions/purchases"
                    icon={<FiFileText size={20} />}
                    text="Purchase Orders"
                  />
                  {/* <SidebarItem
                    to="/transactions/purchase-invoices"
                    icon={<FiFilePlus size={20} />}
                    text="Purchase Invoices"
                  /> */}
                </>
              )}
              {/* <SidebarItem
                to="/transactions/sales"
                icon={<FiShoppingCart size={20} />}
                text="Sales Orders"
              /> */}
              <SidebarItem
                to="/transactions/sales-invoices"
                icon={<FiFile size={20} />}
                text="Sales Invoices"
              />
              <SidebarItem
                to="/transactions/returns"
                icon={<FiCornerUpLeft size={20} />}
                text="Return Orders"
              />
              {/* <SidebarItem
                to="/transactions/payments"
                icon={<FiDollarSign size={20} />}
                text="Payment Management"
              /> */}
            </SidebarDropdown>
          )}

          {/* You can add the other sections (Accounting, Reports, etc.) following the same pattern */}
        </ul>
        {/* Logout Button */}
        <div className="p-4">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200"
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}

export default SideBar;
