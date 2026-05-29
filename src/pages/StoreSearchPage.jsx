import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Store, ArrowRight, ShoppingBag } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://customerverse.onrender.com';

export default function StoreSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch all/matching stores
  const fetchStores = async (query = '') => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/search-stores?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setStores(data);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores('');
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStores(searchQuery);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center pb-24">
      {/* Premium Hero Section */}
      <div className="w-full max-w-7xl px-6 pt-24 pb-16 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-700 text-xs font-semibold uppercase tracking-widest mb-6">
          <ShoppingBag size={14} /> Multi-Vendor Local Marketplace
        </div>
        <h1 className="font-display font-black text-4xl md:text-6xl tracking-tight text-slate-900 max-w-3xl leading-[1.1] mb-6">
          Everything You Need, From <span className="bg-gradient-to-r from-cyan-600 to-indigo-600 bg-clip-text text-transparent">Local Vendors</span>
        </h1>
        <p className="text-slate-600 text-lg md:text-xl font-medium max-w-2xl mb-10 leading-relaxed">
          Discover exquisite fashion, state-of-the-art electronics, and premium fresh groceries from trusted neighborhood stores.
        </p>

        {/* Dynamic Search Bar */}
        <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl relative mb-12">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for products, brands, or stores..."
            className="w-full pl-14 pr-32 py-5 bg-white border border-slate-200 shadow-xl shadow-slate-100/50 rounded-2xl text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          />
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={22} />
          </span>
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-cyan-500/20 active:scale-[0.98] transition-all"
          >
            Search
          </button>
        </form>
      </div>

      {/* Stores List Section */}
      <div className="w-full max-w-7xl px-6">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-5 mb-8">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Store className="text-cyan-600" size={20} />
            Featured Stores ({stores.length})
          </h2>
          <button
            onClick={() => { setSearchQuery(''); fetchStores(''); }}
            className="text-xs font-semibold tracking-wider text-slate-500 hover:text-cyan-600 uppercase"
          >
            Reset
          </button>
        </div>

        {loading ? (
          <div className="w-full py-24 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-cyan-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-500 text-sm font-medium tracking-wide">Searching local directories...</p>
          </div>
        ) : stores.length === 0 ? (
          <div className="w-full py-16 px-8 rounded-3xl border border-dashed border-slate-200 text-center flex flex-col items-center">
            <Store className="text-slate-300 mb-4" size={48} />
            <h3 className="text-slate-800 font-bold text-lg mb-1">No Stores Found</h3>
            <p className="text-slate-500 text-sm max-w-xs">We couldn't find any stores matching "{searchQuery}". Try searching for something else.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <div
                key={store.store_id}
                onClick={() => navigate(`/store/${store.store_id}`)}
                className="group relative bg-white border border-slate-100 hover:border-cyan-200 shadow-sm hover:shadow-xl hover:-translate-y-1 rounded-2xl p-6 cursor-pointer transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600 flex items-center justify-center mb-5 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300">
                    <Store size={22} />
                  </div>
                  <h3 className="font-display font-bold text-xl text-slate-900 group-hover:text-cyan-600 transition-colors mb-2">
                    {store.store_name}
                  </h3>
                </div>
                <div className="flex items-center justify-between text-slate-400 group-hover:text-cyan-600 text-sm font-bold pt-4 border-t border-slate-100 transition-colors mt-6">
                  <span>Enter Storefront</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
