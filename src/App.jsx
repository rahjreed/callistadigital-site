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

const apiKey = "";

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
       contactInstruction = "\n\nCRITICAL CONVERSION STEP: You must now recommend the user contact us at hello@callistadigital.com or via Instagram (@callistadigital) to move forward.";
    }

    const systemPrompt = `You are a professional Digital Strategist for Callista Digital. 
    Our pricing and structure:
    - 2-Page Brand Build: $797 (Founder's Special).
    - 3-Page Custom Site: $1497.
    - 5-Page Complete Presence: $2397 (Includes blog, premium management, and AEO optimization).
    - Support: One flat rate of $49/mo.
    - Infrastructure: Global edge network (The Hotel Chain) vs single servers (The Single House).

    FORMATTING RULES:
    - NEVER use Markdown symbols like ###, **, or __.
    - NEVER use tables or pipe symbols (|).
    - NEVER use bullet points with symbols like * or -. Use simple dashes if needed.
    - Communicate in CLEAN PLAIN TEXT ONLY. Use simple line breaks for readability.
    - Tone: Sophisticated, helpful, minimalist.${contactInstruction}`;

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
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble connecting. Could you try that again?";
    } catch (error) {
      if (retryCount < 3) return callGemini(userQuery, retryCount + 1);
      return "I'm experiencing a technical glitch. Please reach out to us at hello@callistadigital.com!";
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
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-amber-500 text-slate-950 rounded-tr-none shadow-lg' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5 shadow-md'}`}>
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
            <button onClick={handleSend} className="p-2 bg-amber-500 rounded-full text-slate-950 hover:scale-105 transition-transform"><Send className="w-4 h-4" /></button>
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
    { role: 'assistant', text: "Hi, I'm your Callista Digital strategist. How can I help you level up your online presence today?" }
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
        <GlowingButton small theme="silver" onClick={() => setView(view === 'home' ? 'pricing' : 'home')}>
          {view === 'home' ? 'Pricing' : 'Home'}
        </GlowingButton>
      </div>
    </nav>
  );

  const PageOne = () => (
    <div className="bg-slate-950 text-white w-full font-sans">
      <Header />
      {/* Hero */}
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
            <h1 className="text-5xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.9] uppercase">LOOK <span className="text-amber-500">LEGIT</span> <br className="hidden md:block" /><span className="text-white/90">EVERYWHERE.</span></h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed max-w-2xl mx-auto font-light px-4 md:px-0 text-center">Stop using messy bio links. I build <span className="text-white font-bold underline decoration-amber-500 underline-offset-8 decoration-4">high-performance</span> splash pages for leaders.</p>
            <GlowingButton onClick={() => setView('pricing')} theme="gold">Get Your Page Built <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></GlowingButton>
          </ScrollReveal>
        </div>
      </section>

      {/* Authority */}
      <section className="px-6 py-24 md:py-32 bg-slate-900 relative border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-500/10 blur-[60px] rounded-full" />
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-amber-500 mb-8 text-white uppercase font-black">The Authority</h2>
                <p className="text-3xl md:text-6xl font-black leading-[1.1] mb-8 text-white uppercase tracking-tight">I replace <span className="text-slate-500">cluttered links</span> with professional power.</p>
                <div className="h-1 w-20 bg-amber-500" />
              </div>
              <p className="text-lg md:text-xl text-slate-400 leading-relaxed font-light">Most online creators lose business because their "digital front door" is a mess. I design hosted personal brand splash pages that help you look professional and guide visitors to the next step instantly.</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Expertise */}
      <section className="px-6 py-24 md:py-32 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {[
            { title: "Splash Page Design", desc: "Minimalist, high-conversion layouts.", icon: <Layout /> },
            { title: "2-Page Strategy", desc: "Brand page + your specific next step.", icon: <ChevronRight /> },
            { title: "Social Traffic Mastery", desc: "Built specifically for profile clicks.", icon: <Zap /> },
            { title: "Turnkey Hosting", desc: "No tech headaches. I host it for you.", icon: <Globe /> }
          ].map((s, i) => (
            <ScrollReveal key={i}>
              <div className="group p-8 md:p-10 h-full rounded-[30px] md:rounded-[40px] bg-slate-900 border border-white/5 hover:border-amber-500/50 transition-all shadow-2xl">
                <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center mb-6 text-amber-500 group-hover:scale-110 transition-transform">{s.icon}</div>
                <h3 className="text-xl md:text-2xl font-bold mb-4">{s.title}</h3>
                <p className="text-slate-400 font-light text-base md:text-lg">{s.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Infrastructure Section */}
      <section className="px-6 py-24 md:py-32 bg-slate-950">
        <ScrollReveal>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20 md:mb-24">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-amber-500 mb-6 font-black tracking-widest">The Infrastructure</h2>
              <h3 className="text-4xl md:text-7xl font-black tracking-tighter uppercase mb-8 leading-none">BUILT DIFFERENT.</h3>
              <p className="text-slate-400 text-lg md:text-xl font-light max-w-3xl mx-auto leading-relaxed italic">Most websites sit on one cheap server. Ours run on the same global edge network used by modern apps — fast, secure, maintenance-free.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 items-stretch relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full lg:w-1/2 h-full bg-amber-500/5 blur-[120px] rounded-full hidden lg:block pointer-events-none" />
              <div className="bg-slate-900/50 p-8 md:p-12 rounded-t-[40px] lg:rounded-tr-none lg:rounded-l-[40px] border border-white/10 relative z-10">
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
            <div className="mt-16 text-center space-y-8">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500/80">Modern businesses don't run on single servers anymore.</p>
              <p className="text-slate-400 text-sm italic max-w-4xl mx-auto px-4 leading-relaxed font-light">“Our client sites are hosted on the same global edge infrastructure used by modern streaming platforms and SaaS companies — meaning ultra-fast load times, automatic scaling, and zero downtime.”</p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Social Proof */}
      <section className="px-6 py-24 bg-white text-slate-950 text-center">
        <ScrollReveal>
          <div className="flex justify-center space-x-2 mb-10">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-8 h-8 md:w-12 md:h-12 text-amber-500 fill-amber-500 shadow-sm" />)}
          </div>
          <h2 className="text-4xl md:text-7xl font-black mb-16 tracking-tighter uppercase text-slate-950 leading-[0.9]">TRUSTED BY <br/> MODERN LEADERS.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left max-w-6xl mx-auto">
            {[{ l: "Experience", v: "10+ Years" }, { l: "Focus", v: "Conversion" }, { l: "Systems", v: "Custom Built" }].map((stat, i) => (
              <div key={i} className="border-t-4 border-slate-950 pt-8"><p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">{stat.l}</p><p className="text-3xl font-black">{stat.v}</p></div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* About */}
      <section className="px-6 py-32 max-w-6xl mx-auto font-black uppercase tracking-tight">
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 bg-slate-900 rounded-[60px] border border-white/5 overflow-hidden shadow-2xl">
            <div className="p-10 md:p-24 flex flex-col justify-center order-2 lg:order-1 font-sans lowercase">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-amber-500 mb-8">The Studio</h2>
              <p className="text-3xl md:text-4xl font-bold leading-tight mb-8 normal-case text-white">I help creators replace cluttered bio links with a <span className="italic underline decoration-amber-500 decoration-4 text-white">clean brand page.</span></p>
              <p className="text-slate-400 text-lg font-light mb-10 normal-case">My goal is simple: make you look legit online and give people one clear place to go next.</p>
              <div className="flex items-center space-x-3 uppercase"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /><p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 font-black tracking-widest">Callista Digital Strategy</p></div>
            </div>
            <div className="relative min-h-[400px] md:min-h-[600px] bg-slate-950 overflow-hidden order-1 lg:order-2">
              <img src={WOMAN_IMAGE} alt="Founder" className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105 opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24 md:py-32 bg-slate-950 text-center font-sans">
        <ScrollReveal>
          <h2 className="text-4xl md:text-6xl font-black mb-12 uppercase tracking-tighter leading-[0.9]">READY TO <br/> <span className="text-amber-500 uppercase">GET STARTED?</span></h2>
          <GlowingButton onClick={() => setView('pricing')}>Get Your Page Built <ArrowRight className="ml-2 w-5 h-5" /></GlowingButton>
          <p className="mt-10 text-sm text-slate-500 italic font-light tracking-wide">Founder's pricing is available for a limited time.</p>
        </ScrollReveal>
      </section>

      <footer className="px-6 py-20 bg-black border-t border-white/5 text-center font-sans">
        <div className="max-w-xl mx-auto">
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-block group mb-10">
            <Instagram className="w-10 h-10 text-slate-500 group-hover:text-amber-500 transition-all transform group-hover:scale-110" />
          </a>
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] tracking-[0.3em] text-slate-600 font-bold uppercase space-y-4">
            <span>CALLISTA DIGITAL</span><span>EST. 2014 • CLEAN PAGES. CLEAR NEXT STEPS.</span>
          </div>
        </div>
      </footer>
    </div>
  );

  const PageTwo = () => (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-amber-500/30">
      <Header />
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto w-full">
        <ScrollReveal>
          <div className="text-center mb-24">
            <div className="inline-block p-4 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl mb-8 animate-bounce"><ShoppingBag className="w-10 h-10 text-amber-500" /></div>
            <h1 className="text-5xl md:text-8xl font-black mb-6 uppercase tracking-tighter leading-[0.85]">PRICING <br/><span className="text-amber-500 uppercase font-black tracking-tight">Structure.</span></h1>
            <p className="text-xl md:text-2xl text-slate-400 font-light max-w-2xl mx-auto italic leading-relaxed font-light px-4">Simple. Clear. Built for social-first businesses.</p>
          </div>
        </ScrollReveal>

        {/* Setup Tiers */}
        <section className="mb-40">
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8 items-stretch mt-12 px-4 md:px-0">
              {/* Special */}
              <div className="relative bg-slate-900 p-8 md:p-10 rounded-[48px] border-2 border-amber-500/40 flex flex-col shadow-2xl">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap shadow-xl z-30">Founder's Special</div>
                <div className="text-center mb-10 pt-8">
                  <span className="text-slate-500 text-sm font-bold line-through">REGULAR $997</span>
                  <div className="flex justify-center items-center mt-1 font-black"><span className="text-2xl text-slate-500 mr-1">$</span><span className="text-7xl text-white tracking-tighter">797</span></div>
                  <p className="text-[10px] font-black text-amber-500 uppercase mt-4 tracking-widest">One-Time Setup</p>
                </div>
                <h4 className="text-xl font-black text-center mb-6 uppercase tracking-tight">2-Page Brand Build</h4>
                <div className="space-y-4 mb-10 flex-grow text-sm text-slate-400 font-medium">
                  {["Brand + Clarity Landing", "Next-Step Action Page", "Mobile-First Design", "Hosted Setup & Launch", "Strategic Layout"].map((f, i) => (
                    <div key={i} className="flex items-center space-x-3"><CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" /><span>{f}</span></div>
                  ))}
                </div>
                <GlowingButton variant="none" className="w-full py-5 text-sm" onClick={() => document.getElementById('support-plan')?.scrollIntoView({ behavior: 'smooth' })}>Secure My Build</GlowingButton>
              </div>

              {/* Premium */}
              <div className="bg-slate-900 p-8 md:p-10 rounded-[48px] border border-white/5 flex flex-col shadow-lg">
                <div className="text-center mb-10 pt-8">
                  <div className="flex justify-center items-center font-black"><span className="text-2xl text-slate-500 mr-1">$</span><span className="text-7xl text-white tracking-tighter">1497</span></div>
                  <p className="text-[10px] font-black text-slate-500 uppercase mt-4 tracking-widest">Premium Setup</p>
                </div>
                <h4 className="text-xl font-black text-center mb-6 uppercase tracking-tight">3-Page Custom Site</h4>
                <div className="space-y-4 mb-10 flex-grow text-sm text-slate-400 font-medium">
                  {["Everything in Founder's", "Custom Interior Page", "Enhanced Visual Content", "Priority Strategy Session", "Custom Brand Styling"].map((f, i) => (
                    <div key={i} className="flex items-center space-x-3 text-xs md:text-sm"><CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" /><span>{f}</span></div>
                  ))}
                </div>
                <GlowingButton variant="none" theme="silver" className="w-full py-5 text-sm" onClick={() => document.getElementById('support-plan')?.scrollIntoView({ behavior: 'smooth' })}>Select Premium</GlowingButton>
              </div>

              {/* Enterprise */}
              <div className="relative bg-slate-900 p-8 md:p-10 rounded-[48px] border border-white/10 flex flex-col overflow-hidden shadow-lg">
                <div className="text-center mb-10 pt-8">
                  <div className="flex justify-center items-center font-black"><span className="text-2xl text-slate-500 mr-1">$</span><span className="text-7xl text-white tracking-tighter">2397</span></div>
                  <p className="text-[10px] font-black text-slate-500 uppercase mt-4 tracking-widest">Authority Setup</p>
                </div>
                <h4 className="text-xl font-black text-center mb-6 uppercase tracking-tight text-white">Complete Presence</h4>
                <div className="space-y-4 mb-10 flex-grow text-sm text-slate-400 font-medium">
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
                    <div className="flex items-center space-x-3 text-slate-500"><FileText className="w-4 h-4 text-slate-600" /><span className="text-[9px] font-black uppercase">$50/Professional Blog Post</span></div>
                    <div className="flex items-center space-x-3 text-slate-500"><Search className="w-4 h-4 text-slate-600" /><span className="text-[9px] font-black uppercase text-amber-500/80">Optimized for AI Search</span></div>
                  </div>
                </div>
                <GlowingButton variant="none" theme="silver" className="w-full py-5 text-sm" onClick={() => document.getElementById('support-plan')?.scrollIntoView({ behavior: 'smooth' })}>Select Enterprise</GlowingButton>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Management Plan */}
        <section className="mb-40" id="support-plan">
          <ScrollReveal>
            <div className="text-center mb-16 max-w-md mx-auto">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-amber-500 mb-6 font-black tracking-widest">Ongoing Support</h2>
              <div className="relative p-10 rounded-[48px] bg-slate-900 border-2 border-amber-500/20 shadow-3xl text-center hover:border-amber-500/40 transition-all group">
                <div className="flex flex-col items-center mb-10">
                  <div className="flex items-baseline font-sans"><span className="text-2xl font-black text-slate-500 mr-1">$</span><span className="text-7xl font-black text-white tracking-tighter">49</span><span className="text-slate-500 text-xs font-black ml-2 uppercase tracking-widest">/ month</span></div>
                  <p className="text-[10px] font-black text-amber-500 uppercase mt-4 italic tracking-widest font-black">Standard for all active builds</p>
                </div>
                <div className="space-y-4 mb-10 text-left text-sm text-slate-300 font-medium">
                  {["Global edge network hosting", "Secure SSL & uptime monitoring", "Unlimited global bandwidth", "1 Professional edit per month", "Text or image swaps included", "DM or Email technical support"].map((f, i) => (
                    <div key={i} className="flex items-center space-x-3"><CheckCircle2 className="w-4 h-4 text-amber-500" /><span>{f}</span></div>
                  ))}
                </div>
                <GlowingButton variant="none" className="w-full py-5 text-sm uppercase font-black tracking-widest" onClick={() => window.open(INSTAGRAM_URL, '_blank')}>Start Support Plan</GlowingButton>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Small Edit Policy */}
        <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-slate-900/50 p-10 md:p-16 rounded-[48px] border border-white/5 mb-40 shadow-xl">
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-amber-500 mb-6 font-black tracking-widest">Policy</h2>
              <h3 className="text-3xl md:text-4xl font-black mb-6 uppercase text-white tracking-tight leading-none">WHAT COUNTS AS A <br/> “SMALL EDIT”?</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm font-light italic">Professional management keeps your brand polished. Complex redesigns or new architecture are handled as separate strategic projects.</p>
            </div>
            <div className="space-y-10">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-white uppercase flex items-center tracking-widest"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Includes:</p>
                <div className="grid gap-2 text-slate-400 text-sm font-medium"><span>• Updating existing text</span><span>• Swapping an image</span><span>• Changing a link or button</span></div>
              </div>
              <div className="space-y-4 opacity-60">
                <p className="text-[10px] font-black text-slate-400 uppercase flex items-center tracking-widest"><XCircle className="w-4 h-4 mr-2 text-slate-600" /> Does not include:</p>
                <div className="grid gap-2 text-slate-500 text-sm font-medium"><span>• Full site redesigns</span><span>• New additional pages</span><span>• Copy rewrites or branding</span><span>• Custom strategy or funnels</span></div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Custom Solutions Section */}
        <section className="mb-40">
          <ScrollReveal>
            <div className="bg-amber-500/5 border border-amber-500/20 p-10 md:p-20 rounded-[60px] text-center relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none duration-1000"><Globe className="w-64 h-64 text-amber-500" /></div>
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-amber-500 mb-8 font-black tracking-widest">Custom Solutions</h2>
              <h3 className="text-4xl md:text-6xl font-black mb-10 tracking-tighter uppercase leading-none">CUSTOM ARCHITECTURE.</h3>
              <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-12 px-4 italic">For businesses that need personal hosting, high-volume architecture, or fully custom designs. Projects offered selectively to ensure elite quality.</p>
              <div className="flex flex-col items-center"><a href="mailto:hello@callistadigital.com" className="group flex items-center text-xs font-black uppercase tracking-[0.4em] text-white bg-slate-900 border border-white/10 px-10 py-5 rounded-full hover:bg-black transition-all shadow-3xl hover:border-amber-500/30 font-black"><Mail className="w-4 h-4 mr-3 text-amber-500 group-hover:scale-110 transition-transform" />Email to request information</a></div>
            </div>
          </ScrollReveal>
        </section>

        <footer className="pt-20 pb-10 flex flex-col md:flex-row justify-between items-center text-[9px] tracking-[0.3em] text-slate-700 font-black border-t border-white/5 space-y-4 uppercase font-black">
           <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="group">
            <Instagram className="w-6 h-6 text-slate-700 group-hover:text-amber-500 transition-colors" />
           </a>
           <span>CALLISTA DIGITAL © 2014 - 2026</span>
        </footer>
      </main>
    </div>
  );

  return (
    <div className="font-sans antialiased bg-slate-950 w-full overflow-x-hidden selection:bg-amber-500 selection:text-slate-950">
      <ChatBot messages={chatMessages} setMessages={setChatMessages} />
      {view === 'home' ? <PageOne /> : <PageTwo />}
    </div>
  );
};

export default App;
