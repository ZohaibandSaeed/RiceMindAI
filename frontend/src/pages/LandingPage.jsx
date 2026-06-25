import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, BrainCircuit, Droplets, Leaf, ArrowRight, CheckCircle2, ChevronRight, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function LandingPage() {
  const { token, login, register, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState(null); // 'login' | 'signup' | null
  const [error, setError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form states
  const [loginData, setLoginData] = useState({ username_or_email: '', password: '' });
  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    full_name: '',
    role: 'buyer',
    phone: '',
    address: '',
    password: ''
  });

  const navigate = useNavigate();

  if (token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary text-xl font-medium">
        Redirecting to Dashboard...
      </div>
    );
  }

  const extractError = (err) => {
    if (err.response?.data?.detail) {
      const detail = err.response.data.detail;
      if (typeof detail === 'string') return detail;
      if (Array.isArray(detail)) {
        return detail.map(d => d.msg).join(', ');
      }
      return JSON.stringify(detail);
    }
    return err.message || "An unexpected error occurred. Please try again.";
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFormLoading(true);
    try {
      const user = await login(loginData.username_or_email, loginData.password);
      setAuthModal(null);
      if (!user.profile_complete) {
        navigate('/onboarding');
      } else {
        navigate(user.role === 'seller' ? '/seller/dashboard' : '/buyer/dashboard');
      }
    } catch (err) {
      setError(extractError(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate username (no spaces allowed)
    if (/\s/.test(signupData.username)) {
      setError("Username cannot contain spaces.");
      return;
    }

    // Validate phone number (exactly 11 digits)
    if (!/^\d{11}$/.test(signupData.phone)) {
      setError("Phone number must be exactly 11 digits (e.g. 03001234567).");
      return;
    }

    setFormLoading(true);
    try {
      const user = await register(signupData);
      setAuthModal(null);
      if (!user.profile_complete) {
        navigate('/onboarding');
      } else {
        navigate(user.role === 'seller' ? '/seller/dashboard' : '/buyer/dashboard');
      }
    } catch (err) {
      setError(extractError(err));
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-zinc-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed w-full z-40 bg-background/80 backdrop-blur-md border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <Leaf className="w-8 h-8 text-accent" />
              <span className="font-serif text-2xl font-bold text-primary tracking-tight">RiceMindAI</span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-zinc-600 hover:text-primary transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-zinc-600 hover:text-primary transition-colors font-medium">How it Works</a>
              <div className="flex items-center gap-4 ml-4">
                <button 
                  onClick={() => { setError(null); setAuthModal('login'); }}
                  className="text-primary font-medium hover:text-primary/80 transition-colors"
                >
                  Log In
                </button>
                <button 
                  onClick={() => { setError(null); setAuthModal('signup'); }}
                  className="bg-primary text-background px-5 py-2.5 rounded-full font-medium hover:bg-primary/90 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-primary p-2">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-b border-primary/10 p-4 shrink-0">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-zinc-600 block px-2 py-1">Features</a>
              <a href="#how-it-works" className="text-zinc-600 block px-2 py-1">How it Works</a>
              <hr className="border-primary/10" />
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => { setMobileMenuOpen(false); setError(null); setAuthModal('login'); }}
                  className="w-full text-left px-2 py-1 text-primary font-medium"
                >
                  Log In
                </button>
                <button 
                  onClick={() => { setMobileMenuOpen(false); setError(null); setAuthModal('signup'); }}
                  className="w-full bg-primary text-background px-4 py-3 rounded-xl font-medium text-center"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-4">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-medium text-sm mb-8 border border-accent/20 shadow-sm">
              <BrainCircuit className="w-4 h-4" /> B2B & B2C AI-Powered Marketplace
            </span>
          </motion.div>
          
          <motion.h1 
            initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif font-bold text-primary mb-8 leading-tight tracking-tight max-w-4xl mx-auto"
          >
            The Future of Rice Trading is <span className="text-accent italic">Intelligent</span>
          </motion.h1>
          
          <motion.p 
            initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-600 mb-12 max-w-2xl mx-auto font-sans leading-relaxed"
          >
            Buy and sell rice with complete confidence. Our platform uses advanced AI to validate quality and pricing, with built-in secure escrow for guaranteed peace of mind.
          </motion.p>
          
          <motion.div 
            initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <button 
              onClick={() => { setError(null); setAuthModal('signup'); }}
              className="bg-primary text-background px-8 py-4 rounded-full font-medium hover:bg-primary/90 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 text-lg group"
            >
              Join the Network <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => { setError(null); setAuthModal('login'); }}
              className="bg-white border text-primary px-8 py-4 rounded-full font-medium hover:bg-zinc-50 transition-all text-lg shadow-sm hover:shadow-md"
            >
              Sign In to Account
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-primary mb-4">Why Risk It Anywhere Else?</h2>
            <p className="text-zinc-600 text-lg max-w-2xl mx-auto">RiceMindAI replaces uncertainty with data-driven trust, protecting both buyers and sellers at every step.</p>
          </div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {/* Feature 1 */}
            <motion.div variants={fadeIn} className="bg-background rounded-3xl p-8 border border-primary/5 hover:shadow-xl transition-shadow group">
              <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">AI Quality Validation</h3>
              <p className="text-zinc-600 leading-relaxed">
                Our AI scans uploaded images to instantly score grain quality, detect rice types, and validate fair market pricing before any listing goes live.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={fadeIn} className="bg-background rounded-3xl p-8 border border-primary/5 hover:shadow-xl transition-shadow group">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">Secure Escrow Wallet</h3>
              <p className="text-zinc-600 leading-relaxed">
                Payments are securely held in our platform's escrow. Funds are only released to the seller once the buyer confirms successful delivery.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={fadeIn} className="bg-background rounded-3xl p-8 border border-primary/5 hover:shadow-xl transition-shadow group">
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Droplets className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">Automated Contracts</h3>
              <p className="text-zinc-600 leading-relaxed">
                Goodbye paperwork. Digital contracts are auto-generated for every order. Both parties sign securely on-platform before any money moves.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-primary text-background relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-background mb-4">How RiceMindAI Works</h2>
            <p className="text-white/70 text-lg">A simple, transparent process for both sides of the market.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 lg:gap-24">
            {/* For Sellers */}
            <div>
              <h3 className="text-2xl font-bold text-accent mb-8 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-sm">1</span> For Sellers
              </h3>
              <div className="space-y-6">
                {[
                  { title: "List Your Inventory", desc: "Upload details and photos of your rice stock." },
                  { title: "AI Price & Quality Scan", desc: "Our system validates your pricing against the market to build buyer trust." },
                  { title: "Approve Orders & Send Contract", desc: "Review incoming requests and generate a digital contract in one click." },
                  { title: "Ship & Get Paid", desc: "Ship the order knowing payment is secured in escrow. Get paid on delivery." }
                ].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1"><CheckCircle2 className="w-6 h-6 text-accent/80" /></div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{step.title}</h4>
                      <p className="text-white/70">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* For Buyers */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">2</span> For Buyers
              </h3>
              <div className="space-y-6">
                {[
                  { title: "Browse Market", desc: "Find exactly what you need with advanced filters by type and quality score." },
                  { title: "Order Securely", desc: "Place an order for any AI-validated listing." },
                  { title: "Sign Contract & Pay", desc: "Review the seller's terms. Your wallet payment is safely locked in escrow." },
                  { title: "Receive & Confirm", desc: "Get your rice. Only confirm delivery when satisfied, releasing funds to the seller." }
                ].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1"><CheckCircle2 className="w-6 h-6 text-white/50" /></div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{step.title}</h4>
                      <p className="text-white/70">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-background text-center px-4">
        <h2 className="text-4xl font-serif font-bold text-primary mb-6">Ready to Experience the Future?</h2>
        <p className="text-zinc-600 text-lg mb-10 max-w-xl mx-auto">
          Join trusted buyers and sellers on RiceMindAI today.
        </p>
        <button 
          onClick={() => { setError(null); setAuthModal('signup'); }}
          className="bg-accent text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-accent/90 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
        >
          Create Your Free Account
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white/50 py-12 text-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-accent" />
            <span className="font-serif text-lg font-bold text-white tracking-tight">RiceMindAI</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          </div>
          <p>© {new Date().getFullYear()} RiceMindAI. All rights reserved.</p>
        </div>
      </footer>

      {/* Modern Custom Auth Modal */}
      <AnimatePresence>
        {authModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAuthModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-zinc-200 overflow-hidden z-10"
            >
              {/* Top Row / Tabs */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4">
                  <button 
                    onClick={() => { setError(null); setAuthModal('login'); }}
                    className={`text-xl font-bold font-serif transition ${authModal === 'login' ? 'text-primary border-b-2 border-primary' : 'text-zinc-400'}`}
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => { setError(null); setAuthModal('signup'); }}
                    className={`text-xl font-bold font-serif transition ${authModal === 'signup' ? 'text-primary border-b-2 border-primary' : 'text-zinc-400'}`}
                  >
                    Register
                  </button>
                </div>
                <button 
                  onClick={() => setAuthModal(null)}
                  className="p-1 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-800 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                  {error}
                </div>
              )}

              {/* Login Form */}
              {authModal === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Username or Email</label>
                    <input 
                      type="text" 
                      required 
                      value={loginData.username_or_email}
                      onChange={(e) => setLoginData({ ...loginData, username_or_email: e.target.value })}
                      className="w-full p-3 border border-zinc-200 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                      placeholder="Enter username or email"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Password</label>
                    <input 
                      type="password" 
                      required 
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="w-full p-3 border border-zinc-200 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                      placeholder="••••••••"
                    />
                  </div>
                  <button 
                    disabled={formLoading} 
                    type="submit" 
                    className="w-full py-3 bg-primary text-background font-medium rounded-xl hover:bg-primary/95 transition shadow-lg disabled:opacity-70 mt-6"
                  >
                    {formLoading ? "Signing In..." : "Sign In"}
                  </button>
                </form>
              )}

              {/* Signup Form */}
              {authModal === 'signup' && (
                <form onSubmit={handleSignupSubmit} className="space-y-3 overflow-y-auto max-h-[70vh] pr-1">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Username</label>
                    <input 
                      type="text" 
                      required 
                      value={signupData.username}
                      onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                      className="w-full p-2.5 border border-zinc-200 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                      placeholder="johndoe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Email</label>
                    <input 
                      type="email" 
                      required 
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      className="w-full p-2.5 border border-zinc-200 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      value={signupData.full_name}
                      onChange={(e) => setSignupData({ ...signupData, full_name: e.target.value })}
                      className="w-full p-2.5 border border-zinc-200 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">I want to...</label>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => setSignupData({ ...signupData, role: 'buyer' })}
                        className={`flex-1 py-2 px-3 border rounded-xl font-medium text-sm transition ${signupData.role === 'buyer' ? 'bg-primary/5 border-primary text-primary' : 'hover:bg-zinc-50'}`}
                      >
                        Buy Rice
                      </button>
                      <button 
                        type="button"
                        onClick={() => setSignupData({ ...signupData, role: 'seller' })}
                        className={`flex-1 py-2 px-3 border rounded-xl font-medium text-sm transition ${signupData.role === 'seller' ? 'bg-primary/5 border-primary text-primary' : 'hover:bg-zinc-50'}`}
                      >
                        Sell Rice
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Phone</label>
                    <input 
                      type="text" 
                      required 
                      value={signupData.phone}
                      onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                      className="w-full p-2.5 border border-zinc-200 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                      placeholder="+92 300 1234567"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Address</label>
                    <input 
                      type="text" 
                      required 
                      value={signupData.address}
                      onChange={(e) => setSignupData({ ...signupData, address: e.target.value })}
                      className="w-full p-2.5 border border-zinc-200 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                      placeholder="Address or Market location"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Password</label>
                    <input 
                      type="password" 
                      required 
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      className="w-full p-2.5 border border-zinc-200 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                      placeholder="••••••••"
                    />
                  </div>
                  <button 
                    disabled={formLoading} 
                    type="submit" 
                    className="w-full py-3 bg-primary text-background font-medium rounded-xl hover:bg-primary/95 transition shadow-lg disabled:opacity-70 mt-4"
                  >
                    {formLoading ? "Creating Account..." : "Create Account"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
