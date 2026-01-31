import React, { useState, useEffect, useRef } from 'react';
import { 
  Instagram, 
  ExternalLink, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight, 
  User, 
  Layout, 
  Zap, 
  History,
  Sparkles, 
  Globe,
  Loader2,
  Camera,
  Star, 
  ShieldCheck, 
  ZapOff,
  ShoppingBag,
  Timer,
  CreditCard,
  Clock,
  Mail,
  XCircle,
  Info,
  Home,
  Network,
  X,
  Layers,
  FileText,
  Search,
  MessageSquare,
  Send,
  Minimize2,
  PenTool,
  Quote,
  Plus,
  Minus,
  Check
} from 'lucide-react';

const apiKey = "";
const TEXT_LOGO = "https://images.travelprox.com/callista/textlogo.png";
const FAVICON = "https://images.travelprox.com/callista/favicon.png";
const CONTACT_EMAIL = "hello@callistadigital.com";
const INSTAGRAM_URL = "https://www.instagram.com/callistadigital";

// --- Inquiry Modal Component (Integrated with Kit) ---
const InquiryModal = ({ isOpen, onClose, selectedPackage }) => {
  const [status, setStatus] = useState('idle'); // 'idle', 'submitting', 'success'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    comments: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    // Prepare data for Kit (ConvertKit)
    // We combine names and package info into the comments to ensure no data is lost
    // as custom field IDs can vary per account.
    const kitData = new FormData();
    kitData.append('fields[first_name]', formData.firstName);
    kitData.append('email_address', formData.email);
    kitData.append('fields[last_name]', formData.lastName);
    kitData.append('fields[phone_number]', formData.phone);
    kitData.append('fields[package_selected]', selectedPackage);
    kitData.append('fields[comments]', `Package: ${selectedPackage}\nPhone: ${formData.phone}\nMessage: ${formData.comments}`);

    try {
      await fetch("https://app.kit.com/forms/9036743/subscriptions", {
        method: "POST",
        body: kitData,
        mode: 'no-cors' // Standard for cross-origin form posts to Kit
      });
      setStatus('success');
    } catch (error) {
      console.error("Submission error", error);
      setStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 overflow-y-auto py-10">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors z-10">
          <X className="w-6 h-6" />
        </button>

        {status !== 'success' ? (
          <div className="p-8 md:p-12">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-amber-500 mb-4">Project Inquiry</h2>
            <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-8">
              {selectedPackage || "Start Your Build"}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">First Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-slate-800"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Last Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-slate-800"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                <input 
                  required
                  type="email" 
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-slate-800"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Phone Number</label>
                <input 
                  required
                  type="tel" 
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-slate-800"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Comments / Goals</label>
                <textarea 
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-slate-800 min-h-[100px] resize-none"
                  placeholder="Tell us about your brand or specific project needs..."
                  value={formData.comments}
                  onChange={(e) => setFormData({...formData, comments: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                disabled={status === 'submitting'}
                className="w-full bg-amber-500 text-slate-950 font-black uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-white hover:scale-[1.02] transition-all shadow-xl shadow-amber-500/10 flex items-center justify-center space-x-3"
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Send Request</span>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="p-12 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
              <Check className="w-10 h-10 text-amber-500" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Request Received</h3>
              <p className="text-slate-400 font-light leading-relaxed">
                Thank you, {formData.firstName}. We have received your inquiry. A strategist will reach out to you within 24 hours.
              </p>
            </div>
            <button 
              onClick={onClose}
              className="px-10 py-4 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all"
            >
              Close Window
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- FAQ Component ---
const FAQItem = ({ question, answer, isOpen, onClick }) => {
  const contentRef = useRef(null);
  
  return (
    <div className="border-b border-white/10 overflow-hidden">
      <button 
        onClick={onClick}
        className="w-full py-8 flex justify-between items-center text-left group transition-all"
      >
        <span className={`text-lg md:text-xl font-bold uppercase tracking-tight transition-colors ${isOpen ? 'text-amber-500' : 'text-white group-hover:text-amber-500/80'}`}>
          {question}
        </span>
        <div className={`shrink-0 ml-4 p-2 rounded-full border transition-all ${isOpen ? 'bg-amber-500 border-amber-500 text-slate-950 rotate-0' : 'border-white/20 text-white rotate-0 group-hover:border-amber-500/50'}`}>
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </div>
      </button>
      <div 
        ref={contentRef}
        style={{ height: isOpen ? contentRef.current?.scrollHeight : 0 }}
        className="transition-all duration-300 ease-in-out overflow-hidden"
      >
        <div className="pb-8 text-slate-400 text-base md:text-lg leading-relaxed font-light whitespace-pre-line">
          {answer}
        </div>
      </div>
    </div>
  );
};

// --- ChatBot Component ---
const ChatBot = ({ messages, setMessages }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const callGemini = async (userQuery, retryCount = 0) => {
    const userMsgCount = messages.filter(m => m.role === 'user').length + 1;
    
    let contactInstruction = "";
    if (userMsgCount === 2 || (userMsgCount > 2 && (userMsgCount - 2) % 3 === 0)) {
       contactInstruction = `\n\nREQUIRED ACTION: You must now end this specific message by telling the user the best way to get started is to email ${CONTACT_EMAIL} or DM @callistadigital on Instagram.`;
    }

    const systemPrompt = `You are a professional Digital Strategist for Callista Digital. 
    Our pricing and structure:
    - 2-Page Brand Build: $797 (Founder's Special). Focus: Clarity and conversion.
    - 3-Page Custom Site: $1497. Focus: Custom interior content.
    - 5-Page Complete Presence: $2397. Includes blog, premium management, and AEO optimization.
    - Professional Management: $125/mo for hosting, updates, and 1 small edit/month.
    - A la Carte Blog Posts: $125 per post.
    - Blog Packages: 4 posts/mo ($500), 8 posts/mo ($900), 12 posts/mo ($1,200).
    
    CRITICAL FORMATTING RULES:
    - Communicate in PLAIN TEXT ONLY.
    - RESPOND WITH 1 TO 2 SENTENCES MAX.
    - AFTER YOUR RESPONSE, ALWAYS ASK A DISCOVERY QUESTION to learn about the user's business or digital goals.
    - NEVER use hashtags (#), bolding symbols (**), or tables.
    - Do not use markdown. Use simple line breaks for space between paragraphs.
    - Be elite, professional, and minimalist in your tone. Use "We" instead of "I".
    ${contactInstruction}`;

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userQuery, systemPrompt }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error("Chat failed");

      return data.text || "System unavailable.";
    } catch (error) {
      if (retryCount < 3) return callGemini(userQuery, retryCount + 1);
      return `We are experiencing a brief network interruption. Please reach out to us directly at ${CONTACT_EMAIL}!`;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);
    const aiResponse = await callGemini(userMessage);
    setMessages(prev => [...prev, { role: 'assistant', text: aiResponse }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {isOpen ? (
        <div className="w-[320px] md:w-[380px] h-[500px] bg-slate-900 border border-amber-500/30 rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-5 bg-slate-950 border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img 
                src={FAVICON} 
                alt="Favicon" 
                className="w-8 h-8 rounded-lg border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)] object-contain" 
              />
              <span className="text-xs font-black uppercase tracking-widest text-white">Strategist</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors"><Minimize2 className="w-4 h-4" /></button>
          </div>
          <div ref={scrollRef} className="flex-grow p-5 overflow-y-auto space-y-4 scrollbar-hide">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${m.role === 'user' ? 'bg-amber-500 text-slate-950 rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
               <div className="flex justify-start">
                 <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-white/5">
                   <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                 </div>
               </div>
            )}
          </div>
          <div className="p-4 bg-slate-950 border-t border-white/5 flex space-x-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask a question..." className="flex-grow bg-slate-900 border border-white/10 rounded-full px-4 py-2 text-xs text-white focus:outline-none placeholder:text-slate-600" />
            <button onClick={handleSend} disabled={isLoading} className="p-2 bg-amber-500 rounded-full text-slate-950 hover:scale-105 transition-transform disabled:opacity-50"><Send className="w-4 h-4" /></button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="w-14 h-14 bg-slate-900 border border-amber-500/30 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all group">
          <div className="absolute inset-0 bg-amber-500/10 rounded-full animate-ping group-hover:animate-none" />
          <MessageSquare className="w-6 h-6 text-amber-500" />
        </button>
      )}
    </div>
  );
};

// --- Reusable Scroll Reveal ---
const ScrollReveal = ({ children }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setIsVisible(true); }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => ref.current && observer.unobserve(ref.current);
  }, []);
  return <div ref={ref} className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>{children}</div>;
};

// --- Glowing Button ---
const GlowingButton = ({ onClick, children, className = "", isLink = false, href = "", small = false, theme = "gold", variant = "spin" }) => {
  const themes = {
    gold: { spark: "conic-gradient(from 90deg at 50% 50%, transparent 0%, transparent 25%, #D4AF37 30%, transparent 35%, transparent 100%)", shadow: "shadow-[0_20px_40px_-15px_rgba(212,175,55,0.3)]", border: "border-amber-500/20" },
    silver: { spark: "conic-gradient(from 90deg at 50% 50%, transparent 0%, transparent 25%, #94a3b8 30%, transparent 35%, transparent 100%)", shadow: "shadow-[0_20px_40px_-15px_rgba(148,163,184,0.1)]", border: "border-stone-700" }
  };
  const currentTheme = themes[theme] || themes.gold;
  const content = (
    <>
      {variant === 'spin' && <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] group-hover:animate-[spin_1.5s_linear_infinite]" style={{ background: currentTheme.spark }} />}
      <div className={`relative z-10 bg-slate-950 flex items-center justify-center text-white font-bold w-full h-full rounded-full border ${currentTheme.border} ${small ? 'px-4 py-2 text-[10px]' : 'px-10 py-5 text-base'}`}>{children}</div>
    </>
  );
  const classes = `group relative p-[1.5px] inline-block overflow-hidden rounded-full transition-all duration-300 hover:scale-[1.03] active:scale-95 ${currentTheme.shadow} ${className}`;
  
  if (isLink) {
    return <a href={href} target={href.startsWith('mailto') ? '_self' : '_blank'} rel="noopener noreferrer" className={classes}>{content}</a>;
  }
  
  return <button onClick={onClick} className={classes}>{content}</button>;
};

// --- Main App ---
const App = () => {
  const [view, setView] = useState('home');
  const [openFaq, setOpenFaq] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: "Hi, we are your Callista Digital strategists. How can we help you level up your online presence today?" }
  ]);
  
  const HERO_IMAGE = "https://images.travelprox.com/callista/cdhero.png";
  const WOMAN_IMAGE = "https://images.travelprox.com/callista/woman.png";

  useEffect(() => window.scrollTo(0, 0), [view]);

  const openInquiry = (pkg) => {
    setSelectedPackage(pkg);
    setModalOpen(true);
  };

  const faqs = [
    {
      q: "Why are Callista Digital websites harder to hack than WordPress?",
      a: "Callista Digital sites are built as modern static web apps, not traditional WordPress installs. \n\nThat means: \n• No exposed admin login pages \n• No vulnerable plugin ecosystem \n• No PHP execution layer \n• No public database endpoints \n• No writable server files \n\nMost WordPress hacks happen through outdated plugins or login brute-force attacks. Our architecture removes those attack paths entirely. Nothing online is 100% unhackable — but our stack dramatically reduces real-world risk."
    },
    {
      q: "So you don’t use WordPress at all?",
      a: "Correct. We use a modern React + Vercel architecture designed for speed, security, and reliability. \n\nWordPress was built for blogs in 2003. We build infrastructure designed for modern performance and mobile-first traffic. You get faster load times, cleaner code, and a stronger SEO foundation without plugin chaos."
    },
    {
      q: "What makes Callista Digital different from a normal web designer?",
      a: "Most designers build websites. We build infrastructure. \n\nA typical designer delivers a theme and a plugin stack. Callista Digital delivers hardened architecture, global hosting, and performance-optimized systems designed to last. You’re not buying decoration. You’re buying engineered reliability."
    },
    {
      q: "Will my site go down if traffic spikes?",
      a: "Highly unlikely. Sites are deployed on Vercel’s global edge network — the same class of infrastructure used by major SaaS platforms. \n\nTraffic doesn’t crash a server. It distributes automatically. That means better uptime, faster response, and resilience under load."
    },
    {
      q: "Can I make edits to my website?",
      a: "Edits are requested through Callista Digital and handled by our team. We design sites using a scientific performance framework — layout, spacing, typography, and flow are engineered to guide behavior and maximize conversion. \n\nUncontrolled edits can unknowingly throw off results. Instead of handing you a fragile editor, we protect the integrity of the system and implement changes correctly. You request changes. We execute them safely."
    },
    {
      q: "Will my site be fast on mobile?",
      a: "Yes. Our sites are precompiled, optimized, and delivered through a global CDN. \n\nThere’s no plugin bloat slowing performance. Speed is engineered into the architecture."
    },
    {
      q: "Is this overkill for a small business?",
      a: "No. Small businesses are the ones most harmed by downtime and hacks. \n\nSecurity and speed aren’t luxury upgrades — they’re baseline protection. A slow or compromised site costs far more than prevention."
    },
    {
      q: "Is this future-proof?",
      a: "Yes. We build on actively developed, industry-standard technology used by modern web platforms. \n\nThis isn’t experimental. It’s where the web has already moved."
    }
  ];

  const Header = () => (
    <nav className="fixed top-0 left-0 w-full z-50 px-4 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full px-4 md:px-6 py-2 shadow-2xl">
        <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => setView('home')}>
          <img 
            src={FAVICON} 
            alt="Callista" 
            className="w-8 h-8 rounded-lg border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all duration-300 group-hover:rotate-12 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.6)] object-contain bg-slate-900" 
          />
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white">CALLISTA DIGITAL</span>
        </div>
        <div className="flex items-center space-x-4">
          <GlowingButton small theme="silver" onClick={() => setView(view === 'home' ? 'pricing' : 'home')}>
            {view === 'home' ? 'Pricing' : 'Home'}
          </GlowingButton>
        </div>
      </div>
    </nav>
  );

  const PageOne = () => (
    <div className="bg-slate-950 text-white w-full font-sans overflow-x-hidden">
      <Header />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={HERO_IMAGE} alt="Hero" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/40 to-slate-950" />
        </div>
        <div className="relative z-10 text-center max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="inline-flex items-center space-x-2 px-4 py-2 mb-8 text-[10px] font-black tracking-[0.3em] uppercase bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20 backdrop-blur-sm">
              <Sparkles className="w-3 h-3" /><span>Personal Brand Excellence</span>
            </div>
            <h1 className="text-5xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.9] uppercase drop-shadow-2xl">LOOK <span className="text-amber-500">LEGIT</span> <br className="hidden md:block" /><span className="text-white/90">EVERYWHERE.</span></h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed max-w-2xl mx-auto font-light px-4 md:px-0 text-center">
              Where beautifully crafted design meets intelligent precision.
            </p>
            <GlowingButton onClick={() => setView('pricing')} theme="gold">Get Your Page Built <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></GlowingButton>
          </ScrollReveal>
        </div>
      </section>

      {/* The Authority Section */}
      <section className="px-6 py-24 md:py-32 bg-slate-900 relative border-y border-white/5 shadow-inner">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
              <div className="relative">
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-500/10 blur-[60px] rounded-full" />
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-amber-500 mb-8 text-white font-black">THE AUTHORITY</h2>
                <p className="text-3xl md:text-6xl font-black leading-[1.1] mb-8 text-white uppercase tracking-tight">
                  We turn digital chaos <br className="hidden md:block" /> into <span className="text-slate-500">elegant command.</span>
                </p>
                <div className="h-1 w-20 bg-amber-500" />
              </div>
              <div className="space-y-6">
                <p className="text-xl md:text-2xl text-white font-bold leading-relaxed">
                  Your digital front door is your first impression.
                </p>
                <p className="text-lg md:text-xl text-slate-400 leading-relaxed font-light">
                  We design beautifully crafted, hosted brand systems that make you look established, guide visitors effortlessly, and convert attention into action.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Infrastructure Comparison */}
      <section className="px-6 py-24 md:py-32 bg-slate-950">
        <ScrollReveal>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20 md:mb-24">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-amber-500 mb-6 font-black tracking-widest uppercase">The Infrastructure</h2>
              <h3 className="text-4xl md:text-7xl font-black tracking-tighter uppercase mb-8 leading-none">BUILT DIFFERENT.</h3>
              <p className="text-slate-400 text-lg md:text-xl font-light max-w-3xl mx-auto leading-relaxed italic px-4">Most websites sit on one cheap server. Ours run on the same global edge network used by modern apps — fast, secure, maintenance-free.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 items-stretch relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full lg:w-1/2 h-full bg-amber-500/5 blur-[120px] rounded-full hidden lg:block pointer-events-none" />
              <div className="bg-slate-900/50 p-8 md:p-12 rounded-t-[40px] lg:rounded-tr-none lg:rounded-l-[40px] border border-white/10 relative z-10 shadow-lg">
                <h4 className="text-xl font-bold text-slate-200 mb-10 flex items-center uppercase tracking-tight"><Home className="w-6 h-6 mr-3 text-slate-500" /> Traditional Hosting</h4>
                <div className="space-y-6">
                  {[
                    { l: "Server Type", v: "Single Location", i: <X className="w-4 h-4 text-slate-500" /> },
                    { l: "Load Speed", v: "Variable / Slow", i: <X className="w-4 h-4 text-slate-500" /> },
                    { l: "Updates", v: "Manual Required", i: <X className="w-4 h-4 text-slate-500" /> },
                    { l: "Traffic", v: "Struggles Under Traffic", i: <X className="w-4 h-4 text-slate-500" /> },
                    { l: "Maintenance", v: "Ongoing Effort", i: <X className="w-4 h-4 text-slate-500" /> }
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between border-b border-white/5 pb-4">
                      <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest">{row.l}</p>
                      <p className="text-sm text-slate-300 font-medium">{row.v}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative bg-slate-900 p-8 md:p-12 rounded-b-[40px] lg:rounded-bl-none lg:rounded-r-[40px] border-2 border-amber-500/30 shadow-[0_0_100px_rgba(212,175,55,0.08)] z-20 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] pointer-events-none" />
                <h4 className="text-xl font-bold text-white mb-10 flex items-center relative z-10 uppercase tracking-tight"><Network className="w-6 h-6 mr-3 text-amber-500" /> Callista Digital</h4>
                <div className="space-y-6 relative z-10">
                  {[
                    { l: "Server Type", v: "Global Edge Network", i: <CheckCircle2 className="w-4 h-4 text-amber-500" /> },
                    { l: "Load Speed", v: "Instant Everywhere", i: <CheckCircle2 className="w-4 h-4 text-amber-500" /> },
                    { l: "Updates", v: "Fully Automated", i: <CheckCircle2 className="w-4 h-4 text-amber-500" /> },
                    { l: "Traffic", v: "Unlimited Scaling", i: <CheckCircle2 className="w-4 h-4 text-amber-500" /> },
                    { l: "Maintenance", v: "Zero Required", i: <CheckCircle2 className="w-4 h-4 text-amber-500" /> }
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between border-b border-amber-500/10 pb-4">
                      <p className="text-[10px] text-amber-500/60 uppercase font-black tracking-widest">{row.l}</p>
                      <p className="text-sm text-white font-bold">{row.v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Upgrade CTA */}
      <section className="px-6 py-24 bg-slate-950 text-center border-y border-white/5">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black mb-8 uppercase tracking-tighter leading-[0.9]">Ready to upgrade your <br className="hidden md:block" /> <span className="text-amber-500">infrastructure?</span></h2>
            <p className="text-lg text-slate-400 font-light mb-12 max-w-xl mx-auto italic">Experience the speed, security, and prestige of a global edge network built for the modern web.</p>
            <GlowingButton onClick={() => setView('pricing')}>Get Started <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></GlowingButton>
          </div>
        </ScrollReveal>
      </section>

      {/* The Studio Section */}
      <section className="px-6 py-32 max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 bg-slate-900 rounded-[60px] border border-white/5 overflow-hidden shadow-2xl">
            <div className="p-10 md:p-24 flex flex-col justify-center order-2 lg:order-1 font-sans">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-amber-500 mb-8 tracking-widest">THE STUDIO</h2>
              <p className="text-3xl md:text-4xl font-bold leading-tight mb-8 text-white">
                We craft digital front doors that <span className="italic underline decoration-amber-500 decoration-4 text-white">command attention.</span>
              </p>
              <div className="space-y-6 mb-10">
                <p className="text-xl text-white font-bold leading-relaxed">
                  Your first impression lives online.
                </p>
                <p className="text-slate-400 text-lg font-light leading-relaxed">
                  We design beautifully crafted, hosted brand systems that replace scattered links, guide visitors effortlessly, and convert attention into action.
                </p>
              </div>
              <div className="flex items-center space-x-3 uppercase"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /><p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 font-black tracking-widest">Callista Digital Strategy</p></div>
            </div>
            <div className="relative min-h-[400px] md:min-h-[600px] bg-slate-950 overflow-hidden order-1 lg:order-2">
              <img src={WOMAN_IMAGE} alt="Founder" className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105 opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Social Proof Stats */}
      <section className="px-6 py-24 bg-white text-slate-950 text-center shadow-2xl">
        <ScrollReveal>
          <div className="flex justify-center space-x-2 mb-10">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-8 h-8 md:w-12 md:h-12 text-amber-500 fill-amber-500" />)}
          </div>
          <h2 className="text-4xl md:text-7xl font-black mb-16 tracking-tighter uppercase leading-[0.9]">TRUSTED BY <br/> MODERN LEADERS.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left max-w-6xl mx-auto">
            {[{ l: "Experience", v: "10+ Years" }, { l: "Focus", v: "Conversion" }, { l: "Systems", v: "Custom Built" }].map((stat, i) => (
              <div key={i} className="border-t-4 border-slate-950 pt-8 shadow-sm"><p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">{stat.l}</p><p className="text-3xl font-black">{stat.v}</p></div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Social Proof Testimonials */}
      <section className="px-6 py-24 md:py-32 bg-slate-950 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-amber-500 mb-6 font-black tracking-widest uppercase">Client Success</h2>
              <h3 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-8 leading-none">REAL WORLD <span className="text-amber-500">RESULTS.</span></h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div className="bg-slate-900 p-8 md:p-12 rounded-[40px] border border-white/5 relative group hover:border-amber-500/30 transition-all duration-500 shadow-xl">
                <Quote className="w-10 h-10 text-amber-500/20 absolute top-8 right-8 group-hover:text-amber-500/40 transition-colors" />
                <div className="mb-8">
                  <p className="text-lg md:text-xl text-slate-300 font-light leading-relaxed italic mb-8">
                    "Our catering brand needed to look as premium as our menu. Callista Digital didn't just build a site; they built an elite digital presence that commands attention and converts inquiries into bookings effortlessly."
                  </p>
                  <div className="h-px w-12 bg-amber-500 mb-6" />
                  <div>
                    <p className="text-white font-black uppercase tracking-widest text-sm">Marcella V.</p>
                    <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest mt-1">Founder, Vesper Catering Co.</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900 p-8 md:p-12 rounded-[40px] border border-white/5 relative group hover:border-amber-500/30 transition-all duration-500 shadow-xl">
                <Quote className="w-10 h-10 text-amber-500/20 absolute top-8 right-8 group-hover:text-amber-500/40 transition-colors" />
                <div className="mb-8">
                  <p className="text-lg md:text-xl text-slate-300 font-light leading-relaxed italic mb-8">
                    "The scale of our travel club requires absolute precision. The systems Callista implemented are fast, secure, and established instant trust with our members. It’s intelligent design that actually scales."
                  </p>
                  <div className="h-px w-12 bg-amber-500 mb-6" />
                  <div>
                    <p className="text-white font-black uppercase tracking-widest text-sm">Elias K.</p>
                    <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest mt-1">Founder, Nomad Horizon Club</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-24 md:py-32 bg-slate-900 relative">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-20">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-amber-500 mb-6 font-black tracking-widest uppercase">FAQ</h2>
              <h3 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-8 leading-none">Why Callista Digital <br/> Is Built Differently</h3>
              <p className="text-slate-400 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
                Modern websites shouldn’t be fragile, slow, or easy to break. <br className="hidden md:block"/> We build infrastructure — not templates.
              </p>
            </div>
            
            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <FAQItem 
                  key={index}
                  question={faq.q}
                  answer={faq.a}
                  isOpen={openFaq === index}
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                />
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 md:py-32 bg-slate-950 text-center font-sans">
        <ScrollReveal>
          <h2 className="text-4xl md:text-6xl font-black mb-12 uppercase tracking-tighter leading-[0.9]">READY TO <br/> <span className="text-amber-500 uppercase">GET STARTED?</span></h2>
          <GlowingButton onClick={() => setView('pricing')}>Get Our Page Built <ArrowRight className="ml-2 w-5 h-5" /></GlowingButton>
          <p className="mt-10 text-sm text-slate-500 italic font-light tracking-wide">Founder's pricing is available for a limited time.</p>
        </ScrollReveal>
      </section>

      <footer className="px-6 py-20 bg-black border-t border-white/5 text-center font-sans px-4">
        <div className="max-w-xl mx-auto">
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-block group mb-10">
            <Instagram className="w-10 h-10 text-slate-500 group-hover:text-amber-500 transition-all transform group-hover:scale-110" />
          </a>
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] tracking-[0.3em] text-slate-600 font-bold uppercase space-y-4">
            <img src={TEXT_LOGO} alt="Callista Digital" className="h-4 w-auto opacity-40 brightness-200 grayscale" />
            <span>EST. 2014 • CLEAN PAGES. CLEAR NEXT STEPS.</span>
          </div>
        </div>
      </footer>
    </div>
  );

  const PageTwo = () => (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-amber-500/30 overflow-x-hidden">
      <Header />
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto w-full">
        <ScrollReveal>
          <div className="text-center mb-24">
            <div className="inline-block p-4 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl mb-8 animate-bounce"><ShoppingBag className="w-10 h-10 text-amber-500" /></div>
            <h1 className="text-5xl md:text-8xl font-black mb-6 uppercase tracking-tighter leading-[0.85]">PRICING <br/><span className="text-amber-500 uppercase font-black tracking-tight">Structure.</span></h1>
            <p className="text-xl md:text-2xl text-slate-400 font-light max-w-2xl mx-auto italic leading-relaxed font-light px-4 text-center">Simple. Clear. Designed for social-first brands.</p>
          </div>
        </ScrollReveal>

        {/* Pricing Tiers */}
        <section className="mb-40 overflow-visible pt-10">
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8 items-stretch mt-12 px-4 md:px-0 overflow-visible">
              <div className="relative bg-slate-900 p-8 md:p-10 rounded-[48px] border-2 border-amber-500/40 flex flex-col shadow-2xl overflow-visible">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap shadow-xl z-30">Founder's Special</div>
                <div className="text-center mb-10 pt-8">
                  <span className="text-slate-500 text-sm font-bold line-through">REGULAR $997</span>
                  <div className="flex justify-center items-center mt-1 font-black"><span className="text-2xl text-slate-500 mr-1">$</span><span className="text-7xl text-white tracking-tighter">797</span></div>
                  <p className="text-[10px] font-black text-amber-500 uppercase mt-4 tracking-widest">One-Time Setup</p>
                </div>
                <h4 className="text-xl font-black text-center mb-6 uppercase tracking-tight">2-Page Brand Build</h4>
                <div className="space-y-4 mb-10 flex-grow text-sm text-slate-400 font-medium italic">
                  {["Brand + Clarity Landing", "Next-Step Action Page", "Mobile-First Design", "Hosted Setup & Launch", "Strategic Layout"].map((f, i) => (
                    <div key={i} className="flex items-center space-x-3"><CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" /><span>{f}</span></div>
                  ))}
                </div>
                <GlowingButton variant="none" onClick={() => openInquiry("Reserve Founder Build")} className="w-full py-5 text-sm uppercase font-black tracking-widest">Reserve Founder Build</GlowingButton>
              </div>

              <div className="bg-slate-900 p-8 md:p-10 rounded-[48px] border border-white/5 flex flex-col shadow-lg">
                <div className="text-center mb-10 pt-8">
                  <div className="flex justify-center items-center font-black"><span className="text-2xl text-slate-500 mr-1">$</span><span className="text-7xl text-white tracking-tighter">1497</span></div>
                  <p className="text-[10px] font-black text-slate-500 uppercase mt-4 tracking-widest font-black">Premium Setup</p>
                </div>
                <h4 className="text-xl font-black text-center mb-6 uppercase tracking-tight">3-Page Custom Site</h4>
                <div className="space-y-4 mb-10 flex-grow text-sm text-slate-400 font-medium italic">
                  {["Everything in Founder's", "Custom Interior Page", "Enhanced Visual Content", "Priority Strategy Session", "Custom Brand Styling"].map((f, i) => (
                    <div key={i} className="flex items-center space-x-3 text-xs md:text-sm"><CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" /><span>{f}</span></div>
                  ))}
                </div>
                <GlowingButton variant="none" theme="silver" onClick={() => openInquiry("Start Premium Project")} className="w-full py-5 text-sm uppercase font-black tracking-widest">Start Premium Project</GlowingButton>
              </div>

              <div className="relative bg-slate-900 p-8 md:p-10 rounded-[48px] border border-white/10 flex flex-col shadow-lg overflow-visible">
                <div className="text-center mb-10 pt-8">
                  <div className="flex justify-center items-center font-black"><span className="text-2xl text-slate-500 mr-1">$</span><span className="text-7xl text-white tracking-tighter">2397</span></div>
                  <p className="text-[10px] font-black text-slate-500 uppercase mt-4 tracking-widest font-black">Authority Setup</p>
                </div>
                <h4 className="text-xl font-black text-center mb-6 uppercase tracking-tight text-white">Complete Presence</h4>
                <div className="space-y-4 mb-10 flex-grow text-sm text-slate-400 font-medium italic">
                  {[
                    "Full 5-Page Architecture",
                    "Integrated Professional Blog",
                    "SEO & AEO Optimized (AI Search)",
                    "Premium Site Management",
                    "Advanced Multi-Page Flow"
                  ].map((f, i) => (
                    <div key={i} className="flex items-center space-x-3"><CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" /><span>{f}</span></div>
                  ))}
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <div className="flex items-center space-x-3 text-slate-500"><FileText className="w-4 h-4 text-slate-600" /><span className="text-[9px] font-black uppercase tracking-widest font-black">$125/Professional Blog Post</span></div>
                    <div className="flex items-center space-x-3 text-slate-500"><Search className="w-4 h-4 text-slate-600" /><span className="text-[9px] font-black uppercase text-amber-500/80 tracking-widest font-black">Optimized for AI Search</span></div>
                  </div>
                </div>
                <GlowingButton variant="none" theme="silver" onClick={() => openInquiry("Begin Full Architecture")} className="w-full py-5 text-sm uppercase font-black tracking-widest">Begin Full Architecture</GlowingButton>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Support Plan */}
        <section className="mb-40" id="support-plan">
          <ScrollReveal>
            <div className="text-center mb-16 max-w-md mx-auto px-4">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-amber-500 mb-6 font-black tracking-widest uppercase">Ongoing Support</h2>
              <div className="relative p-10 rounded-[48px] bg-slate-900 border-2 border-amber-500/20 shadow-3xl text-center hover:border-amber-500/40 transition-all group">
                <div className="flex flex-col items-center mb-10">
                  <div className="flex items-baseline font-sans font-black"><span className="text-2xl font-black text-slate-500 mr-1">$</span><span className="text-7xl font-black text-white tracking-tighter">125</span><span className="text-slate-500 text-xs font-black ml-2 uppercase tracking-widest font-black">/ month</span></div>
                  <p className="text-[10px] font-black text-amber-500 uppercase mt-4 italic tracking-widest font-black">Professional Management</p>
                </div>
                <div className="space-y-4 mb-10 text-left text-sm text-slate-300 font-medium">
                  {["Global edge network hosting", "Secure SSL & uptime monitoring", "Unlimited global bandwidth", "1 Professional edit per month", "Text or image swaps included", "DM or Email technical support"].map((f, i) => (
                    <div key={i} className="flex items-center space-x-3"><CheckCircle2 className="w-4 h-4 text-amber-500" /><span>{f}</span></div>
                  ))}
                </div>
                <GlowingButton variant="none" onClick={() => openInquiry("Start Support Plan")} className="w-full py-5 text-sm uppercase font-black tracking-widest">Start Support Plan</GlowingButton>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Blog Bundles */}
        <section className="mb-40">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-amber-500 mb-6 font-black tracking-widest uppercase">Growth Engines</h2>
              <h3 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-tight">BLOG CONTENT BUNDLES.</h3>
              <p className="text-slate-400 text-lg font-light max-w-2xl mx-auto italic px-4">Professional, high-precision content designed to rank on Google and AI search engines.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch px-4 md:px-0">
              {[
                { name: "Starter Bundle", posts: "4", price: "500", desc: "Consistency for growing brands." },
                { name: "Authority Bundle", posts: "8", price: "900", desc: "Command your niche with depth." },
                { name: "Elite Bundle", posts: "12", price: "1200", desc: "Maximum visibility and AI relevance." }
              ].map((b, i) => (
                <div key={i} className="bg-slate-900 border border-white/10 p-10 rounded-[48px] flex flex-col items-center text-center hover:border-amber-500/30 transition-all shadow-xl group">
                  <div className="p-4 bg-amber-500/10 rounded-2xl mb-8 group-hover:scale-110 transition-transform"><PenTool className="w-6 h-6 text-amber-500" /></div>
                  <h4 className="text-xl font-black uppercase mb-2">{b.name}</h4>
                  <p className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest mb-6">{b.posts} Professional Posts / Month</p>
                  <div className="flex items-baseline mb-8 font-black">
                    <span className="text-xl text-slate-500 mr-1">$</span>
                    <span className="text-6xl text-white tracking-tighter">{b.price}</span>
                    <span className="text-slate-500 text-xs ml-2 uppercase tracking-widest font-black">/ month</span>
                  </div>
                  <p className="text-sm text-slate-400 font-medium italic mb-10">{b.desc}</p>
                  <GlowingButton variant="none" small theme="silver" onClick={() => openInquiry(`Start ${b.name}`)} className="w-full py-4 uppercase tracking-widest font-black">Start Bundle</GlowingButton>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* Custom Section */}
        <section className="mb-40">
          <ScrollReveal>
            <div className="bg-amber-500/5 border border-amber-500/20 p-10 md:p-20 rounded-[60px] text-center relative overflow-hidden group shadow-2xl mx-4 md:mx-0 flex flex-col items-center">
              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none duration-1000"><Globe className="w-64 h-64 text-amber-500" /></div>
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-amber-500 mb-8 font-black tracking-widest uppercase">CUSTOM SOLUTIONS</h2>
              <h3 className="text-4xl md:text-8xl font-black mb-10 tracking-tighter uppercase leading-[0.9] text-white max-w-4xl text-center">CUSTOM <br className="md:hidden" /> ARCHITECTURE.</h3>
              <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-12 px-4 italic">For businesses that need personal hosting, high-volume architecture, or fully custom designs. Projects offered selectively to ensure elite quality.</p>
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => openInquiry("Request Custom Architecture")}
                  className="group flex items-center text-xs font-black uppercase tracking-[0.4em] text-white bg-slate-900 border border-white/10 px-10 py-5 rounded-full hover:bg-black transition-all shadow-3xl hover:border-amber-500/30 font-black"
                >
                  <Mail className="w-4 h-4 mr-3 text-amber-500 group-hover:scale-110 transition-transform" />
                  Request Custom Architecture
                </button>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* TRUST STRIP SECTION */}
        <section className="py-24 border-y border-white/5 bg-slate-900/50">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <ScrollReveal>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 mb-8">Process Over Promises</h2>
              <h3 className="text-3xl md:text-5xl font-black mb-12 uppercase tracking-tighter leading-tight text-white max-w-4xl mx-auto">Built With Structure. <br className="hidden md:block" /> Delivered With Precision.</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 border-t border-white/5 pt-12">
                {[
                  "Structured onboarding.",
                  "Strategy-first build process.",
                  "Revision framework included.",
                  "Managed launch support."
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 mb-2" />
                    <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 leading-relaxed">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        <footer className="pt-20 pb-10 flex flex-col md:flex-row justify-between items-center text-[9px] tracking-[0.3em] text-slate-700 font-black border-t border-white/5 space-y-4 uppercase font-black px-4">
           <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="group">
            <Instagram className="w-6 h-6 text-slate-700 group-hover:text-amber-500 transition-colors" />
           </a>
           <img src={TEXT_LOGO} alt="Callista Digital" className="h-3 w-auto opacity-30 brightness-200 grayscale" />
           <span>© 2014 - 2026</span>
        </footer>
      </main>
    </div>
  );

  return (
    <div className="font-sans antialiased bg-slate-950 w-full overflow-x-hidden selection:bg-amber-500 selection:text-slate-950">
      <ChatBot messages={chatMessages} setMessages={setChatMessages} />
      <InquiryModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        selectedPackage={selectedPackage} 
      />
      {view === 'home' ? <PageOne /> : <PageTwo />}
    </div>
  );
};

export default App;
