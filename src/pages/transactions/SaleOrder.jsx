import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiShoppingBag,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiUser,
  FiMapPin,
  FiCreditCard,
  FiCheckCircle,
  FiX,
  FiPackage,
  FiGrid,
  FiList
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { createSale, clearSaleError, selectSaleError, selectSaleStatus } from "../../redux/slices/saleSlice";
import { fetchCustomers, selectAllCustomers, selectCustomerStatus } from "../../redux/slices/customerSlice";
import { fetchWarehouses, selectAllWarehouses, selectWarehouseStatus } from "../../redux/slices/warehouseSlice";
import { fetchProducts, selectAllProducts, selectProductStatus } from "../../redux/slices/productSlice";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// --- Components ---

const Notification = ({ notification, onClear }) => {
  if (!notification) return null;
  const { type, message } = notification;
  const isSuccess = type === "success";
  const bgColor = isSuccess ? "bg-emerald-500" : "bg-red-500";
  const Icon = isSuccess ? FiCheckCircle : FiX;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: "-50%" }}
      animate={{ opacity: 1, y: 20, x: "-50%" }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-0 left-1/2 z-[60] flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl text-white ${bgColor} backdrop-blur-md bg-opacity-95`}
    >
      <Icon className="text-xl" />
      <span className="font-medium text-sm">{message}</span>
      <button onClick={onClear} className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors">
        <FiX />
      </button>
    </motion.div>
  );
};

// --- Main POS Page ---

export default function SaleOrderPOS() {
  const dispatch = useDispatch();

  // Redux Data
  const customers = useSelector(selectAllCustomers);
  const warehouses = useSelector(selectAllWarehouses);
  const products = useSelector(selectAllProducts);
  const error = useSelector(selectSaleError);
  const productStatus = useSelector(selectProductStatus);
  const customerStatus = useSelector(selectCustomerStatus);
  const warehouseStatus = useSelector(selectWarehouseStatus);
  const saleStatus = useSelector(selectSaleStatus);

  // Constants
  const DEFAULT_WAREHOUSE_ID = 1; // Assuming 1 is the default 'Main Warehouse'
  // Local State
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list' for products
  const [customerId, setCustomerId] = useState("");
  const [warehouseId, setWarehouseId] = useState(DEFAULT_WAREHOUSE_ID);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [notification, setNotification] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Effects ---
  useEffect(() => {
    dispatch(fetchCustomers());
    dispatch(fetchWarehouses());
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setNotification({ type: 'error', message: error });
      dispatch(clearSaleError());
    }
  }, [error, dispatch]);

  useEffect(() => { // Auto-clear notification
    if (notification) {
       const timer = setTimeout(() => setNotification(null), 3000);
       return () => clearTimeout(timer);
    }
  }, [notification]);

  // --- Logic ---

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product_id === product.product_id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.product_id === product.product_id 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.product_id,
        name: product.name,
        price: parseFloat(product.sell_price),
        quantity: 1,
        subtotal: parseFloat(product.sell_price),
        image: product.image
      }]);
    }
  };

  const updateQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.product_id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty, subtotal: newQty * item.price };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const calculateTotal = () => cart.reduce((sum, item) => sum + item.subtotal, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setNotification({ type: 'error', message: 'Cart is empty!' });
      return;
    }
    if (!warehouseId) {
        setNotification({ type: 'error', message: 'Please select a warehouse.' });
        return;
    }

    setIsProcessing(true);
    const saleData = {
      customer_id: customerId ? parseInt(customerId) : null, // Optional customer
      warehouse_id: parseInt(warehouseId),
      total_amount: calculateTotal(),
      payment_method: paymentMethod,
      sale_date: new Date().toISOString().split("T")[0],
      items: cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        sell_price: item.price
      }))
    };

    try {
      await dispatch(createSale(saleData)).unwrap();
      setCart([]);
      setCustomerId("");
      setPaymentMethod("Cash");
      setNotification({ type: 'success', message: 'Sale completed successfully!' });
    } catch {
      // Error handled by redux effect
    } finally {
      setIsProcessing(false);
    }
  };

  // derived state
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const isLoading = productStatus === 'loading' || customerStatus === 'loading' || warehouseStatus === 'loading' || saleStatus === 'loading';

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-100 overflow-hidden font-sans text-slate-800">
      <AnimatePresence>
        <Notification notification={notification} onClear={() => setNotification(null)} />
      </AnimatePresence>

      {/* --- LEFT SIDE: PRODUCT CATALOG --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-slate-200 bg-slate-50">
        
        {/* Header Bar */}
        <div className="bg-white p-4 shadow-sm z-10 sticky top-0">
          <div className="flex justify-between items-center mb-4">
             <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
               <span className="bg-indigo-600 text-white p-2 rounded-lg"><FiShoppingBag /></span>
               POS Terminal
             </h1>
             <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <FiGrid size={20} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <FiList size={20} />
                </button>
             </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            <input 
              type="text" 
              placeholder="Search products by name or code..."
              className="w-full pl-12 pr-4 py-3 bg-slate-100 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700 placeholder:text-slate-400"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Product Grid/List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
           {isLoading && products.length === 0 ? (
             <div className="h-full flex items-center justify-center">
                <LoadingSpinner message="Loading Products..." />
             </div>
           ) : filteredProducts.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                <FiPackage size={64} strokeWidth={1} />
                <p className="mt-4 text-lg font-medium">No products found</p>
             </div>
           ) : viewMode === 'grid' ? (
             <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map(product => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={product.product_id}
                    onClick={() => addToCart(product)}
                    className="group bg-white rounded-2xl p-4 shadow-sm hover:shadow-md border border-slate-100 cursor-pointer transition-all hover:-translate-y-1 active:scale-[0.98]"
                  >
                     <div className="aspect-square bg-slate-50 rounded-xl mb-3 flex items-center justify-center text-slate-300 relative overflow-hidden group-hover:bg-indigo-50 transition-colors">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
                        ) : (
                          <FiPackage size={40} className="group-hover:text-indigo-400 transition-colors" />
                        )}
                        <div className="absolute top-2 right-2 bg-slate-900/10 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-slate-700">
                           {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of Stock'}
                        </div>
                     </div>
                     <h3 className="font-semibold text-slate-800 line-clamp-2 min-h-[3rem] mb-1 leading-snug">
                       {product.name}
                     </h3>
                     <div className="flex justify-between items-center mt-2">
                        <span className="text-indigo-600 font-bold text-lg">${parseFloat(product.sell_price).toFixed(2)}</span>
                        <div className="bg-indigo-100 text-indigo-600 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-sm">
                           <FiPlus />
                        </div>
                     </div>
                  </motion.div>
                ))}
             </div>
           ) : (
             <div className="space-y-2">
               {filteredProducts.map(product => (
                  <motion.div 
                    layout
                    key={product.product_id}
                    onClick={() => addToCart(product)}
                    className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all active:scale-[0.99] group"
                  >
                     <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                        <FiPackage size={24} />
                     </div>
                     <div className="flex-1">
                        <h3 className="font-semibold text-slate-800">{product.name}</h3>
                        <p className="text-xs text-slate-500">Code: {product.code || 'N/A'} • Stock: {product.quantity}</p>
                     </div>
                     <div className="text-right">
                       <p className="text-indigo-600 font-bold">${parseFloat(product.sell_price).toFixed(2)}</p>
                     </div>
                     <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <FiPlus />
                     </div>
                  </motion.div>
               ))}
             </div>
           )}
        </div>
      </div>

      {/* --- RIGHT SIDE: CART --- */}
      <div className="w-full lg:w-[450px] bg-white h-full flex flex-col shadow-2xl z-20">
         {/* Cart Header */}
         <div className="p-6 border-b border-slate-100 bg-white">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Current Order</h2>
            
            {/* Customer & Warehouse Select */}
            <div className="space-y-3">
               <div className="relative">
                  <FiUser className="absolute left-3 top-3 text-slate-400" />
                  <select 
                    className="w-full pl-9 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={customerId}
                    onChange={e => setCustomerId(e.target.value)}
                  >
                     <option value="">Walk-in Customer</option>
                     {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.name}</option>)}
                  </select>
               </div>
               <div className="relative">
                  <FiMapPin className="absolute left-3 top-3 text-slate-400" />
                  <select 
                    className="w-full pl-9 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={warehouseId}
                    onChange={e => setWarehouseId(e.target.value)}
                  >
                     <option value="" disabled>Select Warehouse</option>
                     {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.name}</option>)}
                  </select>
               </div>
            </div>
         </div>

         {/* Cart Items */}
         <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/50">
            {cart.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                     <FiShoppingBag size={32} />
                  </div>
                  <p className="text-center">Your cart is empty.<br/>Select products to start selling.</p>
               </div>
            ) : (
               <div className="space-y-3">
                  <AnimatePresence>
                  {cart.map(item => (
                     <motion.div 
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        key={item.product_id}
                        className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3 relative group"
                     >
                        <button 
                           onClick={() => removeFromCart(item.product_id)}
                           className="absolute -right-2 -top-2 bg-red-500 text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                        >
                           <FiX size={12} />
                        </button>

                        <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                           <FiPackage />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                           <h4 className="font-semibold text-slate-800 text-sm truncate">{item.name}</h4>
                           <p className="text-xs text-slate-500">${item.price.toFixed(2)} / unit</p>
                        </div>

                        {/* Qty Controls */}
                        <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1">
                           <button 
                              onClick={() => updateQuantity(item.product_id, -1)}
                              className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 hover:text-indigo-600 hover:shadow-md transition-all active:scale-90"
                           >
                              <FiMinus size={14} />
                           </button>
                           <span className="text-sm font-bold text-slate-800 w-4 text-center">{item.quantity}</span>
                           <button 
                              onClick={() => updateQuantity(item.product_id, 1)}
                              className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 hover:text-indigo-600 hover:shadow-md transition-all active:scale-90"
                           >
                              <FiPlus size={14} />
                           </button>
                        </div>

                        <div className="font-bold text-slate-800 text-right w-16">
                           ${item.subtotal.toFixed(2)}
                        </div>
                     </motion.div>
                  ))}
                  </AnimatePresence>
               </div>
            )}
         </div>

         {/* Cart Footer */}
         <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)] z-20">
            {/* Payment Method */}
            <div className="mb-4">
               <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Payment Method</label>
               <div className="grid grid-cols-3 gap-2">
                  {['Cash', 'Card', 'Transfer'].map(method => (
                     <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`py-2 px-1 rounded-lg text-sm font-medium transition-all ${
                           paymentMethod === method 
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                     >
                        {method}
                     </button>
                  ))}
               </div>
            </div>

            <div className="flex justify-between items-center mb-6">
               <span className="text-slate-500 font-medium">Total Amount</span>
               <span className="text-3xl font-bold text-indigo-700">${calculateTotal().toFixed(2)}</span>
            </div>

            <button 
               onClick={handleCheckout}
               disabled={isProcessing || cart.length === 0}
               className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-2xl shadow-xl shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
               {isProcessing ? (
                  <>Processing...</>
               ) : (
                  <>
                    <FiCheckCircle size={24} /> 
                    Confirm Payment
                  </>
               )}
            </button>
         </div>
      </div>
    </div>
  );
}
