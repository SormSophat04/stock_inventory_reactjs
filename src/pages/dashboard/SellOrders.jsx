import React, { useState, useEffect, useMemo } from "react";
import { 
  FiSearch,
  FiFilter,
  FiSettings,
  FiGrid,
  FiShoppingCart,
  FiPlus,
  FiMinus,
  FiRefreshCw,
  FiList,
  FiClock,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiTrash2,
  FiUser,
  FiMapPin,
  FiCreditCard,
  FiChevronRight
} from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";

// Redux
import { fetchSales, selectAllSales } from "../../redux/slices/saleSlice";
import { fetchReturns, createReturn, selectAllReturns } from "../../redux/slices/returnSlice";
import { fetchProducts, selectAllProducts } from "../../redux/slices/productSlice";
import { fetchCategories, selectAllCategories } from "../../redux/slices/categorySlice";
import { createSale } from "../../redux/slices/saleSlice";
import { fetchCustomers, selectAllCustomers } from "../../redux/slices/customerSlice";
import { fetchWarehouses, selectAllWarehouses } from "../../redux/slices/warehouseSlice";

// Components
import { ProcessReturnModal } from "../transactions/components/ProcessReturnModal";
import { CheckoutModal } from "../transactions/components/CheckoutModal";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// --- HELPERS ---

const getProductImage = (product) => {
  return product.image_path 
    ? `http://localhost:8000/storage/${product.image_path}`
    : `https://placehold.co/300x200/F8FAFC/CBD5E1?text=${encodeURIComponent(product.name || 'Product')}`;
};

// --- COMPONENTS ---

const Notification = ({ notification, onClear }) => {
  if (!notification) return null;
  const { type, message } = notification;
  const isSuccess = type === "success";
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, x: "-50%" }}
        animate={{ opacity: 1, y: 20, x: "-50%" }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed top-0 left-1/2 z-[60] flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl text-white ${isSuccess ? "bg-emerald-500" : "bg-red-500"} backdrop-blur-md bg-opacity-95`}
      >
        {isSuccess ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />}
        <span className="font-medium text-sm">{message}</span>
        <button onClick={onClear} className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors">
          <FiX size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

const ProductCard = ({ product, onAddToCart }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -4 }}
    onClick={() => onAddToCart(product)}
    className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 cursor-pointer flex flex-col h-full transition-all duration-300"
  >
    {/* Image Container */}
    <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
      <img
        src={getProductImage(product)}
        alt={product.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors duration-300" />

      {/* Price Badge */}
      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-sm text-slate-900 font-bold text-sm ring-1 ring-slate-100">
        ${parseFloat(product.sell_price || product.price || 0).toFixed(2)}
      </div>

      {/* Add Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddToCart(product);
        }}
        className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-slate-700 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-indigo-600 hover:text-white"
      >
        <FiPlus size={20} strokeWidth={2.5} />
      </button>
    </div>

    {/* Content */}
    <div className="p-4 flex flex-col flex-1">
      <div className="mb-auto">
        <h3 className="text-slate-800 font-bold text-sm leading-tight mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2">
          {product.description || 'No description available'}
        </p>
      </div>
      
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
         <span className="text-slate-400">Stock: <span className="text-slate-600">{product.quantity}</span></span>
         <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
           {product.unit?.name || product.unit || 'Unit'}
         </span>
      </div>
    </div>
  </motion.div>
);

const OrderItem = ({ item, onUpdateQuantity }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm"
  >
    <img
      src={getProductImage(item)}
      alt={item.name}
      className="w-16 h-16 rounded-xl object-cover bg-slate-50 border border-slate-100"
    />
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-bold text-slate-800 truncate">{item.name}</h4>
      <p className="text-xs text-slate-500 mb-1">
        ${parseFloat(item.sell_price).toFixed(2)} / unit
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          disabled={item.quantity <= 0}
        >
          <FiMinus size={14} />
        </button>
        <span className="text-sm font-bold text-slate-900 w-5 text-center">
          {item.quantity}
        </span>
        <button
          onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
        >
          <FiPlus size={14} />
        </button>
      </div>
    </div>
    <div className="text-right">
      <p className="text-base font-bold text-indigo-600">
        ${(item.sell_price * item.quantity).toFixed(2)}
      </p>
    </div>
  </motion.div>
);

// --- MAIN PAGE ---

export default function SellOrders() {
  const dispatch = useDispatch();
  // const navigate = useNavigate(); // Unused

  // Redux Data
  const sales = useSelector(selectAllSales);
  const returns = useSelector(selectAllReturns);
  // const returnStatus = useSelector(selectReturnStatus); // Unused
  const products = useSelector(selectAllProducts);
  const categories = useSelector(selectAllCategories);
  const customers = useSelector(selectAllCustomers);
  const warehouses = useSelector(selectAllWarehouses);

  // UI State
  const [activeTab, setActiveTab] = useState("shop"); // "shop", "returns"
  const [selectedCategoryId, setSelectedCategoryId] = useState('ALL');
  
  // Checkout State
  const [cart, setCart] = useState([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Return Modal State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnItems, setReturnItems] = useState([]);
  const [selectedSaleForReturn, setSelectedSaleForReturn] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [refundType, setRefundType] = useState("Cash");
  const [notification, setNotification] = useState(null);

  // Fetch Data
  useEffect(() => {
    dispatch(fetchSales());
    dispatch(fetchReturns());
    dispatch(fetchProducts()); 
    dispatch(fetchCategories());
    dispatch(fetchCustomers());
    dispatch(fetchWarehouses());
  }, [dispatch]);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (selectedCategoryId === 'ALL') return products;
    return products.filter((p) => p.category_id === parseInt(selectedCategoryId) || p.category_id === selectedCategoryId);
  }, [selectedCategoryId, products]);

  // Cart Logic
  const handleAddToCart = (product) => {
    if (product.quantity < 1) {
      setNotification({ type: "error", message: `Warning: ${product.name} is out of stock!` });
      setTimeout(() => setNotification(null), 3000);
    }
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product_id === product.product_id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    setCart((prevCart) => {
      if (newQuantity <= 0) {
        return prevCart.filter((item) => item.product_id !== productId);
      } else {
        return prevCart.map((item) =>
          item.product_id === productId ? { ...item, quantity: newQuantity } : item
        );
      }
    });
  };

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => total + Number(item.sell_price || item.price || 0) * item.quantity, 0);
  }, [cart]);

  const total = subtotal;

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    const saleData = {
      customer_id: selectedCustomer ? parseInt(selectedCustomer) : null,
      warehouse_id: parseInt(selectedWarehouse),
      total_amount: total,
      payment_method: paymentMethod,
      sale_date: new Date().toISOString().split("T")[0],
      items: cart.map(item => ({
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity),
        sell_price: parseFloat(item.sell_price || item.price || 0)
      }))
    };

    try {
      await dispatch(createSale(saleData)).unwrap();
      setCart([]);
      setIsCheckoutModalOpen(false);
      setSelectedCustomer("");
      setSelectedWarehouse("");
      setPaymentMethod("Cash");
      setNotification({ type: "success", message: "Sale completed successfully!" });
      setTimeout(() => setNotification(null), 3000);
    } catch {
      setNotification({ type: "error", message: "Failed to complete sale" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessReturn = async () => {
    if (!selectedSaleForReturn) {
      setNotification({ type: "error", message: "Please select a sale to process return" });
      return;
    }
    if (returnItems.length === 0) {
      setNotification({ type: "error", message: "Please add at least one item to return" });
      return;
    }

    const returnData = {
      sale_ref: selectedSaleForReturn.invoice_no,
      customer_id: selectedSaleForReturn.customer_id,
      warehouse_id: selectedSaleForReturn.warehouse_id,
      return_date: new Date().toISOString().split('T')[0],
      status: "Confirmed",
      reason: returnReason || "Customer return",
      refund_type: refundType,
      items: returnItems.map(item => ({
        product_id: item.product_id,
        quantity: item.qty,
        price: item.price
      }))
    };

    try {
      await dispatch(createReturn(returnData)).unwrap();
      setIsReturnModalOpen(false);
      setSelectedSaleForReturn(null);
      setReturnItems([]);
      setReturnReason("");
      setRefundType("Cash");
      setNotification({ type: "success", message: "Return processed successfully!" });
      setTimeout(() => setNotification(null), 3000);
    } catch {
      setNotification({ type: "error", message: "Failed to process return" });
    }
  };

  // Loading State
  const salesStatus = useSelector(state => state.sales?.status);
  const productsStatus = useSelector(state => state.products?.status);
  const isLoading = salesStatus === 'loading' || productsStatus === 'loading';

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-screen bg-slate-50">
            <LoadingSpinner message="Loading Point of Sale..." />
        </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      <Notification notification={notification} onClear={() => setNotification(null)} />
      
      {/* LEFT: Shop / Products */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="flex-none bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between z-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <span className="bg-indigo-600 text-white p-2 rounded-lg"><FiShoppingCart /></span>
              {activeTab === 'shop' ? 'Point of Sale' : 'Return Orders'}
            </h1>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
             <button 
               onClick={() => setActiveTab('shop')}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                 activeTab === 'shop' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
               }`}
             >
               <FiShoppingCart /> Shop
             </button>
             <button 
               onClick={() => setActiveTab('returns')}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                 activeTab === 'returns' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
               }`}
             >
               <FiRefreshCw /> Returns
             </button>
          </div>
          
          <div className="flex gap-2">
              <button 
                onClick={() => setIsReturnModalOpen(true)}
                className="btn-secondary flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-medium transition-colors"
                title="Process Return"
              >
                  <FiRefreshCw />
                  <span>Quick Return</span>
              </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {activeTab === 'shop' ? (
            <>
              {/* Categories */}
              <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                 <button
                    onClick={() => setSelectedCategoryId('ALL')}
                    className={`flex-none px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm border ${
                      selectedCategoryId === 'ALL'
                        ? "bg-indigo-600 border-indigo-600 text-white ring-2 ring-indigo-200"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    All Items
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.category_id}
                      onClick={() => setSelectedCategoryId(cat.category_id)}
                      className={`flex-none px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm border ${
                        selectedCategoryId === cat.category_id
                          ? "bg-indigo-600 border-indigo-600 text-white ring-2 ring-indigo-200"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {cat.category_name || cat.name}
                    </button>
                  ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 p-1">
                <AnimatePresence>
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.product_id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </AnimatePresence>
                {filteredProducts.length === 0 && (
                   <div className="col-span-full py-20 text-center text-slate-400">
                      <FiSearch className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p className="text-lg font-medium">No products found</p>
                   </div>
                )}
              </div>
            </>
          ) : (
            // Returns View
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Return #</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Refund</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {returns.map((ret) => (
                      <tr key={ret.return_id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-indigo-600">{ret.return_no}</td>
                        <td className="px-6 py-4 text-slate-700">{ret.customer?.name || "Walk-in"}</td>
                        <td className="px-6 py-4 text-slate-500">{new Date(ret.return_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                           <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              ret.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                           }`}>
                             {ret.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900">${parseFloat(ret.total_refund).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          )}
        </div>
      </main>

      {/* RIGHT: Cart Sidebar */}
      <aside className="w-[400px] xl:w-[450px] bg-white border-l border-slate-200 flex flex-col h-full shadow-2xl z-20">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Current Order</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
               Order #{Math.floor(Math.random() * 10000)} • {new Date().toLocaleDateString()}
            </p>
          </div>
          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
            <FiSettings size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
               <FiShoppingCart size={64} strokeWidth={1} />
               <p className="mt-4 font-medium">Cart is empty</p>
            </div>
          ) : (
             <AnimatePresence mode="popLayout">
                {cart.map((item) => (
                  <OrderItem
                    key={item.product_id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                  />
                ))}
             </AnimatePresence>
          )}
        </div>

        {/* Totals Section */}
        <div className="p-6 bg-white border-t border-slate-200 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
            <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm font-medium text-slate-500">
                    <span>Subtotal</span>
                    <span className="text-slate-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-slate-500">
                    <span>Tax (0%)</span>
                    <span className="text-slate-900">$0.00</span>
                </div>
                 <div className="flex justify-between items-end pt-4 border-t border-dashed border-slate-200 mt-4">
                    <span className="text-base font-bold text-slate-700">Total Payable</span>
                    <span className="text-3xl font-black text-indigo-600">${total.toFixed(2)}</span>
                </div>
            </div>

            <button 
                onClick={() => {
                  if (cart.length === 0) {
                     setNotification({ type: 'error', message: 'Cart is empty!' });
                     setTimeout(() => setNotification(null), 3000);
                     return;
                  }
                  setIsCheckoutModalOpen(true);
                }}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg shadow-xl shadow-slate-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3"
            >
                <FiCreditCard />
                Checkout
            </button>
        </div>

         {/* Modals */}
         <CheckoutModal 
             isOpen={isCheckoutModalOpen}
             onClose={() => setIsCheckoutModalOpen(false)}
             totalAmount={total}
             customers={customers}
             warehouses={warehouses}
             selectedCustomer={selectedCustomer}
             setSelectedCustomer={setSelectedCustomer}
             selectedWarehouse={selectedWarehouse}
             setSelectedWarehouse={setSelectedWarehouse}
             paymentMethod={paymentMethod}
             setPaymentMethod={setPaymentMethod}
             onConfirm={handleConfirmPayment}
             isLoading={isProcessing}
         />

         <ProcessReturnModal
            isOpen={isReturnModalOpen}
            onClose={() => setIsReturnModalOpen(false)}
            sales={sales}
            products={products}
            onSubmit={handleProcessReturn}
            returnItems={returnItems}
            setReturnItems={setReturnItems}
            selectedSaleForReturn={selectedSaleForReturn}
            setSelectedSaleForReturn={setSelectedSaleForReturn}
            returnReason={returnReason}
            setReturnReason={setReturnReason}
            refundType={refundType}
            setRefundType={setRefundType}
         />
      </aside>
    </div>
  );
}
