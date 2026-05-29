import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, PackageOpen, ShoppingCart, Tag, Check, AlertCircle } from 'lucide-react';
import { useCart } from '../CartContext';
import CartSidebar from '../components/CartSidebar';

export default function StorefrontPage() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { cartItems, addToCart } = useCart();

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [addedItems, setAddedItems] = useState({});

  useEffect(() => {
    const fetchStoreData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/stores/${storeId}/products`);
        if (!response.ok) {
          throw new Error('Store storefront products failed to load.');
        }
        const data = await response.json();
        setStore(data.store);
        setProducts(data.products);
      } catch (error) {
        console.error('Error fetching storefront details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [storeId]);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setAddedItems(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  const totalCartQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-cyan-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 text-sm font-medium tracking-wide">Loading storefront catalog...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="w-full min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md text-center shadow-lg">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={44} />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Store Not Found</h2>
          <p className="text-slate-500 text-sm mb-6">The store you are looking for does not exist or has been removed.</p>
          <button
            onClick={() => navigate('/search-stores')}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            Back to Directories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center pb-24">
      {/* Dynamic Sliding Sidebar Panel */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Premium Navbar & Cart Status */}
      <div className="w-full max-w-7xl px-6 py-6 flex items-center justify-between border-b border-slate-200/60 sticky top-0 bg-slate-50/80 backdrop-blur-md z-30">
        <button
          onClick={() => navigate('/search-stores')}
          className="flex items-center gap-2 text-slate-500 hover:text-cyan-600 font-semibold text-xs tracking-wider uppercase transition-colors"
        >
          <ArrowLeft size={16} /> Back to Directory
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex items-center gap-2 bg-white px-4 py-2 border border-slate-200/80 rounded-xl shadow-sm hover:border-cyan-500 hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
        >
          <ShoppingCart size={16} className="text-slate-700" />
          <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Cart</span>
          <span className="bg-cyan-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
            {totalCartQuantity}
          </span>
        </button>
      </div>

      {/* Store Header Section */}
      <div className="w-full max-w-7xl px-6 pt-12 pb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="p-2 bg-cyan-50 border border-cyan-100 text-cyan-600 rounded-xl">
              <Store size={22} />
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Verified Seller</span>
          </div>
          <h1 className="font-display font-black text-4xl md:text-5xl tracking-tight text-slate-900 leading-none">
            {store.store_name}
          </h1>
        </div>

        <div className="bg-white/80 border border-slate-100 rounded-2xl px-6 py-4 shadow-sm self-start md:self-auto">
          <p className="text-slate-400 text-[10px] font-semibold tracking-wider uppercase mb-1">Status</p>
          <p className="text-emerald-600 text-sm font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Storefront Active
          </p>
        </div>
      </div>

      {/* Products Directory Grid */}
      <div className="w-full max-w-7xl px-6">
        <div className="border-b border-slate-200/60 pb-5 mb-8">
          <h2 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Catalog Collections ({products.length})
          </h2>
        </div>

        {products.length === 0 ? (
          <div className="w-full py-20 bg-white border border-slate-100 rounded-3xl shadow-sm text-center flex flex-col items-center justify-center">
            <PackageOpen className="text-slate-300 mb-4 animate-bounce" size={48} />
            <h3 className="text-slate-800 font-bold text-lg mb-1">Catalog is Empty</h3>
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed">This vendor hasn't cataloged any items for sale yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              // Resilience parsing photo columns (photos, images, image_url)
              let parsedPhoto = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60';
              
              if (product.image_url) {
                parsedPhoto = product.image_url;
              } else if (Array.isArray(product.photos) && product.photos.length > 0) {
                parsedPhoto = product.photos[0];
              } else if (Array.isArray(product.images) && product.images.length > 0) {
                parsedPhoto = product.images[0];
              } else if (typeof product.photos === 'string') {
                try {
                  const arr = JSON.parse(product.photos);
                  if (Array.isArray(arr) && arr.length > 0) parsedPhoto = arr[0];
                } catch(e) {}
              }

              const isOutOfStock = product.current_stock_level <= 0;

              return (
                <div
                  key={product.id}
                  className="group bg-white border border-slate-100/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-100">
                    <img
                      src={parsedPhoto}
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    {isOutOfStock ? (
                      <span className="absolute top-4 left-4 bg-slate-900/90 text-white font-bold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full">
                        Out of stock
                      </span>
                    ) : (
                      <span className="absolute top-4 left-4 bg-cyan-600/90 text-white font-bold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Tag size={10} /> Active Stock
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display font-bold text-base text-slate-900 tracking-tight leading-snug line-clamp-1 group-hover:text-cyan-600 transition-colors mb-1">
                        {product.name}
                      </h3>
                      <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-4">
                        {product.description || 'No description cataloged for this product.'}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-baseline justify-between mb-4">
                        <span className="text-cyan-600 font-display font-black text-lg">
                          ₹{Number(product.price).toLocaleString('en-IN')}
                        </span>
                        <span className="text-slate-400 text-[10px] font-bold">
                          Stock: {product.current_stock_level}
                        </span>
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={isOutOfStock}
                        className={`w-full py-3 font-semibold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 transition-all ${
                          isOutOfStock
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : addedItems[product.id]
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                              : 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg active:scale-[0.98]'
                        }`}
                      >
                        {isOutOfStock ? (
                          'Sold Out'
                        ) : addedItems[product.id] ? (
                          <><Check size={14} /> Added to Cart</>
                        ) : (
                          <><ShoppingCart size={14} /> Add to Cart</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
