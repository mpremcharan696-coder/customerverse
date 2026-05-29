import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../firebase'
import gsap from 'gsap'
import {
  ShoppingBag, Package, Heart, Star, Bell,
  LogOut, ChevronRight, TrendingUp, Zap, MapPin, Clock
} from 'lucide-react'

/* ── Animated Counter ── */
const Counter = ({ to, suffix = '', duration = 1.5 }) => {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = 0
    const step = to / (duration * 60)
    const id = setInterval(() => {
      start += step
      if (start >= to) { setVal(to); clearInterval(id) }
      else setVal(Math.floor(start))
    }, 1000 / 60)
    return () => clearInterval(id)
  }, [to, duration])
  return <span>{val}{suffix}</span>
}

/* ── Stat Card ── */
const StatCard = ({ icon: Icon, label, value, suffix, color, delay }) => {
  const ref = useRef(null)
  useEffect(() => {
    gsap.fromTo(ref.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay }
    )
  }, [delay])
  return (
    <div ref={ref} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 flex flex-col gap-3 hover:bg-white/10 transition-all">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-1">{label}</p>
        <p className="text-white text-2xl font-black font-display">
          <Counter to={value} suffix={suffix} />
        </p>
      </div>
    </div>
  )
}

/* ── Sample Orders ── */
const orders = [
  { id: '#VV-2901', item: 'Organic Green Tea', vendor: "Nature's Basket", price: '₹340',   status: 'Delivered',  color: 'text-green-400 bg-green-400/10'  },
  { id: '#VV-2876', item: 'Handloom Kurta',    vendor: 'Artisan Threads',  price: '₹1,299', status: 'In Transit', color: 'text-amber-400 bg-amber-400/10' },
  { id: '#VV-2841', item: 'Wireless Earbuds',  vendor: 'TechNest',         price: '₹2,100', status: 'Processing', color: 'text-cyan-400 bg-cyan-400/10'   },
]

/* ═══════════════════════════════ DASHBOARD ═══════════════════════════════ */
export default function DashboardPage() {
  const navigate = useNavigate()
  const pageRef  = useRef(null)
  const heroRef  = useRef(null)
  const orb1Ref  = useRef(null)
  const orb2Ref  = useRef(null)

  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  /* ── Auth guard: redirect to login if not signed in ── */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        setLoading(false)
      } else {
        navigate('/login', { replace: true })
      }
    })
    return unsub
  }, [navigate])

  /* ── GSAP animations (run after user is loaded) ── */
  useEffect(() => {
    if (!user) return

    gsap.fromTo(pageRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: 'power2.out' }
    )
    gsap.fromTo(heroRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.2 }
    )
    gsap.to(orb1Ref.current, { x: 30, y: -20, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    gsap.to(orb2Ref.current, { x: -20, y: 30, duration: 7, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1 })
  }, [user])

  /* ── Sign Out ── */
  const handleLogout = async () => {
    gsap.to(pageRef.current, {
      opacity: 0, y: -20, duration: 0.6, ease: 'power2.inOut',
      onComplete: async () => {
        await signOut(auth)
        navigate('/', { replace: true })
      }
    })
  }

  /* ── Loading screen ── */
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-white/40 text-sm font-display tracking-widest uppercase">Loading…</p>
        </div>
      </div>
    )
  }

  /* ── Avatar ── */
  const avatar = user.photoURL ? (
    <img src={user.photoURL} alt="avatar" referrerPolicy="no-referrer"
      className="w-10 h-10 rounded-full border-2 border-cyan-500 object-cover" />
  ) : (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-black text-base">
      {(user.displayName || user.email || 'U')[0].toUpperCase()}
    </div>
  )

  const firstName = user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'Explorer'

  /* ── Render ── */
  return (
    <div ref={pageRef} className="relative w-full min-h-screen bg-[#0a0a0f] text-white overflow-hidden">

      {/* Ambient orbs */}
      <div ref={orb1Ref} className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div ref={orb2Ref} className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* ── Navbar ── */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
            <Zap size={16} fill="white" className="text-white" />
          </div>
          <span className="font-display font-black text-base tracking-tighter">
            Customer<span className="text-cyan-400">Verse</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-white/40 hover:text-white transition-colors">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full" />
          </button>
          {avatar}
          <button
            onClick={handleLogout}
            id="btn-signout"
            className="flex items-center gap-2 text-white/40 hover:text-red-400 text-xs font-semibold tracking-widest uppercase transition-colors"
          >
            <LogOut size={14} />
            <span className="hidden md:inline">Sign out</span>
          </button>
        </div>
      </nav>

      {/* ── Hero greeting ── */}
      <div ref={heroRef} className="relative z-10 px-6 md:px-12 pt-12 pb-8">
        <p className="text-white/40 text-xs font-semibold tracking-[0.3em] uppercase mb-2 flex items-center gap-2">
          <Clock size={12} />
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 className="text-3xl md:text-5xl font-display font-black tracking-tighter leading-tight">
          Welcome back,{' '}
          <span className="bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text text-transparent">
            {firstName}
          </span>{' '}👋
        </h1>
        <p className="text-white/40 text-sm mt-2">
          {user.email} · Signed in {user.metadata?.lastSignInTime ? `· Last seen ${new Date(user.metadata.lastSignInTime).toLocaleDateString('en-IN')}` : ''}
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="relative z-10 px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-4 pb-10">
        <StatCard icon={ShoppingBag} label="Total Orders"   value={24}   suffix=""    color="bg-cyan-400/10 text-cyan-400"    delay={0.3} />
        <StatCard icon={Package}     label="Items Saved"    value={7}    suffix=""    color="bg-purple-400/10 text-purple-400" delay={0.4} />
        <StatCard icon={Heart}       label="Wishlist"       value={12}   suffix=""    color="bg-pink-400/10 text-pink-400"    delay={0.5} />
        <StatCard icon={Star}        label="Loyalty Points" value={4800} suffix=" pts" color="bg-amber-400/10 text-amber-400"  delay={0.6} />
      </div>

      {/* ── Content grid ── */}
      <div className="relative z-10 px-6 md:px-12 pb-16 grid md:grid-cols-3 gap-6">

        {/* Recent Orders */}
        <div className="md:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-base tracking-tight">Recent Orders</h2>
            <button className="text-cyan-400 text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {orders.map((o, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/3 hover:bg-white/8 transition-all group">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40 group-hover:text-cyan-400 transition-colors flex-shrink-0">
                  <Package size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{o.item}</p>
                  <p className="text-white/40 text-xs flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> {o.vendor} · {o.id}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white text-sm font-bold">{o.price}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${o.color}`}>
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-4">
          <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/20 rounded-2xl p-6">
            <TrendingUp size={22} className="text-cyan-400 mb-3" />
            <h3 className="font-display font-bold text-white text-sm mb-1">Explore Local Deals</h3>
            <p className="text-white/40 text-xs mb-4">Fresh products from vendors near you</p>
            <button
              onClick={() => navigate('/')}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs tracking-wider uppercase rounded-xl transition-all hover:scale-[1.02]"
            >
              Browse Marketplace
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <ShoppingBag size={22} className="text-purple-400 mb-3" />
            <h3 className="font-display font-bold text-white text-sm mb-1">Your Cart</h3>
            <p className="text-white/40 text-xs mb-4">3 items waiting for checkout</p>
            <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs tracking-wider uppercase rounded-xl transition-all">
              Go to Cart
            </button>
          </div>

          {/* Account info */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-3">
            {avatar}
            <div className="min-w-0">
              <p className="text-white font-bold text-sm truncate">{user.displayName || 'Customer'}</p>
              <p className="text-white/40 text-xs truncate">{user.email}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
