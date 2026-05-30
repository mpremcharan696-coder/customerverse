import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, Minus, CreditCard, ShieldCheck } from 'lucide-react';
import { useCart } from '../CartContext';

export default function CartSidebar({ isOpen, onClose }) {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay Script dynamically on mount
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCheckout = async () => {
    if (!razorpayLoaded) {
      alert('Razorpay Payment Gateway is loading, please try again in a second.');
      return;
    }

    if (cartItems.length === 0) return;

    setCheckoutLoading(true);

    const totalAmount = getCartTotal();

    const options = {
      key: 'rzp_test_SvDvHMGKzW6hw7', // Active Razorpay Sandbox Test Key ID
      amount: Math.round(totalAmount * 100), // Razorpay expects amount in paise/cents
      currency: 'INR',
      name: 'CustomerVerse E-Commerce',
      description: 'Cart Purchase Transaction',
      handler: async function (response) {
        // Success checkout webhook API transaction
        try {
          const storeId = cartItems[0].store_id; // Products contain the store_id mapping
          
          const payload = {
            storeId: storeId,
            buyerName: 'Guest Buyer',
            method: 'Razorpay',
            cart: cartItems.map(item => ({
              productId: item.id,
              quantity: item.quantity
            }))
          };

          const checkRes = await fetch('/api/ecom/checkout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          if (checkRes.ok) {
            clearCart();
            setOrderConfirmed(true);
          } else {
            alert('Checkout payment registration with server failed.');
          }
        } catch (err) {
          console.error('Error completing transaction registration:', err);
          alert('Network transaction connection failed.');
        } finally {
          setCheckoutLoading(false);
        }
      },
      prefill: {
        name: 'Guest Buyer',
        email: 'buyer@customerverse.com',
        contact: '9999999999'
      },
      theme: {
        color: '#06b6d4'
      },
      modal: {
        ondismiss: function () {
          setCheckoutLoading(false);
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <>
      {/* Sliding Sidebar Panel container */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-slate-100 shadow-2xl flex flex-col justify-between transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Panel Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
            <h2 className="font-display font-bold text-lg text-slate-900 tracking-tight">Your Cart</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Panel Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <span className="w-16 h-16 bg-slate-50 border border-slate-100 text-slate-300 rounded-2xl flex items-center justify-center mb-4">
                <Trash2 size={24} />
              </span>
              <h3 className="font-bold text-slate-800 text-base mb-1">Your bag is empty</h3>
              <p className="text-slate-500 text-xs max-w-xs leading-relaxed">
                Explore vendor directories and products to add active items into your cart checklist.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cartItems.map((item) => {
                // Parsing image fallback logic
                let parsedPhoto = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60';
                if (item.image_url) {
                  parsedPhoto = item.image_url;
                } else if (Array.isArray(item.photos) && item.photos.length > 0) {
                  parsedPhoto = item.photos[0];
                } else if (Array.isArray(item.images) && item.images.length > 0) {
                  parsedPhoto = item.images[0];
                }

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 border border-slate-100 rounded-2xl bg-white hover:border-slate-200 transition-all group"
                  >
                    <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100/50">
                      <img
                        src={parsedPhoto}
                        alt={item.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-cyan-600 transition-colors">
                          {item.name}
                        </h4>
                        <p className="text-slate-500 text-xs font-black tracking-tight mt-0.5">
                          ₹{Number(item.price).toLocaleString('en-IN')}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Adjuster controls */}
                        <div className="flex items-center border border-slate-200 rounded-lg px-1.5 py-0.5 bg-slate-50">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:text-cyan-600 transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-2.5 font-display font-semibold text-xs text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:text-cyan-600 transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Panel Footer */}
        {cartItems.length > 0 && (
          <div className="px-6 py-6 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-4">
            <div className="flex justify-between items-baseline">
              <span className="text-slate-500 font-semibold text-xs tracking-wider uppercase">Grand Total</span>
              <span className="font-display font-black text-2xl text-cyan-600">
                ₹{getCartTotal().toLocaleString('en-IN')}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className={`w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm tracking-wider uppercase rounded-2xl shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 transition-all active:scale-[0.99] ${
                checkoutLoading ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {checkoutLoading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying Order…</>
              ) : (
                <><CreditCard size={16} /> Proceed to Checkout</>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Success Modal screen */}
      {orderConfirmed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative border border-slate-100 flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-5 border border-emerald-100">
              <ShieldCheck size={32} />
            </div>
            <h3 className="font-display font-black text-xl text-slate-900 mb-2">Order Confirmed!</h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-6 max-w-xs">
              Thank you for supporting local businesses. Your transaction was processed securely.
            </p>
            <button
              onClick={() => {
                setOrderConfirmed(false);
                onClose();
              }}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs tracking-wider uppercase rounded-xl transition-all shadow-lg active:scale-[0.98]"
            >
              Back to Catalog
            </button>
          </div>
        </div>
      )}
    </>
  );
}
