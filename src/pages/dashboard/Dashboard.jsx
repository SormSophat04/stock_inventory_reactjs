import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDashboardData,
  selectDashboardData,
  selectDashboardStatus,
  selectDashboardError,
} from "../../redux/slices/dashboardSlice";
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
import LoadingSpinner from "../../components/common/LoadingSpinner";

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
  const dispatch = useDispatch();
  const dashboardData = useSelector(selectDashboardData);
  const status = useSelector(selectDashboardStatus);
  const error = useSelector(selectDashboardError);

  // Fetch dashboard data on mount
  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  // Log status for debugging
  useEffect(() => {
    if (status === 'failed') {
      console.error('Dashboard API Error:', error);
      toast.error(`Failed to load dashboard data: ${error || 'Unknown error'}`);
    }
    if (status === 'succeeded' && dashboardData) {

      toast.success('Dashboard data loaded!');
    }
  }, [status, error, dashboardData]);

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

  // Use API data only (no mock fallback)
  const data = dashboardData;

  // --- Notification Effect ---
  useEffect(() => {
    // Example: Show a toast if low stock items are detected on data load
    if (data?.stats?.low_stock_count > 0) {
      toast.error(
        `${data.stats.low_stock_count} item(s) are running low on stock!`,
        { icon: <AlertTriangle className="text-red-500" /> }
      );
    }
  }, [data?.stats?.low_stock_count]);

  // Show loading state AFTER all hooks or if status is idle (initial load)
  if (status === 'loading' || status === 'idle') {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <LoadingSpinner message="Loading dashboard..." />
      </div>
    );
  }

  // Show error state AFTER all hooks
  if (status === 'failed') {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Failed to Load Dashboard</h2>
          <p className="text-slate-600 mb-4">{error || 'Unknown error occurred'}</p>
          <button
            onClick={() => dispatch(fetchDashboardData())}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Ensure data is not null to prevent crashes
  const safeData = data || {};

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
            value={safeData.stats?.total_products || 0}
            icon={<Package size={24} />}
          />
        )}
        {permissions.viewTotalStockValue && (
          <StatCard
            title="Total Stock Value"
            value={safeData.stats?.total_stock_value || 0}
            icon={<DollarSign size={24} />}
            isCurrency={true}
          />
        )}
        {permissions.viewTodaySales && (
          <StatCard
            title="Today's Sales"
            value={safeData.stats?.today_sales || 0}
            icon={<ShoppingCart size={24} />}
            isCurrency={true}
          />
        )}
        {permissions.viewLowStockCount && (
          <StatCard
            title="Low Stock Items"
            value={safeData.stats?.low_stock_count || 0}
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
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={safeData.sales_chart || []}>
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
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={safeData.profit_chart || []}>
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
                  items={safeData.recent_sales || []}
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
                  items={safeData.recent_purchases || []}
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
                items={safeData.warehouse_stock || []}
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
                items={safeData.low_stock || []}
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
                    {(safeData.top_categories || []).map((cat) => (
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
                    {(safeData.top_brands || []).map((brand) => (
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
