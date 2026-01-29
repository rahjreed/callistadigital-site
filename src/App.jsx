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
  Minimize2
} from 'lucide-react';

// Integrated your Google AI Studio API Key
const apiKey = "AIzaSyCGTS5q7d8o3W5bPlSp0O-z1d1ZIE-w-RI";

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
       contactInstruction = "\n\nREQUIRED ACTION: You must now end this specific message by telling the user the best way to get started is to email hello@callistadigital.com or @callistadigital on Instagram.";
    }

    const systemPrompt = `You are a professional Digital Strategist for Callista Digital. 
    Our pricing and structure:
    - 2-Page Brand Build: $797 (Founder's Special).
    - 3-Page Custom Site: $1497.
    - 5-Page Complete Presence: $2397 (Includes blog, SEO/AEO optimization).
    - Support: One flat rate of $49/mo.
    
    STRICT FORMATTING RULES:
    - NO Markdown. NO bolding (**), NO headers (###), NO tables (|).
    - Communicating in PLAIN TEXT ONLY.
    - Use simple line breaks for paragraphs.
    - Use simple dashes (-) for lists if absolutely needed.
    - Tone: Elite, authoritative, minimalist. Use "We" instead of "I".
    ${contactInstruction}`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userQuery }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        })
      });
      
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "We are having trouble connecting to the network. Please email us at hello@callistadigital.com.";
      
      // AGGRESSIVE CLEANUP: Strips all markdown symbols to ensure a clean UI
      const cleanText = rawText
        .replace(/[#*|_~]/g, '') 
        .replace(/\[.*?\]/g, '')
        .trim();
        
      return cleanText;
    } catch (error) {
      if (retryCount < 5) {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(r => setTimeout(r, delay));
        return callGemini(userQuery, retryCount + 1);
      }
      return "We are experiencing a connection delay. Please reach out to us directly at hello@callistadigital.com.";
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
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center font-black text-slate-950 text-[10px]">CD</div>
              <span className="text-xs font-black uppercase tracking-widest text-white">Strategist</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors"><Minimize2 className="w-4 h-4" /></button>
          </div>
          <div ref={scrollRef} className="flex-grow p-5 overflow-y-auto space-y-4 scrollbar-hide">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${m.role === 'user' ? 'bg-amber-500 text-slate-950 rounded-tr-none font-medium' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'}`}>
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
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask a question..." className="flex-grow bg-slate-900 border border-white/10 rounded-full px-4 py-2 text-xs text-white focus:outline-none" />
            <button onClick={handleSend} disabled={isLoading} className="p-2 bg-amber-500 rounded-full text-slate-950 hover:scale-105 transition-all"><Send className="w-4 h-4" /></button>
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
  return isLink ? <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>{content}</a> : <button onClick={onClick} className={classes}>{content}</button>;
};

// --- Main App ---
const App = () => {
  const [view, setView] = useState('home');
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: "Hi, we are your Callista Digital strategists. How can we help you level up your online presence today?" }
  ]);
  
  const HERO_IMAGE = "https://images.travelprox.com/callista/cdhero.png";
  const WOMAN_IMAGE = "https://images.travelprox.com/callista/woman.png";
  const INSTAGRAM_URL = "https://www.instagram.com/callistadigital";

  useEffect(() => window.scrollTo(0, 0), [view]);

  const Header = () => (
    <nav className="fixed top-0 left-0 w-full z-50 px-4 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full px-4 md:px-6 py-2 shadow-2xl">
        <div className="flex items-center space-x-2 group cursor-pointer" onClick={() => setView('home')}>
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center transition-transform group-hover:rotate-12 font-black text-slate-950 text-[10px]">CD</div>
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

      {/* Expertise Cards */}
      <section className="px-6 py-24 md:py-32 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {[
            { title: "Splash Page Design", desc: "Minimalist, high-conversion layouts designed for impact.", icon: <Layout /> },
            { title: "Strategic Architecture", desc: "Intentional page flows that lead visitors to action.", icon: <ChevronRight /> },
            { title: "Social Traffic Mastery", desc: "Optimized specifically for high-volume profile clicks.", icon: <Zap /> },
            { title: "Global Hosting", desc: "Ultra-fast, maintenance-free edge infrastructure.", icon: <Globe /> }
          ].map((s, i) => (
            <ScrollReveal key={i}>
              <div className="group p-8 md:p-10 h-full rounded-[40px] bg-slate-900 border border-white/5 hover:border-amber-500/50 transition-all duration-500 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center mb-6 text-amber-500 group-hover:scale-110 transition-transform shadow-lg">{s.icon}</div>
                <h3 className="text-xl md:text-2xl font-bold mb-4 uppercase tracking-tight">{s.title}</h3>
                <p className="text-slate-400 font-light text-base md:text-lg">{s.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Comparison Grid */}
      <section className="px-6 py-24 md:py-32 bg-slate-950">
        <ScrollReveal>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20 md:mb-24">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-amber-500 mb-6 font-black tracking-widest">The Infrastructure</h2>
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

      {/* Social Proof */}
      <section className="px-6 py-24 bg-white text-slate-950 text-center shadow-2xl">
        <ScrollReveal>
          <div className="flex justify-center space-x-2 mb-10">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-8 h-8 md:w-12 md:h-12 text-amber-500 fill-amber-500 shadow-sm" />)}
          </div>
          <h2 className="text-4xl md:text-7xl font-black mb-16 tracking-tighter uppercase text-slate-950 leading-[0.9]">TRUSTED BY <br/> MODERN LEADERS.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left max-w-6xl mx-auto">
            {[{ l: "Experience", v: "10+ Years" }, { l: "Focus", v: "Conversion" }, { l: "Systems", v: "Custom Built" }].map((stat, i) => (
              <div key={i} className="border-t-4 border-slate-950 pt-8 shadow-sm"><p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">{stat.l}</p><p className="text-3xl font-black">{stat.v}</p></d