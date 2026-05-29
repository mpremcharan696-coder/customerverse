import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Bot, Globe, CreditCard, ChevronDown, ChevronUp } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

// ─── Translations ────────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी',    flag: '🇮🇳' },
  { code: 'kn', label: 'ಕನ್ನಡ',   flag: '🏳️' },
  { code: 'te', label: 'తెలుగు',  flag: '🏳️' },
  { code: 'ta', label: 'தமிழ்',   flag: '🏳️' },
]

const T = {
  en: {
    logoLeft: 'MULTI',
    heroTitle: 'CUSTOMER',
    heroSub: 'Empowering Small Vendors, Scaling Big Dreams',
    getStarted: 'Get Started',
    portalEntry: 'Portal Entry',
    scrollExplore: 'Scroll to explore',
    f1Title: 'Chatbot Assistance',
    f1Desc: 'Get 24/7 intelligent support with our AI-powered chatbot. Instant answers, smart product recommendations, and seamless issue resolution — all in your preferred language.',
    f2Title: 'Multilingual Support',
    f2Desc: 'Access the platform in Kannada, English, Hindi, Telugu, and Tamil. A truly inclusive commerce experience built for India\'s diverse languages and communities.',
    f3Title: 'Digital Payments',
    f3Desc: 'Unified digital clearing registers with multi-currency smart contracts and sub-second validation. Scale business operations with secure global transactions.',
    footer1: '© 2026 CustomerVerse. Empowering commerce.',
    footer2: 'Built with React Three Fiber, GSAP & Tailwind',
  },
  hi: {
    logoLeft: 'मल्टी',
    heroTitle: 'कस्टमर',
    heroSub: 'छोटे विक्रेताओं को सशक्त बनाना, बड़े सपनों को साकार करना',
    getStarted: 'शुरू करें',
    portalEntry: 'पोर्टल प्रवेश',
    scrollExplore: 'स्क्रॉल करें',
    f1Title: 'चैटबॉट सहायता',
    f1Desc: 'हमारे AI-संचालित चैटबॉट के साथ 24/7 बुद्धिमान सहायता प्राप्त करें। त्वरित उत्तर, स्मार्ट अनुशंसाएं और आपकी पसंदीदा भाषा में निर्बाध समस्या समाधान।',
    f2Title: 'बहुभाषी समर्थन',
    f2Desc: 'कन्नड़, अंग्रेज़ी, हिंदी, तेलुगु और तमिल में प्लेटफ़ॉर्म का उपयोग करें। भारत की विविध भाषाओं के लिए एक वास्तविक समावेशी वाणिज्य अनुभव।',
    f3Title: 'डिजिटल भुगतान',
    f3Desc: 'मल्टी-करेंसी स्मार्ट कॉन्ट्रैक्ट के साथ एकीकृत डिजिटल क्लियरिंग रजिस्टर। सुरक्षित वैश्विक लेन-देन के साथ व्यवसाय संचालन बढ़ाएं।',
    footer1: '© 2026 CustomerVerse. वाणिज्य को सशक्त बनाना।',
    footer2: 'React Three Fiber, GSAP और Tailwind के साथ निर्मित',
  },
  kn: {
    logoLeft: 'ಮಲ್ಟಿ',
    heroTitle: 'ಕಸ್ಟಮರ್',
    heroSub: 'ಸಣ್ಣ ವ್ಯಾಪಾರಿಗಳಿಗೆ ಅಧಿಕಾರ, ದೊಡ್ಡ ಕನಸುಗಳನ್ನು ಸಾಕಾರಗೊಳಿಸಿ',
    getStarted: 'ಪ್ರಾರಂಭಿಸಿ',
    portalEntry: 'ಪೋರ್ಟಲ್ ಪ್ರವೇಶ',
    scrollExplore: 'ಸ್ಕ್ರೋಲ್ ಮಾಡಿ',
    f1Title: 'ಚಾಟ್‌ಬಾಟ್ ಸಹಾಯ',
    f1Desc: 'ನಮ್ಮ AI-ಚಾಲಿತ ಚಾಟ್‌ಬಾಟ್‌ನೊಂದಿಗೆ 24/7 ಬುದ್ಧಿಮಾನ ಬೆಂಬಲ ಪಡೆಯಿರಿ. ತಕ್ಷಣದ ಉತ್ತರಗಳು, ಸ್ಮಾರ್ಟ್ ಶಿಫಾರಸುಗಳು ಮತ್ತು ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯಲ್ಲಿ ನಿರ್ಬಾಧ ಸಮಸ್ಯೆ ಪರಿಹಾರ.',
    f2Title: 'ಬಹು ಭಾಷಾ ಬೆಂಬಲ',
    f2Desc: 'ಕನ್ನಡ, ಇಂಗ್ಲಿಷ್, ಹಿಂದಿ, ತೆಲುಗು ಮತ್ತು ತಮಿಳಿನಲ್ಲಿ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಬಳಸಿ. ಭಾರತದ ವೈವಿಧ್ಯಮಯ ಭಾಷೆಗಳಿಗಾಗಿ ನಿರ್ಮಿಸಲಾದ ನಿಜವಾದ ಸಮಾವೇಶಿ ವಾಣಿಜ್ಯ ಅನುಭವ.',
    f3Title: 'ಡಿಜಿಟಲ್ ಪಾವತಿಗಳು',
    f3Desc: 'ಮಲ್ಟಿ-ಕರೆನ್ಸಿ ಸ್ಮಾರ್ಟ್ ಕಾಂಟ್ರ್ಯಾಕ್ಟ್‌ಗಳೊಂದಿಗೆ ಏಕೀಕೃತ ಡಿಜಿಟಲ್ ಕ್ಲಿಯರಿಂಗ್. ಸುರಕ್ಷಿತ ಜಾಗತಿಕ ವ್ಯವಹಾರಗಳೊಂದಿಗೆ ವ್ಯವಹಾರ ಕಾರ್ಯಾಚರಣೆ ಹೆಚ್ಚಿಸಿ.',
    footer1: '© 2026 CustomerVerse. ವಾಣಿಜ್ಯವನ್ನು ಸಶಕ್ತಗೊಳಿಸುವುದು.',
    footer2: 'React Three Fiber, GSAP ಮತ್ತು Tailwind ನಿಂದ ನಿರ್ಮಿತ',
  },
  te: {
    logoLeft: 'మల్టీ',
    heroTitle: 'కస్టమర్',
    heroSub: 'చిన్న వ్యాపారులకు అధికారం, పెద్ద కలలను నిజం చేయడం',
    getStarted: 'ప్రారంభించండి',
    portalEntry: 'పోర్టల్ ప్రవేశం',
    scrollExplore: 'స్క్రోల్ చేయండి',
    f1Title: 'చాట్‌బాట్ సహాయం',
    f1Desc: 'మా AI-ఆధారిత చాట్‌బాట్‌తో 24/7 తెలివైన మద్దతు పొందండి. తక్షణ సమాధానాలు, స్మార్ట్ సిఫారసులు మరియు మీకు ఇష్టమైన భాషలో సమస్య పరిష్కారం.',
    f2Title: 'బహుభాషా మద్దతు',
    f2Desc: 'కన్నడ, ఇంగ్లీష్, హిందీ, తెలుగు మరియు తమిళంలో ప్లాట్‌ఫారమ్‌ను ఉపయోగించండి. భారతదేశం యొక్క విభిన్న భాషలకు నిర్మించిన నిజమైన సమ్మిళిత వాణిజ్య అనుభవం.',
    f3Title: 'డిజిటల్ చెల్లింపులు',
    f3Desc: 'మల్టీ-కరెన్సీ స్మార్ట్ కాంట్రాక్ట్‌లతో ఏకీకృత డిజిటల్ క్లియరింగ్. సురక్షిత గ్లోబల్ లావాదేవీలతో వ్యాపార కార్యకలాపాలను స్కేల్ చేయండి.',
    footer1: '© 2026 CustomerVerse. వాణిజ్యాన్ని శక్తివంతం చేయడం.',
    footer2: 'React Three Fiber, GSAP మరియు Tailwind తో నిర్మించబడింది',
  },
  ta: {
    logoLeft: 'மல்டி',
    heroTitle: 'கஸ்டமர்',
    heroSub: 'சிறு வணிகர்களுக்கு அதிகாரம், பெரிய கனவுகளை நனவாக்குதல்',
    getStarted: 'தொடங்கு',
    portalEntry: 'போர்டல் நுழைவு',
    scrollExplore: 'உருள்க',
    f1Title: 'சாட்பாட் உதவி',
    f1Desc: 'எங்கள் AI-இயங்கும் சாட்பாட் மூலம் 24/7 அறிவார்ந்த ஆதரவு பெறுங்கள். உடனடி பதில்கள், சிறந்த பரிந்துரைகள் மற்றும் உங்கள் விருப்பமான மொழியில் சிக்கல் தீர்வு.',
    f2Title: 'பல மொழி ஆதரவு',
    f2Desc: 'கன்னடம், ஆங்கிலம், இந்தி, தெலுங்கு மற்றும் தமிழில் தளத்தை அணுகுங்கள். இந்தியாவின் பல்வேறு மொழிகளுக்காக கட்டமைக்கப்பட்ட உண்மையான வணிக அனுபவம்.',
    f3Title: 'டிஜிட்டல் கொடுப்பனவுகள்',
    f3Desc: 'பல-நாணய ஸ்மார்ட் ஒப்பந்தங்களுடன் ஒருங்கிணைந்த டிஜிட்டல் கிளியரிங். பாதுகாப்பான உலகளாவிய பரிவர்த்தனைகளுடன் வணிக செயல்பாடுகளை அளவிடுங்கள்.',
    footer1: '© 2026 CustomerVerse. வணிகத்தை வலுப்படுத்துதல்.',
    footer2: 'React Three Fiber, GSAP மற்றும் Tailwind உடன் கட்டப்பட்டது',
  },
}

// Chat messages shown in the chatbot graphic (per language)
const CHAT_MESSAGES = {
  en: ['Hello! How can I help?', "Show me today's deals", 'Here are top offers! 🛍️'],
  hi: ['नमस्ते! कैसे मदद करें?', 'आज के ऑफर दिखाएं', 'यहाँ बेस्ट ऑफर हैं! 🛍️'],
  kn: ['ನಮಸ್ಕಾರ! ಹೇಗೆ ಸಹಾಯ?', 'ಇಂದಿನ ಡೀಲ್ಗಳು ತೋರಿಸಿ', 'ಅತ್ಯುತ್ತಮ ಆಫರ್‌ಗಳು! 🛍️'],
  te: ['హలో! ఎలా సహాయం?', 'నేటి డీల్స్ చూపించు', 'అత్యుత్తమ ఆఫర్లు! 🛍️'],
  ta: ['வணக்கம்! எப்படி உதவட்டும்?', 'இன்றைய டீல்கள் காட்டு', 'சிறந்த சலுகைகள்! 🛍️'],
}

export default function LandingPage() {
  const navigate = useNavigate()
  const pageRef = useRef(null)
  const [lang, setLang] = useState('en')
  const [dropOpen, setDropOpen] = useState(false)

  const t = T[lang]
  const msgs = CHAT_MESSAGES[lang]

  useEffect(() => {
    const el = pageRef.current

    gsap.fromTo(el.querySelectorAll('.hero-anim'),
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1.2, stagger: 0.2, ease: 'power3.out' }
    )

    const sections = el.querySelectorAll('.feature-section')
    sections.forEach((section) => {
      const card = section.querySelector('.feature-card')
      const graphic = section.querySelector('.feature-graphic')

      gsap.fromTo(card,
        { opacity: 0, x: -80 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 1, 
          ease: 'power2.out',
          scrollTrigger: { 
            trigger: section, 
            start: 'top 75%', 
            toggleActions: 'play none none reverse' 
          } 
        }
      )
      gsap.fromTo(graphic,
        { opacity: 0, x: 80, rotate: 10, scale: 0.8 },
        { 
          opacity: 1, 
          x: 0, 
          rotate: 0, 
          scale: 1, 
          duration: 1.2, 
          ease: 'power2.out',
          scrollTrigger: { 
            trigger: section, 
            start: 'top 75%', 
            toggleActions: 'play none none reverse' 
          } 
        }
      )
    })

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [lang]) // re-run animations when language changes

  const handleGetStarted = () => {
    gsap.to(pageRef.current, {
      opacity: 0, y: -50, duration: 0.8, ease: 'power2.inOut',
      onComplete: () => navigate('/login')
    })
  }

  const scrollNext = () => {
    pageRef.current.querySelector('#features-start').scrollIntoView({ behavior: 'smooth' })
  }

  const selectLang = (code) => {
    setLang(code)
    setDropOpen(false)
  }

  const activeLang = LANGUAGES.find(l => l.code === lang)

  return (
    <div ref={pageRef} className="w-full min-h-screen text-slate-800 flex flex-col items-center">

      {/* ── NAVBAR ── */}
      <header className="w-full max-w-7xl px-8 py-6 flex items-center justify-between z-20 relative">
        <div className="font-display font-extrabold text-2xl tracking-widest text-slate-900">
          {t.logoLeft}<span className="text-cyan-600 text-glow-cyan">VERSE</span>
        </div>

        <div className="flex items-center gap-4">

          {/* Language Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropOpen(o => !o)}
              className="flex items-center gap-2 border border-slate-200 bg-white/80 backdrop-blur-sm text-slate-700 hover:border-cyan-400 px-4 py-2 rounded-full font-display font-semibold text-xs tracking-wider uppercase transition-all duration-300 shadow-sm"
            >
              <Globe size={14} className="text-cyan-500" />
              <span>{activeLang.flag} {activeLang.label}</span>
              {dropOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {dropOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => selectLang(l.code)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-display font-semibold tracking-wide uppercase transition-colors
                      ${lang === l.code
                        ? 'bg-cyan-50 text-cyan-600 border-l-2 border-cyan-500'
                        : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <span className="text-base">{l.flag}</span>
                    {l.label}
                    {lang === l.code && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleGetStarted}
            className="border border-cyan-300 text-cyan-600 hover:bg-cyan-50 px-5 py-2 rounded-full font-display font-semibold text-xs tracking-wider uppercase transition-all duration-300 shadow-sm hover:shadow-neonCyan"
          >
            {t.portalEntry}
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="min-h-[90vh] flex flex-col justify-center items-center text-center px-4 relative z-10">
        <h1 className="hero-anim font-display font-black text-6xl md:text-8xl tracking-tighter text-slate-900 select-none leading-none mb-6">
          {t.heroTitle}<span className="text-cyan-600 text-glow-cyan">VERSE</span>
        </h1>
        <p className="hero-anim text-lg md:text-2xl text-slate-600 font-medium max-w-2xl mb-12">
          {t.heroSub}
        </p>

        <div className="hero-anim">
          <button
            onClick={handleGetStarted}
            className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-display font-bold text-sm tracking-widest uppercase rounded-full overflow-hidden transition-all duration-300 hover:shadow-neonCyan hover:scale-105"
          >
            <span className="relative z-10 flex items-center gap-2">
              {t.getStarted} <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
          </button>
        </div>

        {/* Language pill strip in Hero */}
        <div className="hero-anim flex gap-2 mt-8 flex-wrap justify-center">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`px-3 py-1 rounded-full text-[11px] font-display font-semibold tracking-wide border transition-all duration-200
                ${lang === l.code
                  ? 'bg-cyan-500 text-white border-cyan-500 shadow-neonCyan'
                  : 'border-slate-200 text-slate-500 hover:border-cyan-300 hover:text-cyan-600 bg-white/60'}`}
            >
              {l.flag} {l.label}
            </button>
          ))}
        </div>

        <div
          onClick={scrollNext}
          className="hero-anim absolute bottom-8 cursor-pointer hover:text-cyan-600 transition-colors animate-bounce flex flex-col items-center gap-2 text-slate-500 font-display text-[10px] tracking-widest uppercase"
        >
          <span>{t.scrollExplore}</span>
          <ChevronDown size={18} />
        </div>
      </section>

      <div id="features-start" className="h-10" />

      {/* ── FEATURES ── */}
      <main className="w-full max-w-5xl px-6 py-20 flex flex-col gap-32 relative z-10">

        {/* Feature 1: Chatbot Assistance */}
        <section className="feature-section flex flex-col md:flex-row items-center justify-between gap-12 min-h-[40vh]">
          <div className="feature-card flex-1 max-w-md bg-white/70 border border-slate-200/80 backdrop-blur-md p-8 md:p-10 rounded-2xl border-glow-cyan transition-all duration-500 hover:border-cyan-300 shadow-xl">
            <div className="w-12 h-12 bg-cyan-50 border border-cyan-200 rounded-lg flex items-center justify-center mb-6 text-cyan-600">
              <Bot size={24} />
            </div>
            <h2 className="font-display font-bold text-3xl mb-4 text-slate-900">{t.f1Title}</h2>
            <p className="text-slate-600 leading-relaxed">{t.f1Desc}</p>
          </div>

          {/* Chatbot graphic */}
          <div className="feature-graphic flex-1 flex justify-center items-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80 bg-gradient-to-tr from-cyan-50 to-cyan-100/50 border border-cyan-200 rounded-3xl flex flex-col justify-center items-center shadow-glow overflow-hidden gap-3 px-5 group">
              <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent z-0 pointer-events-none" />

              {/* Bot bubble */}
              <div className="self-start flex items-end gap-2 z-10">
                <div className="w-7 h-7 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-white border border-cyan-200 rounded-2xl rounded-bl-none px-3 py-2 text-[11px] text-slate-700 font-display font-medium shadow-sm max-w-[140px]">
                  {msgs[0]}
                </div>
              </div>

              {/* User bubble */}
              <div className="self-end flex items-end gap-2 z-10">
                <div className="bg-cyan-500 rounded-2xl rounded-br-none px-3 py-2 text-[11px] text-white font-display font-medium shadow-sm max-w-[140px]">
                  {msgs[1]}
                </div>
              </div>

              {/* Bot reply bubble */}
              <div className="self-start flex items-end gap-2 z-10">
                <div className="w-7 h-7 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-white border border-cyan-200 rounded-2xl rounded-bl-none px-3 py-2 text-[11px] text-slate-700 font-display font-medium shadow-sm max-w-[140px]">
                  {msgs[2]}
                </div>
              </div>

              {/* Typing indicator */}
              <div className="self-start flex items-end gap-2 z-10">
                <div className="w-7 h-7 rounded-full bg-cyan-200 flex items-center justify-center flex-shrink-0">
                  <Bot size={14} className="text-cyan-600" />
                </div>
                <div className="bg-white border border-cyan-200 rounded-2xl rounded-bl-none px-3 py-2 shadow-sm flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 2: Multilingual Support */}
        <section className="feature-section flex flex-col md:flex-row-reverse items-center justify-between gap-12 min-h-[40vh]">
          <div className="feature-card flex-1 max-w-md bg-white/70 border border-slate-200/80 backdrop-blur-md p-8 md:p-10 rounded-2xl border-glow-fuchsia transition-all duration-500 hover:border-fuchsia-300 shadow-xl">
            <div className="w-12 h-12 bg-fuchsia-50 border border-fuchsia-200 rounded-lg flex items-center justify-center mb-6 text-fuchsia-600">
              <Globe size={24} />
            </div>
            <h2 className="font-display font-bold text-3xl mb-4 text-slate-900">{t.f2Title}</h2>
            <p className="text-slate-600 leading-relaxed">{t.f2Desc}</p>
          </div>

          {/* Language graphic */}
          <div className="feature-graphic flex-1 flex justify-center items-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80 bg-gradient-to-tr from-fuchsia-50 to-fuchsia-100/50 border border-fuchsia-200 rounded-3xl flex flex-col justify-center items-center shadow-glow overflow-hidden group gap-3 px-6">
              <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent z-0 pointer-events-none" />

              {/* Globe icon center */}
              <div className="w-14 h-14 rounded-full border-2 border-fuchsia-300 bg-white flex items-center justify-center shadow-md mb-2 z-10 group-hover:rotate-12 transition-transform duration-500">
                <Globe size={28} className="text-fuchsia-500" />
              </div>

              {/* Language pills */}
              <div className="flex flex-wrap gap-2 justify-center z-10">
                {[
                  { label: 'English',  color: 'bg-cyan-100 border-cyan-300 text-cyan-700' },
                  { label: 'हिंदी',    color: 'bg-orange-100 border-orange-300 text-orange-700' },
                  { label: 'ಕನ್ನಡ',   color: 'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-700' },
                  { label: 'తెలుగు',  color: 'bg-emerald-100 border-emerald-300 text-emerald-700' },
                  { label: 'தமிழ்',   color: 'bg-violet-100 border-violet-300 text-violet-700' },
                ].map((pill, i) => (
                  <span
                    key={pill.label}
                    className={`px-3 py-1 rounded-full border text-[11px] font-display font-bold tracking-wide ${pill.color} transition-transform hover:scale-110 cursor-default`}
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    {pill.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Feature 3: Digital Payments */}
        <section className="feature-section flex flex-col md:flex-row items-center justify-between gap-12 min-h-[40vh]">
          <div className="feature-card flex-1 max-w-md bg-white/70 border border-slate-200/80 backdrop-blur-md p-8 md:p-10 rounded-2xl border-glow-cyan transition-all duration-500 hover:border-cyan-300 shadow-xl">
            <div className="w-12 h-12 bg-cyan-50 border border-cyan-200 rounded-lg flex items-center justify-center mb-6 text-cyan-600">
              <CreditCard size={24} />
            </div>
            <h2 className="font-display font-bold text-3xl mb-4 text-slate-900">{t.f3Title}</h2>
            <p className="text-slate-600 leading-relaxed">{t.f3Desc}</p>
          </div>

          <div className="feature-graphic flex-1 flex justify-center items-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80 bg-gradient-to-tr from-cyan-50 to-cyan-100/50 border border-cyan-200 rounded-3xl flex items-center justify-center shadow-glow overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent z-10" />
              <div className="relative w-48 h-32 border border-cyan-300 rounded-xl bg-gradient-to-br from-white to-cyan-50 p-4 z-20 transition-all duration-500 group-hover:rotate-6 shadow-md">
                <div className="w-8 h-6 bg-cyan-100 rounded mb-6 border border-cyan-200" />
                <div className="w-24 h-3 bg-cyan-100 rounded mb-2" />
                <div className="w-16 h-2 bg-cyan-50 rounded" />
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="w-full max-w-7xl px-8 py-10 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 mt-20 z-10 text-xs text-slate-600 font-display">
        <p>{t.footer1}</p>
        <p>{t.footer2}</p>
      </footer>

    </div>
  )
}