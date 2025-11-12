import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard,
  ShoppingCart,
  DollarSign,
  Package,
  AlertTriangle,
  Warehouse,
  LineChart as LineChartIcon,
  BarChart3,
  ChevronDown,
  Calendar,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { Toaster, toast } from "react-hot-toast";

// --- Mock Data ---
// Used as a fallback on API error or during development
const mockData = {
  stats: {
    total_products: 120,
    total_stock_value: 20500.75,
    today_sales: 850.2,
    low_stock_count: 4,
  },
  sales_chart: [
    { date: "Mon", total: 200 },
    { date: "Tue", total: 450 },
    { date: "Wed", total: 300 },
    { date: "Thu", total: 600 },
    { date: "Fri", total: 850 },
    { date: "Sat", total: 700 },
    { date: "Sun", total: 550 },
  ],
  profit_chart: [
    { date: "Nov 6", revenue: 1000, cogs: 700, profit: 300 },
    { date: "Nov 7", revenue: 1200, cogs: 800, profit: 400 },
    { date: "Nov 8", revenue: 900, cogs: 650, profit: 250 },
    { date: "Nov 9", revenue: 1500, cogs: 900, profit: 600 },
    { date: "Nov 10", revenue: 1700, cogs: 1000, profit: 700 },
    { date: "Nov 11", revenue: 1400, cogs: 850, profit: 550 },
    { date: "Nov 12", revenue: 1900, cogs: 1100, profit: 800 },
  ],
  warehouse_stock: [
    { id: 1, warehouse_name: "Main Warehouse", total_stock: 4500 },
    { id: 2, warehouse_name: "West Wing Storage", total_stock: 1200 },
    { id: 3, warehouse_name: "Cold Storage", total_stock: 350 },
    { id: 4, warehouse_name: "Overflow Unit B", total_stock: 800 },
  ],
  low_stock: [
    { id: 1, name: "Premium USB-C Cable", current_stock: 3, min_level: 5 },
    { id: 2, name: "Wireless Mouse", current_stock: 8, min_level: 10 },
    { id: 3, name: "Bluetooth Keyboard", current_stock: 2, min_level: 5 },
    { id: 4, name: "4K Monitor", current_stock: 1, min_level: 2 },
  ],
  top_categories: [
    { id: 1, name: "Electronics", products_count: 40 },
    { id: 2, name: "Peripherals", products_count: 32 },
    { id: 3, name: "Cables & Adapters", products_count: 25 },
    { id: 4, name: "Audio", products_count: 15 },
  ],
  top_brands: [
    { id: 1, name: "Apple", products_count: 12 },
    { id: 2, name: "Logitech", products_count: 18 },
    { id: 3, name: "Samsung", products_count: 9 },
    { id: 4, name: "Anker", products_count: 22 },
  ],
  recent_sales: [
    {
      id: 1,
      invoice_no: "INV001",
      customer_name: "John Doe",
      total_amount: 150.0,
    },
    {
      id: 2,
      invoice_no: "INV002",
      customer_name: "Jane Smith",
      total_amount: 299.99,
    },
    {
      id: 3,
      invoice_no: "INV003",
      customer_name: "Tech Corp",
      total_amount: 1200.5,
    },
  ],
  recent_purchases: [
    {
      id: 1,
      invoice_no: "PUR001",
      supplier_name: "ABC Supplier",
      total_amount: 2500.0,
    },
    {
      id: 2,
      invoice_no: "PUR002",
      supplier_name: "Global Electronics",
      total_amount: 750.0,
    },
    {
      id: 3,
      invoice_no: "PUR003",
      supplier_name: "Component World",
      total_amount: 320.8,
    },
  ],
};

// --- Role-Based Access Control (RBAC) ---
const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  CASHIER: "cashier",
  WAREHOUSE: "warehouse",
};

const authRoles = {
  // Section: [Allowed Roles]
  "stats.total_products": [ROLES.ADMIN, ROLES.MANAGER],
  "stats.total_stock_value": [ROLES.ADMIN, ROLES.MANAGER],
  "stats.today_sales": [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],
  "stats.low_stock_count": [ROLES.ADMIN, ROLES.MANAGER, ROLES.WAREHOUSE],
  "charts.sales": [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],
  "charts.profit": [ROLES.ADMIN],
  "panel.warehouse": [ROLES.ADMIN, ROLES.MANAGER, ROLES.WAREHOUSE],
  "panel.low_stock": [ROLES.ADMIN, ROLES.MANAGER, ROLES.WAREHOUSE],
  "panel.insights": [ROLES.ADMIN, ROLES.MANAGER],
  "panel.recent_sales": [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],
  "panel.recent_purchases": [ROLES.ADMIN, ROLES.MANAGER],
};

/**
 * Checks if the current user role has permission to view a section.
 * @param {string} userRole - The role of the current user.
 * @param {string} section - The key of the section to check (e.g., 'charts.profit').
 * @returns {boolean} - True if allowed, false otherwise.
 */
const canView = (userRole, section) => {
  return authRoles[section]?.includes(userRole) || userRole === ROLES.ADMIN;
};

// --- Reusable Components ---

/**
 * A motion-enhanced card for displaying key statistics.
 */
const StatCard = ({ title, value, icon, change, isCurrency = false }) => (
  <motion.div
    className="bg-white p-5 rounded-xl shadow-lg flex items-center justify-between border border-gray-200"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </p>
      <div className="text-3xl font-bold text-gray-900">
        {isCurrency && "$"}
        <CountUp
          end={value}
          duration={1.5}
          separator=","
          decimals={isCurrency ? 2 : 0}
        />
      </div>
      {change && (
        <p
          className={`text-xs mt-1 ${
            change.startsWith("+") ? "text-green-500" : "text-red-500"
          }`}
        >
          {change} from last week
        </p>
      )}
    </div>
    <div className="bg-gray-100 text-gray-600 p-3 rounded-full">{icon}</div>
  </motion.div>
);

/**
 * A stylized container for charts and panels.
 */
const Panel = ({ title, children, className = "" }) => (
  <motion.div
    className={`bg-white p-6 rounded-xl shadow-lg border border-gray-200 ${className}`}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4 }}
  >
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    <div>{children}</div>
  </motion.div>
);

/**
 * A scrollable list component for panels.
 */
const ScrollableList = ({ items, renderItem }) => (
  <div className="max-h-[250px] overflow-y-auto pr-2 space-y-3">
    {items.map((item) => renderItem(item))}
  </div>
);

// --- Main Dashboard Component ---

/**
 * Inventory Management Dashboard
 * @param {object} props
 * @param {string} props.userRole - The role of the currently logged-in user.
 */
const Dashboard = ({ userRole = ROLES.ADMIN }) => {
  const data = mockData; // Use static mock data directly

  // Memoize the user's permissions
  const permissions = useMemo(
    () => ({
      viewTotalProducts: canView(userRole, "stats.total_products"),
      viewTotalStockValue: canView(userRole, "stats.total_stock_value"),
      viewTodaySales: canView(userRole, "stats.today_sales"),
      viewLowStockCount: canView(userRole, "stats.low_stock_count"),
      viewSalesChart: canView(userRole, "charts.sales"),
      viewProfitChart: canView(userRole, "charts.profit"),
      viewWarehousePanel: canView(userRole, "panel.warehouse"),
      viewLowStockPanel: canView(userRole, "panel.low_stock"),
      viewInsightsPanel: canView(userRole, "panel.insights"),
      viewRecentSales: canView(userRole, "panel.recent_sales"),
      viewRecentPurchases: canView(userRole, "panel.recent_purchases"),
    }),
    [userRole]
  );

  // --- Notification Effect ---
  useEffect(() => {
    // 🔔 Placeholder for Firebase Notifications
    // You would set up your Firebase listener here (e.g., using Firebase Messaging)
    // onMessage(messaging, (payload) => {
    //   console.log('Message received. ', payload);
    //   toast.success(payload.notification.title);
    // });

    // Example: Show a toast if low stock items are detected on data load
    if (data.stats?.low_stock_count > 0) {
      toast.error(
        `${data.stats.low_stock_count} item(s) are running low on stock!`,
        { icon: <AlertTriangle className="text-red-500" /> }
      );
    }
  }, [data.stats?.low_stock_count]); // Depends on low_stock_count

  return (
    <div className=" text-gray-900 p-4 md:p-8">
      <Toaster position="top-right" reverseOrder={false} />

      {/* --- Header --- */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Inventory Dashboard
        </h1>
      </header>

      {/* --- 1. Top Summary Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {permissions.viewTotalProducts && (
          <StatCard
            title="Total Products"
            value={data.stats?.total_products || 0}
            icon={<Package size={24} />}
          />
        )}
        {permissions.viewTotalStockValue && (
          <StatCard
            title="Total Stock Value"
            value={data.stats?.total_stock_value || 0}
            icon={<DollarSign size={24} />}
            isCurrency={true}
          />
        )}
        {permissions.viewTodaySales && (
          <StatCard
            title="Today's Sales"
            value={data.stats?.today_sales || 0}
            icon={<ShoppingCart size={24} />}
            isCurrency={true}
          />
        )}
        {permissions.viewLowStockCount && (
          <StatCard
            title="Low Stock Items"
            value={data.stats?.low_stock_count || 0}
            icon={<AlertTriangle size={24} />}
          />
        )}
      </div>

      {/* --- Main Dashboard Grid (Charts, Lists, Panels) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- Main Column (Charts & Transactions) --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* --- 2. Sales & Stock Charts --- */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {permissions.viewSalesChart && (
              <Panel title="Weekly Sales">
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={data.sales_chart}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e0e0e0"
                      />
                      <XAxis dataKey="date" fontSize={12} stroke="#666" />
                      <YAxis fontSize={12} stroke="#666" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          borderColor: "#ccc",
                        }}
                      />
                      <Bar
                        dataKey="total"
                        fill="#6366f1"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            )}

            {permissions.viewProfitChart && (
              <Panel title="Profit / Loss">
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <LineChart data={data.profit_chart}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e0e0e0"
                      />
                      <XAxis dataKey="date" fontSize={12} stroke="#666" />
                      <YAxis fontSize={12} stroke="#666" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          borderColor: "#ccc",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="#22c55e"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="cogs"
                        stroke="#f43f5e"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#6366f1"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            )}
          </div>

          {/* --- 5. Recent Transactions --- */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {permissions.viewRecentSales && (
              <Panel title="Recent Sales">
                <ScrollableList
                  items={data.recent_sales || []}
                  renderItem={(item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {item.invoice_no}
                        </p>
                        <p className="text-gray-500">{item.customer_name}</p>
                      </div>
                      <span className="font-semibold text-emerald-600">
                        ${item.total_amount.toFixed(2)}
                      </span>
                    </div>
                  )}
                />
              </Panel>
            )}

            {permissions.viewRecentPurchases && (
              <Panel title="Recent Purchases">
                <ScrollableList
                  items={data.recent_purchases || []}
                  renderItem={(item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {item.invoice_no}
                        </p>
                        <p className="text-gray-500">{item.supplier_name}</p>
                      </div>
                      <span className="font-semibold text-rose-600">
                        ${item.total_amount.toFixed(2)}
                      </span>
                    </div>
                  )}
                />
              </Panel>
            )}
          </div>
        </div>

        {/* --- Sidebar Column (Lists & Insights) --- */}
        <div className="lg:col-span-1 space-y-6">
          {/* --- 3. Warehouse & Low Stock Panels --- */}
          {permissions.viewWarehousePanel && (
            <Panel title="Warehouse Overview">
              <ScrollableList
                items={data.warehouse_stock || []}
                renderItem={(item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Warehouse size={16} className="text-indigo-500" />
                      <span className="text-gray-700">
                        {item.warehouse_name}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {item.total_stock}
                    </span>
                  </div>
                )}
              />
            </Panel>
          )}

          {permissions.viewLowStockPanel && (
            <Panel title="Low Stock Alerts">
              <ScrollableList
                items={data.low_stock || []}
                renderItem={(item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-gray-700">{item.name}</span>
                    <span className="font-bold text-red-500">
                      {item.current_stock}
                      <span className="text-xs text-gray-400">
                        {" "}
                        / {item.min_level}
                      </span>
                    </span>
                  </div>
                )}
              />
            </Panel>
          )}

          {/* --- 4. Category & Brand Insights --- */}
          {permissions.viewInsightsPanel && (
            <Panel title="Insights">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-gray-600">
                    Top Categories
                  </h4>
                  <ul className="space-y-2">
                    {(data.top_categories || []).map((cat) => (
                      <li key={cat.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">{cat.name}</span>
                        <span className="font-medium text-gray-900">
                          {cat.products_count}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-gray-600">
                    Top Brands
                  </h4>
                  <ul className="space-y-2">
                    {(data.top_brands || []).map((brand) => (
                      <li
                        key={brand.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-700">{brand.name}</span>
                        <span className="font-medium text-gray-900">
                          {brand.products_count}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
