import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, googleProvider, facebookProvider } from '../firebase'
import gsap from 'gsap'
import {
  Mail, Lock, Eye, EyeOff, ArrowLeft,
  User, AlertCircle, CheckCircle2, X, ShieldCheck
} from 'lucide-react'

/* ── Google SVG ── */
const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="w-5 h-5 flex-shrink-0">
    <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.5 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.8 6.5 29.1 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5c10.5 0 20-7.6 20-20.5 0-1-.1-2-.4-3h-16v-2z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.8 6.5 29.1 4.5 24 4.5c-7.8 0-14.5 4.5-17.7 10.2z"/>
    <path fill="#4CAF50" d="M24 45.5c5 0 9.7-1.9 13.2-4.9l-6.1-5.2C29.2 36.9 26.7 37.5 24 37.5c-5.2 0-9.6-3.4-11.3-8.1l-6.5 5C9.6 41.1 16.3 45.5 24 45.5z"/>
    <path fill="#1565C0" d="M43.6 20H24v8h11.3c-.9 2.5-2.5 4.6-4.7 6l6.1 5.2c3.6-3.3 5.8-8.1 5.8-13.7 0-1-.1-2-.4-3h-.5z"/>
  </svg>
)

/* ── Facebook SVG ── */
const FacebookIcon = () => (
  <svg viewBox="0 0 48 48" className="w-5 h-5 flex-shrink-0">
    <circle cx="24" cy="24" r="20" fill="#1877F2"/>
    <path fill="white" d="M29.5 16h-3c-1.1 0-1.5.5-1.5 1.7V20h4.5l-.6 4.5H25V36h-5V24.5h-3V20h3v-2.5C20 13.5 22 11 26 11c1.7 0 3.5.3 3.5.3V16z"/>
  </svg>
)

/* ── Reusable Input ── */
const InputField = ({ id, label, type, value, onChange, placeholder, icon: Icon, rightEl }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-xs font-semibold tracking-widest uppercase text-slate-500">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Icon size={16} />
        </span>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
      />
      {rightEl && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-700">
          {rightEl}
        </span>
      )}
    </div>
  </div>
)

/* ── Friendly Firebase error messages ── */
const friendlyError = (code) => {
  const map = {
    'auth/user-not-found':       'No account found with this email.',
    'auth/wrong-password':       'Incorrect password. Try again.',
    'auth/invalid-credential':   'Invalid email or password.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password':        'Password must be at least 6 characters.',
    'auth/invalid-email':        'Please enter a valid email address.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled.',
    'auth/account-exists-with-different-credential': 'An account already exists with a different sign-in method.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/too-many-requests':    'Too many attempts. Please wait a moment and try again.',
  }
  return map[code] || 'Something went wrong. Please try again.'
}

/* ══════════════════════════ FORGOT PASSWORD MODAL ══════════════════════════ */
const ForgotPasswordModal = ({ onClose }) => {
  const [email, setEmail]   = useState('')
  const [sent, setSent]     = useState(false)
  const [err, setErr]       = useState('')
  const [busy, setBusy]     = useState(false)
  const modalRef            = useRef(null)

  useEffect(() => {
    gsap.fromTo(modalRef.current,
      { opacity: 0, scale: 0.92, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power3.out' }
    )
  }, [])

  const handleClose = () => {
    gsap.to(modalRef.current, {
      opacity: 0, scale: 0.92, y: 30,
      duration: 0.3, ease: 'power2.in',
      onComplete: onClose
    })
  }

  const handleSend = async (e) => {
    e.preventDefault()
    setErr('')
    if (!email) { setErr('Please enter your email.'); return }
    setBusy(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setSent(true)
    } catch (error) {
      setErr(friendlyError(error.code))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div ref={modalRef} className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative">
        <button onClick={handleClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors">
          <X size={20} />
        </button>

        {!sent ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
                <Mail size={18} className="text-cyan-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Reset Password</h3>
                <p className="text-slate-500 text-xs">We'll send a reset link to your email</p>
              </div>
            </div>

            {err && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-red-600 text-sm">
                <AlertCircle size={15} className="flex-shrink-0" />
                {err}
              </div>
            )}

            <form onSubmit={handleSend} className="flex flex-col gap-4">
              <InputField
                id="reset-email"
                label="Email Address"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                icon={Mail}
              />
              <button
                type="submit"
                disabled={busy}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold text-sm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {busy ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</>
                ) : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <CheckCircle2 size={52} className="text-green-500 mx-auto mb-4" />
            <h3 className="font-bold text-slate-900 text-lg mb-2">Email Sent!</h3>
            <p className="text-slate-500 text-sm mb-6">
              Check <span className="font-semibold text-slate-700">{email}</span> for the password reset link.
            </p>
            <button
              onClick={handleClose}
              className="px-8 py-2.5 bg-slate-900 text-white font-semibold text-sm rounded-xl hover:bg-slate-700 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════ MAIN PAGE ══════════════════════════════ */
export default function CustomerLoginPage() {
  const navigate = useNavigate()
  const pageRef  = useRef(null)
  const cardRef  = useRef(null)

  const [tab, setTab]               = useState('login')
  const [showPwd, setShowPwd]       = useState(false)
  const [showCPwd, setShowCPwd]     = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)

  // Login
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPwd, setLoginPwd]     = useState('')

  // Signup
  const [signupName, setSignupName]   = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPwd, setSignupPwd]     = useState('')
  const [signupCPwd, setSignupCPwd]   = useState('')

  /* ── GSAP entrance ── */
  useEffect(() => {
    gsap.fromTo(pageRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }
    )
    gsap.fromTo(cardRef.current,
      { opacity: 0, scale: 0.92 },
      { opacity: 1, scale: 1, duration: 1, ease: 'power2.out', delay: 0.2 }
    )
  }, [])

  /* ── Redirect if already signed in (listening to real state changes on mount) ── */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        navigate('/search-stores', { replace: true })
      }
    })
    return unsub
  }, [navigate])

  /* ── Tab switch animation ── */
  const switchTab = (newTab) => {
    if (newTab === tab) return
    setError('')
    gsap.to(cardRef.current, {
      opacity: 0, x: newTab === 'signup' ? -20 : 20, duration: 0.2, ease: 'power2.in',
      onComplete: () => {
        setTab(newTab)
        gsap.fromTo(cardRef.current,
          { opacity: 0, x: newTab === 'signup' ? 20 : -20 },
          { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }
        )
      }
    })
  }

  /* ── Back ── */
  const handleBack = () => {
    gsap.to(pageRef.current, {
      opacity: 0, y: 50, duration: 0.7, ease: 'power2.inOut',
      onComplete: () => navigate('/portals')
    })
  }

  /* ── Warp to dashboard ── */
  const warpToDashboard = () => {
    const overlay = document.getElementById('login-warp-overlay')
    gsap.fromTo(overlay,
      { opacity: 0 },
      {
        opacity: 1, duration: 0.5, ease: 'power2.inOut',
        onComplete: () => navigate('/search-stores', { replace: true })
      }
    )
  }

  /* ────────── GOOGLE SIGN IN ────────── */
  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
      warpToDashboard()
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  /* ────────── FACEBOOK SIGN IN ────────── */
  const handleFacebookLogin = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithPopup(auth, facebookProvider)
      warpToDashboard()
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  /* ────────── EMAIL LOGIN ────────── */
  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!loginEmail || !loginPwd) { setError('Please fill in all fields.'); return }
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPwd)
      warpToDashboard()
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  /* ────────── EMAIL SIGN UP ────────── */
  const handleEmailSignup = async (e) => {
    e.preventDefault()
    setError('')
    if (!signupName || !signupEmail || !signupPwd) { setError('Please fill in all fields.'); return }
    if (signupPwd !== signupCPwd) { setError('Passwords do not match.'); return }
    if (signupPwd.length < 6)    { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      const credential = await createUserWithEmailAndPassword(auth, signupEmail, signupPwd)
      await updateProfile(credential.user, { displayName: signupName })
      warpToDashboard()
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  /* ─────────────────────────────── RENDER ─────────────────────────────── */
  return (
    <div ref={pageRef} className="w-full min-h-screen flex flex-col items-center justify-center relative px-4 py-16">

      {/* Full-screen warp overlay */}
      <div id="login-warp-overlay" className="fixed inset-0 bg-[#0a0a0f] pointer-events-none opacity-0 z-50" />

      {/* Forgot Password Modal */}
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      {/* Back button */}
      <button
        onClick={handleBack}
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-cyan-600 font-display text-xs tracking-widest uppercase transition-colors z-10"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Page heading */}
      <div className="text-center mb-10 relative z-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <ShieldCheck size={20} className="text-cyan-500" />
          <span className="text-xs font-semibold tracking-widest uppercase text-cyan-600 font-display">
            Customer Portal
          </span>
        </div>
        <h1 className="font-display font-black text-4xl md:text-5xl tracking-tighter text-slate-900 leading-tight">
          Welcome to <span className="text-cyan-600">CustomerVerse</span>
        </h1>
        <p className="text-slate-500 mt-3 text-sm font-medium">
          Sign in to discover products from local vendors
        </p>
      </div>

      {/* ── Card ── */}
      <div
        ref={cardRef}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-slate-200/70 rounded-3xl shadow-2xl overflow-hidden relative z-10"
      >

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100">
          {[
            { key: 'login',  label: 'Sign In' },
            { key: 'signup', label: 'Create Account' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => switchTab(key)}
              className={`flex-1 py-4 text-xs font-display font-bold tracking-widest uppercase transition-all ${
                tab === key
                  ? 'text-cyan-600 border-b-2 border-cyan-500 bg-cyan-50/50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-8">

          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-red-600 text-sm">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Social Buttons ── */}
          <div className="flex flex-col gap-3 mb-6">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              id="btn-google"
              className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-slate-400 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <button
              onClick={handleFacebookLogin}
              disabled={loading}
              id="btn-facebook"
              className="w-full flex items-center justify-center gap-3 py-3 bg-[#1877F2] rounded-xl text-sm font-semibold text-white hover:bg-[#166fe5] hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FacebookIcon />
              Continue with Facebook
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center mb-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="mx-4 text-slate-400 text-xs font-display font-semibold tracking-widest uppercase">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* ── SIGN IN FORM ── */}
          {tab === 'login' && (
            <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
              <InputField
                id="login-email"
                label="Email"
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="you@example.com"
                icon={Mail}
              />
              <InputField
                id="login-password"
                label="Password"
                type={showPwd ? 'text' : 'password'}
                value={loginPwd}
                onChange={e => setLoginPwd(e.target.value)}
                placeholder="Your password"
                icon={Lock}
                rightEl={
                  <span onClick={() => setShowPwd(p => !p)}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </span>
                }
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => { setError(''); setShowForgot(true) }}
                  className="text-xs text-cyan-600 hover:text-cyan-700 font-semibold transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                id="btn-email-login"
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold text-sm tracking-wider uppercase rounded-xl hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50 disabled:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : 'Sign In'}
              </button>
              <p className="text-center text-xs text-slate-500 mt-1">
                No account?{' '}
                <button type="button" onClick={() => switchTab('signup')} className="text-cyan-600 font-semibold hover:underline">
                  Create one free
                </button>
              </p>
            </form>
          )}

          {/* ── SIGN UP FORM ── */}
          {tab === 'signup' && (
            <form onSubmit={handleEmailSignup} className="flex flex-col gap-4">
              <InputField
                id="signup-name"
                label="Full Name"
                type="text"
                value={signupName}
                onChange={e => setSignupName(e.target.value)}
                placeholder="John Doe"
                icon={User}
              />
              <InputField
                id="signup-email"
                label="Email"
                type="email"
                value={signupEmail}
                onChange={e => setSignupEmail(e.target.value)}
                placeholder="you@example.com"
                icon={Mail}
              />
              <InputField
                id="signup-password"
                label="Password"
                type={showPwd ? 'text' : 'password'}
                value={signupPwd}
                onChange={e => setSignupPwd(e.target.value)}
                placeholder="Min. 6 characters"
                icon={Lock}
                rightEl={
                  <span onClick={() => setShowPwd(p => !p)}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </span>
                }
              />
              <InputField
                id="signup-confirm"
                label="Confirm Password"
                type={showCPwd ? 'text' : 'password'}
                value={signupCPwd}
                onChange={e => setSignupCPwd(e.target.value)}
                placeholder="Re-enter password"
                icon={Lock}
                rightEl={
                  <span onClick={() => setShowCPwd(p => !p)}>
                    {showCPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </span>
                }
              />
              <button
                type="submit"
                disabled={loading}
                id="btn-email-signup"
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold text-sm tracking-wider uppercase rounded-xl hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50 disabled:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account…
                  </span>
                ) : 'Create Account'}
              </button>
              <p className="text-center text-xs text-slate-500 mt-1">
                Already have an account?{' '}
                <button type="button" onClick={() => switchTab('login')} className="text-cyan-600 font-semibold hover:underline">
                  Sign in
                </button>
              </p>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="px-8 pb-6 text-center">
          <p className="text-[10px] text-slate-400 leading-relaxed">
            By continuing you agree to CustomerVerse's{' '}
            <span className="underline cursor-pointer hover:text-slate-600">Terms of Service</span>
            {' '}and{' '}
            <span className="underline cursor-pointer hover:text-slate-600">Privacy Policy</span>
          </p>
        </div>
      </div>

      {/* Security badge */}
      <div className="mt-8 flex items-center gap-2 text-slate-400 text-[10px] font-display tracking-widest uppercase relative z-10">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
        256-bit SSL encrypted · Powered by Firebase
      </div>
    </div>
  )
}
