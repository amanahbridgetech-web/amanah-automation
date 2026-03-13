import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { 
  LayoutDashboard, Users, CreditCard, DollarSign, MessageCircle, Calendar, Utensils, Smartphone, 
  ShieldCheck, LogOut, Search, Check, X, Send, Bot, CheckCircle2, Lock, Mail, ArrowRight, ArrowLeft, 
  MapPin, Plus, Clock, Settings, Activity, Eye, EyeOff, BookOpen, AlertCircle, Download, Upload, 
  HelpCircle, MessageSquareWarning, Copy, RefreshCw, Bell, CalendarDays, Receipt, Landmark, Map, 
  Building2, Save, Store, Printer, FileText, Share2, FileSpreadsheet, QrCode, PauseCircle, Info, 
  Menu, ShieldAlert, Trash2, ArrowUpRight, Wifi, Timer, Zap, ExternalLink, Link2, Database
} from 'lucide-react';

let savedConfig = null; let localFbConfigString = '';
try { const stored = localStorage.getItem('amanah_firebase_config'); if (stored) { localFbConfigString = stored; savedConfig = JSON.parse(stored); } } catch(e) {}
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : savedConfig;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'amanah-saas-prod';

let app, auth, firestoreDb;
try { if (firebaseConfig && firebaseConfig.apiKey) { app = initializeApp(firebaseConfig); auth = getAuth(app); firestoreDb = getFirestore(app); } } catch (e) { console.warn("Firebase Init Skipped."); }

const BRAND = { company: "Amanah Bridge Technologies", product: "Amanah Automation", colors: { primary: "#064e3b", accent: "#f59e0b" }, hq: "Bengaluru, Karnataka, India", email: "amanahbridgetech@gmail.com" };

const CSS = {
  card: "bg-white rounded-2xl p-5 shadow-sm border border-gray-100",
  btn: "bg-[#064e3b] text-white py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-md hover:bg-emerald-800 active:scale-95 transition-all flex items-center justify-center gap-2",
  btnRed: "bg-red-600 text-white py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-md hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2",
  inp: "w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm font-bold outline-none focus:border-[#064e3b] focus:ring-2 focus:ring-emerald-100 text-gray-900 transition-all",
  lbl: "block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5"
};

const Inp = ({ className = '', ...props }) => <input className={`${CSS.inp} ${className}`} {...props} />;
const Btn = ({ className = '', variant = 'primary', children, ...props }) => <button className={`${variant === 'red' ? CSS.btnRed : CSS.btn} ${className}`} {...props}>{children}</button>;
const Card = ({ children, className = "", onClick }) => <div onClick={onClick} className={`${CSS.card} ${onClick ? 'active:scale-95 cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all' : ''} ${className}`}>{children}</div>;
const Badge = ({ children, type = 'default' }) => { 
  const t = { success: 'bg-emerald-100 text-emerald-800', warning: 'bg-amber-100 text-amber-800', danger: 'bg-red-100 text-red-800', trial: 'bg-blue-100 text-blue-800'}; 
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${t[type] || 'bg-gray-100 text-gray-800'}`}>{children}</span>; 
};

const getFY = (dStr) => { if(!dStr) return 'Unknown'; const d = new Date(dStr); if(isNaN(d.getTime())) return 'Unknown'; const y = d.getFullYear(); return d.getMonth() >= 3 ? `${y}-${(y+1).toString().slice(-2)}` : `${y-1}-${y.toString().slice(-2)}`; };
const formatINR = (amt) => isNaN(Number(amt)) ? '₹0' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(amt));
const triggerToast = (msg, typ = 'success') => window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: msg, type: typ }}));
const copyToClipboard = (txt) => { const t = document.createElement("textarea"); t.value = txt; t.style.position = "fixed"; document.body.appendChild(t); t.focus(); t.select(); try { document.execCommand('copy'); triggerToast("Copied to clipboard!"); } catch(err){} document.body.removeChild(t); };
const getIndianInvoiceNumber = (seq, dStr) => { const d = new Date(dStr||new Date()); const y = d.getFullYear(); const m = d.getMonth(); return `ABT/${m>=3?y.toString().slice(-2):(y-1).toString().slice(-2)}-${m>=3?(y+1).toString().slice(-2):y.toString().slice(-2)}/${String(seq).padStart(3,'0')}`; };
const safeFileName = (str) => String(str||'doc').replace(/[^a-z0-9]/gi, '_').toLowerCase();

const generatePDF = (elId, fname) => { 
  if(window.html2pdf) { window.html2pdf().set({ margin: 0.2, filename: fname, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } }).from(document.getElementById(elId)).save(); } 
  else { triggerToast("PDF Engine loading. Try again in 2s.", "warning"); }
};

function useLiveTime(tz) {
  const [time, setTime] = useState('');
  useEffect(() => {
    if(!tz){ setTime('--:--'); return; }
    const updateTime = () => { try { Intl.DateTimeFormat(undefined,{timeZone:tz}); setTime(new Intl.DateTimeFormat('en-US',{timeZone:tz,hour:'2-digit',minute:'2-digit',hour12:true}).format(new Date())); } catch(e){ setTime('--:--'); } };
    updateTime(); const i = setInterval(updateTime, 60000); return () => clearInterval(i);
  }, [tz]); return time;
}

const INITIAL_DB = {
  adminSettings: { aiProvider: 'Google Gemini', aiModel: 'gemini-2.5-flash', apiKey: '', temperature: 0.1, maxTokens: 300, status: 'Awaiting Key', webhookUrl: 'https://api.amanahbridge.com/v1/meta/webhook', verifyToken: 'amanah_secure_2026', supportPhone: '+919876543210', supportEmail: 'amanahbridgetech@gmail.com', invCompany: 'Amanah Bridge Technologies Pvt Ltd', invAddress: 'Bengaluru, Karnataka, India', invTaxId: 'LUT-2025-26-0001', invEmail: 'amanahbridgetech@gmail.com', firebaseConfig: localFbConfigString, razorpayKeyId: '', razorpayKeySecret: '', razorpayWebhookSecret: '' },
  invoiceSequence: 1, 
  users: [{ id: 'usr_admin', email: 'amanahbridgetech@gmail.com', password: 'admin', role: 'admin', name: 'System Admin' }],
  pricing: [
    { id: 1, country: 'UAE', currency: 'AED', setupFee: 0, annualFee: 1465, discountPercent: 0, tz: 'Asia/Dubai', rateINR: 22.5, bank: { accountName: 'Amanah Bridge FZCO', accountNum: '100029384756', routing: '042000013', swift: 'FABKAEAD', bankName: 'First Abu Dhabi Bank', address: 'Dubai, UAE', type: 'Business', upiId: '', upiPhone: '' } },
    { id: 5, country: 'India', currency: 'INR', setupFee: 0, annualFee: 12000, discountPercent: 50, tz: 'Asia/Kolkata', rateINR: 1.0, bank: { accountName: 'Amanah Bridge', accountNum: 'IND001122', routing: 'IFSC: HDFC0001234', swift: 'HDFCINGB', bankName: 'HDFC Bank', address: 'Bengaluru, India', type: 'Business', upiId: 'amanah@upi', upiPhone: '+919876543210' } }
  ],
  restaurants: [], payments: [], invoices: [], menus: [], reservations: [], conversations: [], messages: [], supportConversations: [], supportMessages: [], coupons: []
};

function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    const handler = (e) => { const id = Math.random().toString(36).substr(2, 9); setToasts(p => [...p, { id, ...e.detail }]); setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500); };
    window.addEventListener('app-toast', handler); return () => window.removeEventListener('app-toast', handler);
  }, []);
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[99999] flex flex-col gap-2 pointer-events-none w-full max-w-sm px-4">
      {toasts.map(t => (
        <div key={t.id} className={`px-5 py-3.5 rounded-2xl shadow-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all transform ${t.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'}`}>
          {t.type === 'success' && <CheckCircle2 size={18} className="text-emerald-400" />}{t.type === 'error' && <ShieldAlert size={18} className="text-white" />}{t.type === 'warning' && <AlertCircle size={18} className="text-amber-400" />}<span className="text-center">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

function LegalModal({ type, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50"><h2 className="font-black text-lg text-gray-900 flex items-center gap-2"><ShieldAlert size={20} className="text-[#064e3b]"/> {type === 'tos' ? 'Terms of Service' : 'Privacy Policy'}</h2><button onClick={onClose} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"><X size={18}/></button></div>
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-gray-700 leading-relaxed">
          {type === 'tos' ? ( <><p><strong>1. Acceptance:</strong> By using Amanah Automation, you agree to these terms.</p><p><strong>2. Services:</strong> We provide an AI tool interfacing with Meta Cloud API. We don't own your data.</p><p><strong>3. Meta 24-Hour Rule:</strong> You must strictly use pre-approved templates outside the 24-hour window.</p><p><strong>4. Fees:</strong> Setup fees are non-refundable. Meta template fees are billed directly by Meta.</p><p><strong>5. Liability:</strong> We are not liable for AI hallucinations or lost bookings.</p></> ) : ( <><p><strong>1. Compliance:</strong> We comply with DPDP Act 2023 and GDPR.</p><p><strong>2. Data Collection:</strong> We temporarily process customer chat logs to provide AI conversational services.</p><p><strong>3. Retention:</strong> Financial invoices are kept 8 years as per tax law.</p><p><strong>4. Third-Party:</strong> We use Meta API and Google Gemini API infrastructure.</p><p><strong>5. Deletion:</strong> You can permanently delete your account directly from your settings dashboard.</p></> )}
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end"><Btn onClick={onClose} className="px-8">Acknowledge</Btn></div>
      </div>
    </div>
  );
}

export default function App() {
  const [db, setDb] = useState(INITIAL_DB); 
  const dbRef = useRef(db); 
  useEffect(() => { dbRef.current = db; }, [db]);
  const [dbLoaded, setDbLoaded] = useState(false); const [firebaseUser, setFirebaseUser] = useState(null); const [syncStatus, setSyncStatus] = useState('connecting'); 
  const [authUser, setAuthUser] = useState(null); const [isSignUpMode, setIsSignUpMode] = useState(false); const [loginEmail, setLoginEmail] = useState('');
  const [showLegal, setShowLegal] = useState(null); const [showLoginPassword, setShowLoginPassword] = useState(false); const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showForgotPwd, setShowForgotPwd] = useState(false); const [forgotStep, setForgotStep] = useState(0); const [forgotEmail, setForgotEmail] = useState(''); const [forgotPhone, setForgotPhone] = useState(''); const [forgotNewPwd, setForgotNewPwd] = useState(''); const [resetUserTarget, setResetUserTarget] = useState(null);

  useEffect(() => { const s = document.createElement('script'); s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"; s.async = true; document.body.appendChild(s); }, []);

  useEffect(() => {
    if (!auth) { setDbLoaded(true); setSyncStatus('offline'); return; }
    let isMounted = true; const fallbackTimer = setTimeout(() => { if (isMounted && !dbLoaded) { setDbLoaded(true); setSyncStatus('offline'); } }, 3500);
    const initAuth = async () => { try { if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) { await signInWithCustomToken(auth, __initial_auth_token); } else { await signInAnonymously(auth); } } catch(e) { setSyncStatus('offline'); } };
    initAuth(); const unsub = onAuthStateChanged(auth, (user) => { if (isMounted) { setFirebaseUser(user); clearTimeout(fallbackTimer); } }); return () => { isMounted = false; clearTimeout(fallbackTimer); unsub(); };
  }, []);

  useEffect(() => {
    if (!auth || !firebaseUser) return; 
    const collections = Object.keys(INITIAL_DB); let loadedCount = 0;
    const unsubs = collections.map(col => {
      return onSnapshot(doc(firestoreDb, 'artifacts', appId, 'public', 'data', 'amanah_data', col), (snap) => {
        if (snap.exists()) { setDb(prev => ({ ...prev, [col]: snap.data().val })); } else { setDoc(doc(firestoreDb, 'artifacts', appId, 'public', 'data', 'amanah_data', col), { val: INITIAL_DB[col] }); }
        loadedCount++; if (loadedCount >= collections.length) { setDbLoaded(true); setSyncStatus('online'); }
      }, (err) => { setDbLoaded(true); setSyncStatus('offline'); });
    });
    return () => unsubs.forEach(u => u());
  }, [firebaseUser]);

  const updateDb = (col, newData) => { const newDb = { ...dbRef.current, [col]: newData }; dbRef.current = newDb; setDb(newDb); if (firestoreDb && firebaseUser) { setDoc(doc(firestoreDb, 'artifacts', appId, 'public', 'data', 'amanah_data', col), { val: newData }, { merge: true }); } };

  const handleLogin = (e) => { e.preventDefault(); const pwd = e.target.password.value; const user = (db?.users || INITIAL_DB.users).find(u => String(u.email || '').toLowerCase() === String(loginEmail).toLowerCase().trim()); if (!user) return triggerToast('Account not found. Switch to Sign Up.', 'error'); if (user.password && user.password !== pwd) return triggerToast('Incorrect password.', 'error'); setAuthUser(user); };
  const handleForgotVerifyEmail = (e) => { e.preventDefault(); const user = (db?.users || INITIAL_DB.users).find(u => String(u.email || '').toLowerCase() === String(forgotEmail).toLowerCase().trim()); if (!user) return triggerToast('No account found.', 'error'); setResetUserTarget(user); setForgotStep(1); };
  const handleForgotVerifyPhone = (e) => { e.preventDefault(); const cIn = String(forgotPhone).replace(/[^0-9]/g, ''); let isValid = false; if (resetUserTarget.role === 'admin') { if (cIn.slice(-10) === String(db?.adminSettings?.supportPhone || '').replace(/[^0-9]/g, '').slice(-10)) isValid = true; } else { const cR = (db?.restaurants || INITIAL_DB.restaurants).filter(r => (resetUserTarget.restaurantIds || []).includes(r.id)); for (const r of cR) { if (cIn.slice(-10) === String(r.phone || '').replace(/[^0-9]/g, '').slice(-10)) isValid = true; } } if (isValid) { setForgotStep(2); } else { triggerToast('Incorrect phone.', 'error'); } };
  const handleForgotResetPwd = (e) => { e.preventDefault(); const nP = String(forgotNewPwd).trim(); if(nP.length < 5) return triggerToast('Password must be 5+ chars.', 'error'); updateDb('users', (db?.users || INITIAL_DB.users).map(u => u.id === resetUserTarget.id ? { ...u, password: nP } : u)); triggerToast('Password reset successfully!'); setLoginEmail(resetUserTarget.email); setShowForgotPwd(false); setForgotStep(0); setForgotEmail(''); setForgotPhone(''); setForgotNewPwd(''); setResetUserTarget(null); };

  const handleSignUp = (e) => {
    e.preventDefault(); const fd = new FormData(e.target);
    const em = String(fd.get('email')||'').toLowerCase().trim(); const pw = String(fd.get('password')||'').trim(); const rn = String(fd.get('restaurantName')||'').trim(); const co = String(fd.get('country')||'').trim(); const ci = String(fd.get('city')||'').trim(); const ph = String(fd.get('phone')||'').trim();
    if (!em || !pw || !rn || !co || !ci || !ph) return triggerToast("All fields are strictly required.", "error"); if (!ph.startsWith('+')) return triggerToast("Phone must start with '+'", "error"); if (pw.length < 5) return triggerToast("Password must be 5+ characters.", "error"); if ((db?.users || INITIAL_DB.users).find(u => String(u.email || '').toLowerCase() === em)) return triggerToast('Email already registered! Please Sign In.', 'error'); if (!fd.get('consent')) return triggerToast('You must agree to the Terms & Privacy Policy.', 'error');
    const uId = `usr_${Date.now()}`; const rId = `R${Date.now()}`; const te = new Date(); te.setDate(te.getDate() + 3);
    const nU = { id: uId, email: em, password: pw, role: 'client', name: rn, restaurantIds: [rId], consent_timestamp: new Date().toISOString() };
    const nR = { id: rId, name: rn, country: co, city: ci, address: '', phone: ph, status: 'Trial', plan: 'Annual', branches: 1, expiryDate: te.toISOString(), hasPaidSetup: false, waConnected: false, aiEnabled: true, reservationMode: 'Internal', externalUrl: '', lastVerified: 'Never', wabaId: '', phoneId: '', sysAccessToken: '', businessInfo: '', mapsLink: '', hours: '', totalTables: 10, maxPax: 4, deliveryLink1: '', deliveryLink2: '', deliveryLink3: '' };
    updateDb('users', [...(dbRef.current.users || []), nU]); updateDb('restaurants', [...(dbRef.current.restaurants || []), nR]); setAuthUser(nU); triggerToast('Account created! Welcome to 3-Day Free Trial.');
  };
  const handleLogout = () => { setAuthUser(null); setLoginEmail(''); };

  if (!dbLoaded) { return (<div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#064e3b] text-white"><Bot size={48} className="animate-bounce mb-4 opacity-80"/><h2 className="font-black tracking-widest uppercase text-sm">Connecting to Amanah...</h2></div>); }
  
  return (
    <>
      <ToastContainer />
      {!authUser ? (
        <div className="min-h-[100dvh] bg-gray-50 flex flex-col justify-center p-4 sm:p-6 font-sans relative">
          <style>{`@media print { body * { visibility: hidden; } .print-container, .print-container * { visibility: visible; } .print-container { position: absolute; left: 0; top: 0; width: 100vw; height: auto; margin: 0; padding: 0; box-shadow: none !important; border: none !important; } .no-print { display: none !important; } }`}</style>
          {showLegal && <LegalModal type={showLegal} onClose={() => setShowLegal(null)} />}
          {showForgotPwd && (
            <div className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4"><div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"><div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50"><h2 className="font-black text-lg text-gray-900 flex items-center gap-2"><ShieldCheck size={20} className="text-[#064e3b]"/> Reset Password</h2><button onClick={() => setShowForgotPwd(false)} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"><X size={18}/></button></div><div className="p-6">{forgotStep === 0 && (<form onSubmit={handleForgotVerifyEmail} className="space-y-4"><Inp type="email" value={forgotEmail} onChange={(e)=>setForgotEmail(e.target.value)} placeholder="name@company.com" required /><Btn type="submit" className="w-full bg-blue-600">Continue</Btn></form>)}{forgotStep === 1 && (<form onSubmit={handleForgotVerifyPhone} className="space-y-4"><Inp type="tel" value={forgotPhone} onChange={(e)=>setForgotPhone(e.target.value)} placeholder="WhatsApp (+971...)" required /><Btn type="submit" className="w-full bg-emerald-600">Verify Identity</Btn></form>)}{forgotStep === 2 && (<form onSubmit={handleForgotResetPwd} className="space-y-4"><Inp type="password" value={forgotNewPwd} onChange={(e)=>setForgotNewPwd(e.target.value)} placeholder="New Password" required /><Btn type="submit" className="w-full">Save New Password</Btn></form>)}</div></div></div>
          )}
          <div className="w-full max-w-md mx-auto bg-white p-6 sm:p-8 rounded-3xl shadow-xl relative z-10 no-print">
            <div className="text-center mb-8"><div className="w-16 h-16 mx-auto rounded-2xl bg-[#064e3b] shadow-lg flex items-center justify-center mb-4"><Bot size={32} className="text-white" /></div><h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-1">{BRAND.company}</h1><p className="text-emerald-600 font-bold uppercase text-[10px] tracking-widest">{BRAND.product}</p></div>
            {!isSignUpMode ? (
              <form onSubmit={handleLogin} className="space-y-4"><div className="relative"><Mail className="absolute left-4 top-4 text-gray-400" size={18} /><Inp type="email" value={loginEmail} onChange={(e)=>setLoginEmail(e.target.value)} className="pl-11" placeholder="name@company.com" required /></div><div className="relative"><Lock className="absolute left-4 top-4 text-gray-400" size={18} /><Inp type={showLoginPassword ? "text" : "password"} name="password" className="pl-11 pr-11" placeholder="Password" required /><button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors">{showLoginPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div><div className="flex justify-end px-1"><button type="button" onClick={(e) => { e.preventDefault(); setShowForgotPwd(true); }} className="text-xs font-bold text-gray-500 hover:text-[#064e3b] transition-colors">Forgot Password?</button></div><Btn type="submit" className="w-full mt-2">Sign In <ArrowRight size={16} /></Btn><p className="text-center text-xs text-gray-500 mt-4 font-medium">New restaurant? <button type="button" onClick={()=>setIsSignUpMode(true)} className="text-blue-600 font-bold hover:underline">Start 3-Day Free Trial</button></p></form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-3"><Inp type="text" name="restaurantName" placeholder="Restaurant Name" required /><div className="grid grid-cols-2 gap-3"><select name="country" className={`${CSS.inp} bg-white`} required><option value="">Country</option>{(db?.pricing || INITIAL_DB.pricing).map(p => <option key={p.id} value={p.country}>{p.country}</option>)}</select><Inp type="text" name="city" placeholder="City" required /></div><Inp type="tel" name="phone" placeholder="WhatsApp (e.g. +971...)" required /><Inp type="email" name="email" placeholder="Admin Email" required /><div className="relative"><Inp type={showSignupPassword ? "text" : "password"} name="password" className="pr-11" placeholder="Create Password" required /><button type="button" onClick={() => setShowSignupPassword(!showSignupPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors">{showSignupPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div><div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-start gap-3 mt-2"><input type="checkbox" name="consent" id="consent" className="mt-1 shrink-0 w-4 h-4 cursor-pointer" required /><label htmlFor="consent" className="text-[10px] text-blue-900 leading-tight">By signing up, I agree to the <span onClick={(e) => { e.preventDefault(); setShowLegal('tos'); }} className="font-bold underline cursor-pointer text-blue-700">Terms of Service</span> & <span onClick={(e) => { e.preventDefault(); setShowLegal('privacy'); }} className="font-bold underline cursor-pointer text-blue-700">Privacy Policy</span>.</label></div><Btn type="submit" className="w-full bg-blue-600 mt-2">Create Account</Btn><p className="text-center text-xs text-gray-500 mt-4 font-medium">Already registered? <button type="button" onClick={() => setIsSignUpMode(false)} className="text-[#064e3b] font-bold hover:underline">Sign In</button></p></form>
            )}
          </div>
        </div>
      ) : authUser.role === 'admin' ? (
        <AdminApp db={db} updateDb={updateDb} dbRef={dbRef} syncStatus={syncStatus} onLogout={handleLogout} /> 
      ) : (
        <ClientApp db={db} updateDb={updateDb} dbRef={dbRef} authUser={authUser} syncStatus={syncStatus} onLogout={handleLogout} />
      )}
    </>
  );
}

function AdminApp({ db, updateDb, dbRef, syncStatus, onLogout }) {
  const [activeTab, setActiveTab] = useState('Overview'); const [showNotifs, setShowNotifs] = useState(false); const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const today = new Date(); const alerts = (db?.restaurants || INITIAL_DB.restaurants).filter(r => { if (!r.expiryDate) return false; const diff = Math.ceil((new Date(r.expiryDate) - today) / 86400000); return diff >= 0 && diff <= 7; });
  const NAV = [{ id: 'Overview', icon: LayoutDashboard }, { id: 'Clients', icon: Users }, { id: 'Finance', icon: Landmark }, { id: 'Settings', icon: Settings }];

  return (
    <div className="flex h-[100dvh] bg-gray-50 font-sans relative overflow-hidden">
      <div className={`bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 transition-all duration-300 z-40 shadow-sm no-print absolute md:relative h-full ${isSidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20'}`}>
        <div><div className="h-16 flex items-center border-b border-gray-100 px-4 md:justify-center lg:justify-start lg:px-6 cursor-pointer hover:bg-gray-50" onClick={() => setIsSidebarOpen(!isSidebarOpen)}><Bot className="text-[#064e3b] shrink-0" size={28} /><div className={`ml-3 overflow-hidden ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}><span className="font-black text-gray-900 tracking-tight block leading-tight truncate">{BRAND.company}</span><span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate block">Admin Portal</span></div></div>
          <div className="p-3 space-y-2 mt-2">{NAV.map(t => { const Icon = t.icon; return (<button key={t.id} onClick={() => { setActiveTab(t.id); if(window.innerWidth < 768) setIsSidebarOpen(false); }} className={`w-full flex items-center p-3 rounded-xl transition-all ${activeTab === t.id ? 'bg-emerald-50 text-[#064e3b]' : 'text-gray-500 hover:bg-gray-50'} ${!isSidebarOpen && 'justify-center lg:justify-start'}`}><Icon size={22} className={`shrink-0 ${activeTab === t.id ? 'stroke-[2.5px]' : ''}`} /><span className={`ml-3 font-bold text-sm truncate ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}>{t.id}</span></button>); })}</div>
        </div>
        <div className="p-3 border-t border-gray-100 space-y-2"><div className={`flex items-center p-3 rounded-xl ${syncStatus === 'online' ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'} ${!isSidebarOpen && 'justify-center lg:justify-start'}`} title={syncStatus === 'online' ? 'Cloud Sync Active' : 'Offline Mode'}><Wifi size={16} className={`shrink-0 ${syncStatus === 'online' && 'animate-pulse'}`}/><span className={`ml-3 font-black text-[10px] uppercase tracking-widest truncate ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}>{syncStatus === 'online' ? 'Sync Active' : 'Offline'}</span></div><button onClick={onLogout} className={`w-full flex items-center p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all ${!isSidebarOpen && 'justify-center lg:justify-start'}`}><LogOut size={20} className="shrink-0" /><span className={`ml-3 font-bold text-sm truncate ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}>Log Out</span></button></div>
      </div>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/20 z-30 md:hidden no-print" onClick={() => setIsSidebarOpen(false)}></div>}
      <div className="flex-1 flex flex-col h-[100dvh] overflow-hidden relative w-full">
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 shadow-sm no-print"><div className="flex items-center gap-3"><button className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg" onClick={() => setIsSidebarOpen(true)}><Menu size={24}/></button><h1 className="font-black text-xl text-gray-900 tracking-tight">{activeTab}</h1></div><div className="flex items-center gap-3"><button onClick={() => setShowNotifs(!showNotifs)} className="p-2.5 bg-gray-50 text-gray-600 rounded-full relative hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm active:scale-95"><Bell size={18}/>{alerts.length > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}</button></div>
          {showNotifs && (<div className="absolute top-16 right-4 sm:right-6 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 text-gray-800"><h3 className="font-black text-[10px] uppercase tracking-widest text-gray-400 p-3 border-b border-gray-100 mb-2">Expiry Alerts</h3>{alerts.length === 0 ? <p className="text-xs text-gray-500 p-3 text-center">No upcoming expiries.</p> : <div className="max-h-60 overflow-y-auto space-y-1 pr-1">{alerts.map(a => { const isExpired = new Date(a.expiryDate) < today; return (<div key={a.id} className={`p-3 rounded-xl text-xs font-medium border ${isExpired ? 'bg-red-50 text-red-800 border-red-100' : 'bg-amber-50 text-amber-800 border-amber-100'}`}><strong className="block mb-0.5">{a.name} ({a.city})</strong> {isExpired ? 'Expired on' : 'Expires on'} {new Date(a.expiryDate).toLocaleDateString('en-GB')}</div>); })}</div>}</div>)}
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50 flex justify-center print:p-0 print:bg-white"><div className="w-full max-w-5xl pb-12 print:w-full print:max-w-none">
            <div className="no-print">{activeTab === 'Overview' && <AdminHome db={db} setActiveTab={setActiveTab} />}{activeTab === 'Clients' && <AdminClients db={db} updateDb={updateDb} />}</div>
            {activeTab === 'Finance' && <AdminFinance db={db} updateDb={updateDb} dbRef={dbRef} />}
            <div className="no-print">{activeTab === 'Settings' && <AdminSettings db={db} updateDb={updateDb} />}</div>
        </div></div>
      </div>
    </div>
  );
}

function AdminHome({ db, setActiveTab }) {
  const currentFY = getFY(new Date()); const lastFYDate = new Date(); lastFYDate.setFullYear(lastFYDate.getFullYear() - 1); const lastFY = getFY(lastFYDate);
  const calculateFinancials = (fyTarget) => { let s = 0, a = 0, f = 0; (db?.invoices || INITIAL_DB.invoices).forEach(inv => { if(getFY(inv.date) === fyTarget) { const gross = (Number(inv.amount) || 0) * (Number(inv.rateINR) || 1); const feeRate = inv.feeRate !== undefined ? Number(inv.feeRate) : 0.01; if(String(inv.type || '').includes('Setup')) { s += gross * 0.66; a += gross * 0.33; } else { a += gross; } f += (gross * feeRate); } }); return { setup: s, annual: a, gross: s + a, totalFees: f, takeHome: s + a - f }; };
  const currStats = calculateFinancials(currentFY); const lastStats = calculateFinancials(lastFY);
  const aiCost = (db?.messages || INITIAL_DB.messages).filter(m => m.sender === 'AI').length * 0.15; 
  const countryCounts = (db?.restaurants || INITIAL_DB.restaurants).reduce((acc, c) => { if(c.status === 'Active' || c.status === 'Trial') { acc[c.country || 'Unknown'] = (acc[c.country || 'Unknown'] || 0) + 1; } return acc; }, {});
  const pendingCount = (db?.payments || INITIAL_DB.payments).filter(p => p.status === 'Pending').length;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4"><Card className="bg-emerald-50 border-emerald-100 flex flex-col items-center justify-center py-6 shadow-sm"><h3 className="text-3xl font-black text-emerald-900">{(db?.restaurants || []).length}</h3><p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mt-1">Active Branches</p></Card><Card className="bg-indigo-50 border-indigo-100 flex flex-col items-center justify-center py-6 shadow-sm"><h3 className="text-3xl font-black text-indigo-900">{(db?.users || []).filter(u => u.role === 'client').length}</h3><p className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest mt-1">Unique Clients</p></Card></div>
      <Card className="border-2 border-gray-100 shadow-sm"><div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4"><div className="flex items-center gap-2"><DollarSign size={20} className="text-blue-600"/><h3 className="font-black text-gray-800 text-lg">Financial Ledger (INR)</h3></div></div><div className="space-y-6"><div><div className="flex justify-between items-center mb-3"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">This Year (FY {currentFY})</p></div><div className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-gray-600 font-medium">Gross Revenue</span><span className="font-mono font-bold text-gray-900 text-base">{formatINR(currStats.gross)}</span></div><div className="flex justify-between text-xs"><span className="text-gray-400 pl-2">↳ Setup Fees</span><span className="font-mono text-gray-500">{formatINR(currStats.setup)}</span></div><div className="flex justify-between text-xs"><span className="text-gray-400 pl-2">↳ Annual Fees</span><span className="font-mono text-gray-500">{formatINR(currStats.annual)}</span></div><div className="flex justify-between text-red-500"><span className="font-medium">Payment Processing Fees</span><span className="font-mono">- {formatINR(currStats.totalFees)}</span></div><div className="flex justify-between text-amber-600 text-xs mt-2"><span className="font-medium flex items-center gap-1"><Activity size={12}/> Est. Gemini API Cost</span><span className="font-mono">- {formatINR(aiCost)}</span></div><div className="flex justify-between pt-4 border-t border-gray-100 mt-2"><span className="font-black text-gray-900 text-base">Net Take Home</span><span className="font-black font-mono text-xl text-emerald-600">{formatINR(currStats.takeHome)}</span></div></div></div><div className="pt-5 border-t border-gray-100 opacity-60"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Last Year (FY {lastFY})</p><div className="flex justify-between text-sm"><span className="font-medium text-gray-600">Gross Revenue</span><span className="font-mono font-bold text-gray-600">{formatINR(lastStats.gross)}</span></div><div className="flex justify-between text-sm mt-2"><span className="font-bold text-gray-800">Net Take Home</span><span className="font-black font-mono text-gray-800">{formatINR(lastStats.takeHome)}</span></div></div></div></Card>
      {pendingCount > 0 && (<Card onClick={() => setActiveTab('Finance')} className="bg-amber-50 border-amber-200 cursor-pointer hover:bg-amber-100 hover:shadow-md transition-all group"><div className="flex justify-between items-center"><div><h3 className="font-black text-amber-900 text-sm flex items-center gap-2"><CreditCard size={18}/> Action Required: {pendingCount} Pending Payment</h3><p className="text-xs text-amber-800 mt-1">Clients are waiting for you to verify their transaction to come online.</p></div><ArrowRight className="text-amber-600 group-hover:translate-x-1 transition-transform" /></div></Card>)}
      <Card><h3 className="font-black text-gray-800 uppercase tracking-widest text-[10px] mb-4 flex items-center gap-1"><Map size={14}/> Global Active Clients</h3><div className="space-y-3">{Object.keys(countryCounts).length === 0 ? <p className="text-xs text-gray-500">No active clients yet.</p> : Object.entries(countryCounts).map(([country, count]) => (<div key={country} className="flex justify-between items-center text-sm border-b border-gray-50 last:border-0 pb-2"><span className="font-medium text-gray-700">{country}</span><Badge type="default">{count}</Badge></div>))}</div></Card>
    </div>
  );
}

function AdminClients({ db, updateDb }) {
  const [editing, setEditing] = useState(null); const [search, setSearch] = useState(''); const [filter, setFilter] = useState('All'); const [delConfirm, setDelConfirm] = useState(false);
  const handleSave = (e) => { e.preventDefault(); const fd = Object.fromEntries(new FormData(e.target)); updateDb('restaurants', (db?.restaurants || INITIAL_DB.restaurants).map(c => c.id === editing.id ? { ...c, ...fd } : c)); setEditing(null); triggerToast("Updated."); };
  const handleDelete = () => { updateDb('restaurants', (db?.restaurants||INITIAL_DB.restaurants).filter(r=>r.id!==editing.id)); setEditing(null); setDelConfirm(false); triggerToast("Client Deleted","error"); };
  if (editing) {
    const p = (db?.pricing || INITIAL_DB.pricing).find(x => x.country === editing.country) || { annualFee: 0, currency: 'USD' };
    return (
      <Card className="space-y-5 border-2 border-emerald-500 shadow-xl"><div className="flex justify-between items-center border-b pb-4"><div><h2 className="font-black text-xl text-gray-900">Manage Account</h2><p className="text-[10px] font-bold text-gray-500 uppercase mt-1">{editing.name}</p></div><button onClick={() => {setEditing(null);setDelConfirm(false);}} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={18}/></button></div><div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl mb-4"><p className="text-[10px] font-black text-emerald-800 uppercase mb-1.5">Renewal Details</p><div className="flex justify-between items-end text-sm"><span className="font-bold text-emerald-900 text-base">{new Date(editing.expiryDate || new Date()).toLocaleDateString('en-GB')}</span><span className="font-black font-mono text-emerald-700 text-lg">{p.annualFee} {p.currency}</span></div></div><form onSubmit={handleSave} className="space-y-5"><div><label className={CSS.lbl}>Status</label><select name="status" defaultValue={editing.status} className={CSS.inp}><option value="Active">Active (Bot Online)</option><option value="Trial">Trial (3-Day Free)</option><option value="Inactive">Inactive (Paused)</option><option value="Expired">Expired (Bot Offline)</option><option value="Pending">Pending (Payment Auth)</option></select></div><div><label className={`${CSS.lbl} flex items-center gap-1`}><CalendarDays size={12}/> Expiry Date</label><input type="date" name="expiryDate" defaultValue={editing.expiryDate ? new Date(editing.expiryDate).toISOString().split('T')[0] : ''} className={CSS.inp} required /></div><Btn type="submit" className="w-full">Force Update Settings</Btn>{!delConfirm ? (<button type="button" onClick={()=>setDelConfirm(true)} className="w-full text-red-600 py-3 font-bold text-xs uppercase border border-red-200 rounded-xl hover:bg-red-50 transition-colors">Delete Account</button>) : (<Btn type="button" onClick={handleDelete} variant="red" className="w-full">Confirm Deletion</Btn>)}</form></Card>
    );
  }
  const today = new Date();
  const clients = (db?.restaurants || INITIAL_DB.restaurants).filter(c => {
    const s = String(search||'').toLowerCase().trim(); const matchS = !s || String(c.name||'').toLowerCase().includes(s) || String(c.city||'').toLowerCase().includes(s) || String(c.phone||'').includes(s) || String(c.country||'').toLowerCase().includes(s); let matchF = true;
    if (filter !== 'All') { if (filter === 'Expiring') { const d = Math.ceil((new Date(c.expiryDate) - today) / 86400000); matchF = d >= 0 && d <= 7; } else if (filter === 'Other') matchF = ['Pending', 'Inactive'].includes(c.status); else matchF = c.status === filter; } return matchS && matchF;
  });
  return (
    <div className="space-y-4"><div className="flex flex-col sm:flex-row gap-3"><div className="relative flex-1"><Search className="absolute left-3 top-3 text-gray-400" size={16}/><input type="text" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} className={`${CSS.inp} pl-9`} /></div><select value={filter} onChange={e=>setFilter(e.target.value)} className={CSS.inp}><option value="All">All Status</option><option value="Active">Active</option><option value="Trial">Trial</option><option value="Expiring">Expiring (7d)</option><option value="Expired">Expired</option><option value="Other">Other</option></select></div>{clients.length === 0 ? <p className="text-center text-gray-500 p-10 font-bold bg-white rounded-3xl border border-gray-100 shadow-sm">No clients found.</p> : clients.map(c => <AdminClientCard key={c.id} client={c} db={db} setEditing={setEditing} />)}</div>
  );
}

function AdminClientCard({ client, db, setEditing }) {
  const p = (db?.pricing || INITIAL_DB.pricing).find(x => x.country === client.country) || { tz: 'UTC' }; const time = useLiveTime(p.tz);
  const u = (db?.users || INITIAL_DB.users).find(x => (x.restaurantIds||[]).includes(client.id)); const cleanPhone = String(client.phone || '').replace(/[^0-9]/g, '');
  const aiMsgs = (db?.messages || INITIAL_DB.messages).filter(m => m.restaurant_id === client.id && m.sender === 'AI').length;
  return (
    <Card className="cursor-pointer hover:border-emerald-300 transition-colors hover:shadow-md" onClick={() => setEditing(client)}>
      <div className="flex justify-between items-start"><div className="flex-1"><h3 className="font-black text-lg leading-tight mb-1">{client.name} <span className="text-xs font-medium text-gray-500">({client.city})</span></h3><p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Exp: {client.expiryDate?new Date(client.expiryDate).toLocaleDateString('en-GB'):'N/A'}</p><div className="flex items-center gap-2 mt-3"><div className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md flex items-center gap-1"><Clock size={12}/> {time}</div><div className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md flex items-center gap-1"><Activity size={12}/> {aiMsgs} Replies</div></div></div><Badge type={client.status === 'Active' ? 'success' : client.status === 'Trial' ? 'trial' : client.status === 'Pending' ? 'warning' : 'danger'}>{client.status}</Badge></div>
      <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100"><button onClick={(e) => { e.stopPropagation(); copyToClipboard(client.phone); window.open(`https://wa.me/${cleanPhone}`, '_blank'); }} className="flex-1 bg-[#EFEAE2] text-[#075E54] py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-[#DCF8C6] transition-colors shadow-sm"><MessageCircle size={16}/> WhatsApp</button><button onClick={(e) => { e.stopPropagation(); copyToClipboard(u?.email); window.open(`mailto:${u?.email}`, '_blank'); }} className="flex-1 bg-blue-50 text-blue-600 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-blue-100 transition-colors shadow-sm"><Mail size={16}/> Email</button></div>
    </Card>
  );
}

function AdminFinance({ db, updateDb, dbRef }) {
  const [editingCountry, setEditingCountry] = useState(null); const [viewInvoice, setViewInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); const [selectedFY, setSelectedFY] = useState('All');
  const [adminTxnRef, setAdminTxnRef] = useState({}); const [adminTxnFee, setAdminTxnFee] = useState({});

  const handleApprove = (payment, customRef) => {
    const cDb = dbRef.current; const client = (cDb?.restaurants || INITIAL_DB.restaurants).find(c => c.id === payment.restaurantId) || {};
    const cUser = (cDb?.users || INITIAL_DB.users).find(u => (u.restaurantIds||[]).includes(client.id)); const pricing = (cDb?.pricing || INITIAL_DB.pricing).find(p => p.country === client.country);
    const seq = cDb.invoiceSequence || 1; const invId = getIndianInvoiceNumber(seq, new Date().toISOString());
    const feeRate = adminTxnFee[payment.id] !== undefined ? Number(adminTxnFee[payment.id]) : 0.01;
    
    const newInv = { id: invId, paymentId: payment.id, restaurantId: client.id, restaurantName: client.name || 'Unknown', restaurantCity: client.city || '', restaurantCountry: client.country || '', clientPhone: client.phone || '', clientEmail: cUser?.email || '', amount: payment.amount, currency: payment.currency, type: payment.type, date: new Date().toISOString(), refId: customRef || payment.refId || 'CASH/WIRE', rateINR: pricing?.rateINR || 1, feeRate, couponUsed: payment.couponUsed || 'None' };
    
    updateDb('invoices', [...(cDb.invoices || []), newInv]); updateDb('invoiceSequence', seq + 1);
    updateDb('payments', (cDb?.payments || INITIAL_DB.payments).map(p => p.id === payment.id ? { ...p, status: 'Approved' } : p));
    updateDb('restaurants', (cDb?.restaurants || INITIAL_DB.restaurants).map(c => { if (c.id === payment.restaurantId) { const exp = new Date(c.expiryDate || new Date()); const base = exp < new Date() ? new Date() : new Date(exp.getTime()); return { ...c, status: 'Active', expiryDate: new Date(base.setFullYear(base.getFullYear() + 1)).toISOString().split('T')[0], aiEnabled: true, hasPaidSetup: true }; } return c; }));
    setAdminTxnRef(p => { const n = {...p}; delete n[payment.id]; return n; }); setAdminTxnFee(p => { const n = {...p}; delete n[payment.id]; return n; }); triggerToast(`Invoice ${invId} generated.`);
  };

  const handleSaveCountry = (e) => {
    e.preventDefault(); const fd = new FormData(e.target);
    const newP = { id: editingCountry.id || Date.now(), country: String(fd.get('country')), currency: String(fd.get('currency')), setupFee: Number(fd.get('setupFee')), annualFee: Number(fd.get('annualFee')), discountPercent: Number(fd.get('discountPercent') || 0), tz: String(fd.get('tz')), rateINR: Number(fd.get('rateINR')), bank: { accountName: String(fd.get('accountName')), accountNum: String(fd.get('accountNum')), routing: String(fd.get('routing')), swift: String(fd.get('swift')), bankName: String(fd.get('bankName')), address: String(fd.get('address')), type: String(fd.get('type')), upiId: String(fd.get('upiId')||''), upiPhone: String(fd.get('upiPhone')||'') } };
    if (editingCountry.id) updateDb('pricing', (db?.pricing || INITIAL_DB.pricing).map(p => p.id === editingCountry.id ? newP : p)); else updateDb('pricing', [...(db?.pricing || INITIAL_DB.pricing), newP]);
    setEditingCountry(null); triggerToast("Pricing saved.");
  };

  if (editingCountry) {
    return (
      <Card className="space-y-4 border-2 border-emerald-500 shadow-xl no-print">
         <div className="flex justify-between items-center border-b border-gray-100 pb-3"><h2 className="font-black text-lg text-gray-900">{editingCountry.id ? 'Edit' : 'Add'} Country Billing</h2><button onClick={() => setEditingCountry(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><X size={16}/></button></div>
        <form onSubmit={handleSaveCountry} className="space-y-4 text-sm text-gray-800">
          <div className="grid grid-cols-2 gap-3"><div><label className={CSS.lbl}>Country</label><Inp name="country" defaultValue={editingCountry.country || ''} required /></div><div><label className={CSS.lbl}>Currency</label><Inp name="currency" defaultValue={editingCountry.currency || ''} required /></div></div>
          <div className="grid grid-cols-2 gap-3"><div><label className={CSS.lbl}>Setup Fee</label><Inp name="setupFee" type="number" defaultValue={editingCountry.setupFee??0} required /></div><div><label className={CSS.lbl}>Annual Fee</label><Inp name="annualFee" type="number" defaultValue={editingCountry.annualFee??399} required /></div></div>
          <div className="grid grid-cols-2 gap-3"><div><label className={CSS.lbl}>Discount % (e.g. 50)</label><Inp name="discountPercent" type="number" defaultValue={editingCountry.discountPercent??0} required /></div><div><label className={CSS.lbl}>INR Rate</label><Inp name="rateINR" type="number" step="0.01" defaultValue={editingCountry.rateINR} required /></div></div>
          <div><label className={CSS.lbl}>Timezone (e.g. Asia/Dubai)</label><Inp name="tz" defaultValue={editingCountry.tz} required /></div>
          <h3 className="font-black text-xs uppercase tracking-widest pt-4 border-t border-gray-100 mt-4">Local Bank & UPI Details</h3>
          <div className="space-y-3"><Inp name="bankName" defaultValue={editingCountry.bank?.bankName} placeholder="Bank Name" required /><Inp name="accountName" defaultValue={editingCountry.bank?.accountName} placeholder="Account Name" required /><Inp name="accountNum" defaultValue={editingCountry.bank?.accountNum} placeholder="Account Number" required /><Inp name="routing" defaultValue={editingCountry.bank?.routing} placeholder="Routing / Sort Code / IFSC" required /><Inp name="swift" defaultValue={editingCountry.bank?.swift} placeholder="SWIFT / BIC Code (Optional)" /><Inp name="address" defaultValue={editingCountry.bank?.address} placeholder="Bank Address" required /><div className="grid grid-cols-2 gap-3"><Inp name="upiId" defaultValue={editingCountry.bank?.upiId} placeholder="UPI ID (e.g. name@upi) - Optional" /><Inp name="upiPhone" defaultValue={editingCountry.bank?.upiPhone} placeholder="UPI Phone - Optional" /></div><select name="type" defaultValue={editingCountry.bank?.type||'Business'} className={CSS.inp}><option value="Business">Business Account</option><option value="Individual">Individual Account</option></select></div>
          <Btn type="submit" className="w-full mt-4">Save Configuration</Btn>
        </form>
      </Card>
    );
  }

  const invs = (db?.invoices || INITIAL_DB.invoices).filter(i => { const s = String(searchTerm||'').toLowerCase().trim(); return (!s || String(i.restaurantName||'').toLowerCase().includes(s) || String(i.id||'').toLowerCase().includes(s) || String(i.refId||'').toLowerCase().includes(s)) && (selectedFY === 'All' || getFY(i.date) === selectedFY); }).sort((a,b) => new Date(b.date||0) - new Date(a.date||0));
  const pending = (db?.payments || INITIAL_DB.payments).filter(p => p.status === 'Pending');
  const fyOptions = ['All', getFY(new Date()), getFY(new Date(new Date().setFullYear(new Date().getFullYear()-1)))];

  const handleExportInvoices = () => {
    if (invs.length === 0) return triggerToast("No invoices to export.", "error");
    let csv = "Invoice ID,Date,Client Name,City,Country,Description,Gross Amount,Currency,Exch Rate (INR),Gross INR,Fee Type,Fee Deduction (INR),Net Received INR,Bank Ref ID\n";
    invs.forEach(inv => { const r = Number(inv.rateINR) || 1; const a = Number(inv.amount) || 0; const g = a * r; const f = inv.feeRate !== undefined ? Number(inv.feeRate) : 0.01; const fL = f === 0.01 ? '1%' : f === 0.02 ? '2%' : f === 0.03 ? '3%' : '0%'; const fD = g * f; const n = g - fD; const sD = inv.date ? new Date(inv.date).toLocaleDateString('en-GB') : 'Unknown'; csv += `${inv.id},${sD},"${inv.restaurantName}","${inv.restaurantCity}","${inv.restaurantCountry}","${inv.type}",${a},${inv.currency},${r},${g.toFixed(2)},"${fL}",${fD.toFixed(2)},${n.toFixed(2)},"${inv.refId}"\n`; });
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `Amanah_Invoices_${selectedFY.replace('/','-')}.csv`; a.click();
  };

  if (viewInvoice) {
    const taxHtml = db?.adminSettings?.invTaxId ? `<p class="text-xs text-gray-500 mt-1">Tax ID/LUT: ${db.adminSettings.invTaxId}</p>` : '';
    const issueDate = viewInvoice.date ? new Date(viewInvoice.date).toLocaleDateString('en-GB') : 'N/A'; const cleanFileName = safeFileName(`Invoice_${viewInvoice.id}`);
    return (
      <div className="fixed inset-0 bg-gray-900 sm:bg-black/60 z-[200] flex justify-center sm:items-center overflow-y-auto p-0 sm:p-6">
        <div className="bg-white w-full max-w-2xl sm:rounded-3xl shadow-2xl flex flex-col h-full sm:h-auto">
          <div className="p-4 bg-gray-50 flex justify-between items-center border-b border-gray-200 shrink-0"><h3 className="font-bold text-gray-800 flex items-center gap-2"><Receipt size={18}/> Invoice Details</h3><button onClick={() => setViewInvoice(null)} className="p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors"><X size={16}/></button></div>
          <div id="invoice-pdf-content" className="p-8 sm:p-10 space-y-8 text-gray-800 bg-white flex-1 overflow-y-auto">
            <div className="flex justify-between items-start border-b-2 border-gray-100 pb-8"><div><h1 className="text-3xl sm:text-4xl font-black text-[#064e3b] mb-1">INVOICE</h1><p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{viewInvoice.id}</p></div><div className="text-right"><h2 className="font-black text-lg sm:text-xl">{db?.adminSettings?.invCompany||BRAND.company}</h2><p className="text-xs text-gray-500 mt-1">{db?.adminSettings?.invAddress||BRAND.hq}</p><div dangerouslySetInnerHTML={{ __html: taxHtml }} /><p className="text-xs text-gray-500 mt-1">{db?.adminSettings?.invEmail||BRAND.email}</p></div></div>
            <div className="flex justify-between"><div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Bill To</p><p className="font-bold text-lg">{viewInvoice.restaurantName}</p><p className="text-sm text-gray-600">{viewInvoice.restaurantCity}, {viewInvoice.restaurantCountry}</p></div><div className="text-right"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Date of Issue</p><p className="font-bold text-sm">{issueDate}</p></div></div>
            <div className="border border-gray-200 rounded-xl overflow-hidden"><table className="w-full text-left text-sm"><thead className="bg-gray-50"><tr><th className="p-4 font-black text-gray-600 uppercase tracking-wider text-[10px]">Description</th><th className="p-4 text-right font-black text-gray-600 uppercase tracking-wider text-[10px]">Amount</th></tr></thead><tbody className="divide-y divide-gray-100"><tr><td className="p-4"><p className="font-bold text-base">{BRAND.product} License</p><p className="text-xs text-gray-500 mt-1">{viewInvoice.type}</p></td><td className="p-4 text-right font-mono font-bold text-lg">{viewInvoice.amount} {viewInvoice.currency}</td></tr></tbody><tfoot className="bg-gray-50"><tr><td className="p-4 text-right font-black uppercase tracking-widest text-xs pt-6">Total Paid</td><td className="p-4 text-right font-black font-mono text-xl text-[#064e3b] pt-6">{viewInvoice.amount} {viewInvoice.currency}</td></tr></tfoot></table></div>
            <div className="pt-6 sm:pt-10 text-center pb-10"><p className="text-sm font-bold text-gray-800">Payment Status: <span className="text-emerald-600">PAID & VERIFIED</span></p><p className="text-xs text-gray-500 mt-1 font-mono">Bank Ref: {viewInvoice.refId}</p><p className="text-[10px] text-gray-400 mt-8 font-medium max-w-sm mx-auto leading-relaxed">Thank you for your business. This is a computer-generated document for Export of Services and requires no physical signature.</p></div>
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-2 justify-end shrink-0"><Btn onClick={() => generatePDF('invoice-pdf-content', `${cleanFileName}.pdf`)} className="bg-gray-800 px-6"><Printer size={16}/> Save PDF</Btn></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 no-print">
      <div className="space-y-3">
        <h2 className="font-black text-gray-800 uppercase tracking-widest text-[10px] flex items-center gap-1"><ShieldCheck size={12}/> Verify Pending Payments</h2>
        {pending.length === 0 ? <p className="text-xs text-gray-400 font-medium p-5 bg-white rounded-2xl border border-gray-100 text-center shadow-sm">No pending transactions.</p> : pending.map(p => {
          const c = (db?.restaurants || INITIAL_DB.restaurants).find(r => r.id === p.restaurantId) || {}; const pricing = (db?.pricing || INITIAL_DB.pricing).find(x => x.country === c.country) || { rateINR: 1 };
          return (
            <Card key={p.id} className="border-l-4 border-l-amber-500 shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div><h3 className="font-black text-gray-800 text-lg">{c.name || "Unknown"} <span className="text-xs text-gray-500">({c.city || ''})</span></h3><p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{p.type}</p></div>
                <div className="text-right"><p className="font-black font-mono text-xl text-emerald-600">{p.amount || 0} {p.currency || ''}</p><p className="text-[9px] font-bold text-gray-400 mt-0.5">~ {formatINR((p.amount || 0) * pricing.rateINR)}</p></div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-2 space-y-3">
                <div className="flex justify-between items-center"><label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Transaction Details</label></div>
                <div className="flex flex-col sm:flex-row gap-2"><Inp type="text" defaultValue={p.refId||''} onChange={e=>setAdminTxnRef({...adminTxnRef,[p.id]:e.target.value})} placeholder="Bank Ref / Txn ID..."/><select onChange={e=>setAdminTxnFee({...adminTxnFee,[p.id]:e.target.value})} defaultValue="0.01" className={`${CSS.inp} shrink-0 sm:w-auto`}><option value="0.01">Mulya Wire (1%)</option><option value="0.02">Razorpay India (2%)</option><option value="0.03">Razorpay Global (3%)</option><option value="0">No Fee / Cash (0%)</option></select><Btn onClick={()=>handleApprove(p,adminTxnRef[p.id]||p.refId)} className="whitespace-nowrap">Approve</Btn></div>
              </div>
            </Card>
          );
        })}
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-end mb-1 pt-4 border-t border-gray-200"><div><h2 className="font-black text-gray-800 uppercase tracking-widest text-[10px] flex items-center gap-1"><FileText size={12}/> Approved & Invoiced</h2><p className="text-[9px] font-bold text-gray-400 mt-0.5">8-Year Retention DB</p></div><button onClick={handleExportInvoices} className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-indigo-100 transition-colors active:scale-95 shadow-sm"><FileSpreadsheet size={14}/> Export CSV</button></div>
        <div className="flex gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-3 text-gray-400" size={16}/><Inp type="text" placeholder="Search Client / ID..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="pl-9" /></div><select value={selectedFY} onChange={e=>setSelectedFY(e.target.value)} className={CSS.inp}>{fyOptions.map(fy=><option key={fy} value={fy}>{fy==='All'?'All FY':`FY ${fy}`}</option>)}</select></div>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {invs.map(i=>(
            <Card key={i.id} className="flex justify-between items-center p-4 hover:border-emerald-300 transition-colors">
              <div className="min-w-0 pr-4">
                <h3 className="font-bold text-sm text-gray-900 truncate">{String(i.restaurantName||'')}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1"><p className="text-[10px] text-gray-600 font-mono bg-gray-100 px-1.5 py-0.5 rounded shrink-0">{i.id}</p><p className="text-[10px] text-gray-400 font-bold shrink-0">{i.date?new Date(i.date).toLocaleDateString('en-GB'):'Unknown'}</p></div>
              </div>
              <div className="text-right flex flex-col items-end shrink-0">
                <p className="font-black font-mono text-sm text-[#064e3b]">{i.amount} {i.currency}</p>
                <button onClick={()=>setViewInvoice(i)} className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md mt-1.5 uppercase tracking-widest hover:bg-blue-100 active:scale-95 transition-colors">Open PDF</button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-end border-t border-gray-200 pt-6"><h2 className="font-black text-gray-800 uppercase tracking-widest text-[10px]">Country Pricing & Banks</h2><button onClick={()=>setEditingCountry({})} className="text-[10px] font-black text-[#064e3b] uppercase tracking-widest flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors active:scale-95 shadow-sm"><Plus size={12}/> Add</button></div>
        {(db?.pricing || INITIAL_DB.pricing).map(p => (
          <Card key={p.id} className="cursor-pointer hover:border-emerald-300 transition-colors shadow-sm" onClick={() => setEditingCountry(p)}>
            <div className="flex justify-between items-center">
              <div><h3 className="font-black text-gray-800 text-sm">{p.country}</h3><p className="text-[10px] text-gray-500 font-medium">Setup: {p.setupFee} {p.currency}</p></div>
              <div className="text-right">
                {p.discountPercent > 0 && <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase mr-2">{p.discountPercent}% OFF</span>}
                <div className="font-black font-mono text-[#064e3b] inline-block">{p.annualFee} {p.currency}<span className="text-xs text-gray-400">/yr</span></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AdminSettings({ db, updateDb }) {
  const [settings, setSettings] = useState(db?.adminSettings || INITIAL_DB.adminSettings);
  const adminUser = (db?.users || INITIAL_DB.users).find(u => u.role === 'admin') || {};
  const [adminCreds, setAdminCreds] = useState({ email: adminUser.email || '', password: adminUser.password || '' });
  const [showPwd, setShowPwd] = useState(false);

  const handleSave = () => {
    if (!String(settings.supportPhone||'').trim().startsWith('+')) return triggerToast("Phone must start with '+'", "error");
    if (settings.aiProvider === 'Google Gemini' && settings.apiKey && !String(settings.apiKey).startsWith('AIza')) return triggerToast("Keys must start with 'AIza'.", "error");
    updateDb('adminSettings', { ...settings, status: settings.apiKey ? 'Connected' : 'Awaiting Key' });
    try { if (settings.firebaseConfig && String(settings.firebaseConfig).trim() !== '') { JSON.parse(settings.firebaseConfig); localStorage.setItem('amanah_firebase_config', settings.firebaseConfig); triggerToast('Config Saved!'); } else { localStorage.removeItem('amanah_firebase_config'); triggerToast('Global Settings Saved!'); } } catch (e) { triggerToast('Invalid JSON.', 'error'); }
  };
  
  const saveCreds = (e) => { e.preventDefault(); if(adminCreds.password.length < 5) return triggerToast('Password too short.', 'error'); updateDb('users', (db?.users||INITIAL_DB.users).map(u => u.role === 'admin' ? { ...u, ...adminCreds } : u)); triggerToast('Saved!'); };

  return (
    <div className="space-y-6">
      <Card className="space-y-4 border-2 border-red-50 shadow-sm">
        <div><h2 className="font-black text-lg text-red-900 flex items-center gap-2"><ShieldCheck size={20}/> Admin Profile</h2><p className="text-[10px] text-red-700 font-bold uppercase tracking-widest mt-1">Master Login Credentials</p></div>
        <form onSubmit={saveCreds} className="space-y-4">
          <div><label className={CSS.lbl}>Master Email</label><Inp type="email" value={adminCreds.email} onChange={e=>setAdminCreds({...adminCreds,email:e.target.value})} required /></div>
          <div><label className={CSS.lbl}>Master Password</label><div className="relative"><Inp type={showPwd ? "text" : "password"} value={adminCreds.password} onChange={e=>setAdminCreds({...adminCreds,password:e.target.value})} required /><button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"><EyeOff size={18}/></button></div></div>
          <Btn type="submit" variant="red" className="w-full">Save Profile</Btn>
        </form>
      </Card>
      
      <Card className="space-y-4 border-2 border-orange-50 shadow-sm">
        <div><h2 className="font-black text-lg text-orange-900 flex items-center gap-2"><Database size={20}/> Firebase Connection</h2></div>
        <div className="space-y-3">
          <div><label className={CSS.lbl}>Firebase Config (JSON)</label><textarea rows="4" value={settings.firebaseConfig||''} onChange={e=>setSettings({...settings,firebaseConfig:e.target.value})} className={CSS.inp} placeholder='{"apiKey": "..."}' /></div>
        </div>
      </Card>

      <Card className="space-y-4 border-2 border-blue-50 shadow-sm">
        <div><h2 className="font-black text-lg text-blue-900 flex items-center gap-2"><Link2 size={20}/> Meta Webhook</h2></div>
        <div className="space-y-4">
          <div><label className={CSS.lbl}>Callback URL</label><div className="flex border border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-500"><input type="text" value={settings.webhookUrl||''} onChange={e=>setSettings({...settings,webhookUrl:e.target.value})} className="w-full p-3.5 text-sm font-mono font-bold outline-none" /><button onClick={()=>copyToClipboard(settings.webhookUrl)} className="px-4 text-blue-600 bg-gray-50 hover:bg-gray-100"><Copy size={18}/></button></div></div>
          <div><label className={CSS.lbl}>Verify Token</label><div className="flex border border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-500"><input type="text" value={settings.verifyToken||''} onChange={e=>setSettings({...settings,verifyToken:e.target.value})} className="w-full p-3.5 text-sm font-mono font-bold outline-none" /><div className="flex items-center bg-blue-50 border-l border-gray-200"><button onClick={()=>{setSettings({...settings,verifyToken:'amnh_'+Math.random().toString(36).substr(2,10)});triggerToast("Generated!");}} className="px-3 font-black text-[10px] uppercase text-blue-600 hover:bg-blue-100">Gen</button><button onClick={()=>copyToClipboard(settings.verifyToken)} className="px-3 text-blue-600 hover:bg-blue-100"><Copy size={16}/></button></div></div></div>
        </div>
      </Card>

      <Card className="space-y-4 border-2 border-emerald-50 shadow-sm">
        <div><h2 className="font-black text-lg text-emerald-900 flex items-center gap-2"><Bot size={20}/> AI Engine</h2></div>
        <div className="space-y-4">
          <div><label className={CSS.lbl}>Model Name</label><Inp type="text" value={settings.aiModel||''} onChange={e=>setSettings({...settings,aiModel:e.target.value})} placeholder="gemini-2.5-flash" /></div>
          <div><label className={CSS.lbl}>API Key</label><div className="relative"><Inp type={showPwd ? "text" : "password"} value={settings.apiKey||''} onChange={e=>setSettings({...settings,apiKey:e.target.value})} placeholder="AIzaSy..." /><button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"><EyeOff size={18}/></button></div></div>
        </div>
        <Btn onClick={handleSave} className="w-full mt-2">Save Global Settings</Btn>
      </Card>
    </div>
  );
}

function ClientApp({ db, updateDb, dbRef, authUser, syncStatus, onLogout }) {
  const [activeTab, setActiveTab] = useState('Overview'); const [simMode, setSimMode] = useState(null); 
  const [showApiRulesModal, setShowApiRulesModal] = useState(false); const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const activeDbUser = (db?.users || INITIAL_DB.users).find(u => u.id === authUser.id) || authUser;
  const branches = (activeDbUser.restaurantIds||[]).map(id => (db?.restaurants || INITIAL_DB.restaurants).find(r => r.id === id)).filter(Boolean);
  const [activeClientId, setActiveClientId] = useState(branches.length > 0 ? branches[0].id : null);
  useEffect(() => { if (!activeClientId && branches.length > 0) setActiveClientId(branches[0].id); }, [branches, activeClientId]);

  const clientData = (db?.restaurants || INITIAL_DB.restaurants).find(c => c.id === activeClientId) || null;
  const pricing = clientData ? ((db?.pricing || INITIAL_DB.pricing).find(p => p.country === clientData.country) || { tz: 'UTC' }) : { tz: 'UTC' };
  const liveLocalTime = useLiveTime(pricing.tz);

  if (!clientData) return <div className="p-6 text-center text-gray-500 font-bold">Loading Branch Data...</div>;

  const today = new Date(); const expiry = new Date(clientData.expiryDate || today); const isExp = expiry < today;
  const isLocked = (clientData.status !== 'Active' && clientData.status !== 'Trial') || isExp;
  const NAV = [{ id: 'Overview', icon: LayoutDashboard }, { id: 'Inbox', icon: MessageCircle }, { id: 'Bookings', icon: Calendar }, { id: 'KB', icon: BookOpen }, { id: 'Settings', icon: Settings }];

  return (
    <div className="flex h-[100dvh] bg-gray-50 font-sans relative overflow-hidden">
      <style>{`@media print { body * { visibility: hidden; } .print-container, .print-container * { visibility: visible; } .print-container { position: absolute; left: 0; top: 0; width: 100%; height: 100%; margin: 0; padding: 0; box-shadow: none !important; border: none !important; } .no-print { display: none !important; } @page { size: A4 portrait; margin: 0.5cm; } }`}</style>
      
      {showApiRulesModal && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-end sm:items-center justify-center p-4 pb-6 no-print">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowApiRulesModal(false)} className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><X size={18}/></button>
            <h2 className="text-xl font-black text-blue-900 mb-5 flex items-center gap-2"><Info size={24} className="text-blue-600"/> Phone Number Rules</h2>
            <div className="space-y-5 text-sm text-gray-700 leading-relaxed">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl shadow-sm"><p className="font-black text-blue-900 text-sm mb-1.5">1. The "Exclusive Use" Rule</p><p className="text-xs text-blue-800 leading-relaxed">Once a number is connected to the API, <strong>it can no longer be used on the standard WhatsApp Messenger or WhatsApp Business mobile apps.</strong> You will be logged out of the app, and all chats will move to the Amanah Inbox.</p></div>
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl shadow-sm"><p className="font-black text-emerald-900 text-sm mb-1.5">2. The Golden Rule (Highly Recommended)</p><p className="text-xs text-emerald-800 leading-relaxed">Buy a <strong>new, dedicated SIM card or virtual number</strong> specifically for your AI Booking Bot. This allows your staff to keep using your old main number on their phones for internal use or VIPs without disruption.</p></div>
              <div><p className="font-bold text-gray-900 mb-1">Migrating an Existing Number?</p><p className="text-xs text-gray-600 mb-2">If you must use your existing WhatsApp Business number, you must delete your account on the phone first.</p><ol className="list-decimal pl-5 space-y-1 text-xs font-medium text-gray-600"><li>Open the WhatsApp Business App.</li><li>Go to Settings &rarr; Account &rarr; Delete my account.</li><li>Once deleted, the number is freed up and can be registered on the Meta Developer Cloud API.</li></ol></div>
              <p className="text-xs text-gray-500 font-medium italic">* Note: Normal voice phone calls will still ring on your cellular phone as usual. Only the WhatsApp messaging portion is routed to the AI.</p>
            </div>
            <Btn onClick={() => setShowApiRulesModal(false)} className="w-full mt-6">I Understand</Btn>
          </div>
        </div>
      )}

      <div className={`bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 transition-all duration-300 z-40 shadow-sm no-print absolute md:relative h-full ${isSidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20'}`}>
        <div>
          <div className="h-16 flex items-center border-b border-gray-100 px-4 md:justify-center lg:justify-start lg:px-6 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Bot className="text-[#064e3b] shrink-0" size={28} />
            <div className={`ml-3 overflow-hidden ${isSidebarOpen ? 'block' : 'hidden lg:block'} w-full pr-2`}>
              <span className="font-black text-gray-900 tracking-tight block leading-tight truncate">{clientData.name}</span>
              <select value={activeClientId||''} onChange={e => setActiveClientId(e.target.value)} onClick={e=>e.stopPropagation()} className="bg-gray-100 text-[10px] font-bold mt-1 p-1 rounded outline-none w-full text-gray-700 cursor-pointer border border-gray-200">
                {branches.map(b => <option key={b.id} value={b.id}>{b.city ? `${b.name} (${b.city})` : b.name}</option>)}
              </select>
            </div>
          </div>
          <div className="p-3 space-y-2 mt-2">
            {NAV.map(t => { 
              const Icon = t.icon; 
              return (
                <button key={t.id} onClick={() => { setActiveTab(t.id); if(window.innerWidth < 768) setIsSidebarOpen(false); }} className={`w-full flex items-center p-3 rounded-xl transition-all ${activeTab === t.id ? 'bg-emerald-50 text-[#064e3b]' : 'text-gray-500 hover:bg-gray-50'} ${!isSidebarOpen && 'justify-center lg:justify-start'}`}>
                  <Icon size={22} className={`shrink-0 ${activeTab === t.id ? 'stroke-[2.5px]' : ''}`} />
                  <span className={`ml-3 font-bold text-sm truncate ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}>{t.id}</span>
                </button>
              ); 
            })}
          </div>
        </div>
        <div className="p-3 border-t border-gray-100 space-y-2">
          <div className={`flex items-center p-3 rounded-xl ${syncStatus === 'online' ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'} ${!isSidebarOpen && 'justify-center lg:justify-start'}`} title={syncStatus === 'online' ? 'Cloud Sync Active' : 'Offline Mode'}><Wifi size={16} className={`shrink-0 ${syncStatus === 'online' ? 'animate-pulse' : ''}`}/><span className={`ml-3 font-black text-[10px] uppercase tracking-widest truncate ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}>{syncStatus === 'online' ? 'Sync Active' : 'Offline'}</span></div>
          <button onClick={onLogout} className={`w-full flex items-center p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all ${!isSidebarOpen && 'justify-center lg:justify-start'}`}><LogOut size={20} className="shrink-0" /><span className={`ml-3 font-bold text-sm truncate ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}>Log Out</span></button>
        </div>
      </div>
      
      {isSidebarOpen && <div className="fixed inset-0 bg-black/20 z-30 md:hidden no-print" onClick={() => setIsSidebarOpen(false)}></div>}

      <div className="flex-1 flex flex-col h-[100dvh] overflow-hidden relative w-full">
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 shadow-sm no-print">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg" onClick={() => setIsSidebarOpen(true)}><Menu size={24}/></button>
            <h1 className="font-black text-lg sm:text-xl text-gray-900 tracking-tight">{activeTab === 'KB' ? 'Knowledge Base' : activeTab}</h1>
            <Badge type={clientData.status === 'Trial' ? 'trial' : (!isLocked && clientData.aiEnabled ? 'success' : 'danger')}>{clientData.status === 'Trial' ? 'Trial' : (!isLocked && clientData.aiEnabled ? 'Online' : 'Offline')}</Badge>
          </div>
          <div className="flex items-center gap-3 sm:gap-4"><div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg items-center gap-1.5 shadow-sm hidden lg:flex"><Clock size={12} /> {liveLocalTime}</div></div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50 flex justify-center print:p-0 print:bg-white">
          <div className="w-full max-w-5xl pb-24 print:w-full print:max-w-none">
            <div className="no-print">
              {(!clientData.wabaId || !clientData.sysAccessToken || (db?.menus || INITIAL_DB.menus).filter(m => m.restaurantId === activeClientId).length === 0) && (
                <div className="bg-red-50 border border-red-200 p-5 rounded-2xl mb-6 shadow-sm flex items-start gap-4">
                   <AlertCircle className="text-red-600 shrink-0 mt-0.5" />
                   <div className="w-full"><h3 className="font-black text-red-900 text-sm uppercase tracking-widest mb-1">Action Required: Complete Setup</h3><p className="text-sm text-red-800 font-medium mb-3">Your AI bot cannot function until you complete the following:</p><ul className="list-disc pl-5 text-xs text-red-700 font-bold space-y-3">{(!clientData.wabaId || !clientData.sysAccessToken) && (<li className="flex flex-col sm:flex-row sm:items-center gap-2">Connect Meta Cloud API<button onClick={() => setActiveTab('Settings')} className="bg-red-600 text-white px-3 py-1 rounded text-[9px] uppercase tracking-widest hover:bg-red-700 active:scale-95 w-max">Go to Settings</button></li>)}{((db?.menus || INITIAL_DB.menus).filter(m => m.restaurantId === activeClientId).length === 0) && (<li className="flex flex-col sm:flex-row sm:items-center gap-2">Add at least one item to Menu<button onClick={() => setActiveTab('KB')} className="bg-red-600 text-white px-3 py-1 rounded text-[9px] uppercase tracking-widest hover:bg-red-700 active:scale-95 w-max">Go to Knowledge Base</button></li>)}<li className="flex flex-col sm:flex-row sm:items-center gap-2 text-blue-800 marker:text-blue-800">Read Phone Number Rules before connecting<button onClick={() => setShowApiRulesModal(true)} className="bg-blue-600 text-white px-3 py-1 rounded text-[9px] uppercase tracking-widest hover:bg-blue-700 active:scale-95 w-max">View Policy</button></li></ul></div>
                </div>
              )}
              {isLocked && (<div className="bg-red-600 text-white p-5 rounded-2xl shadow-lg flex items-start gap-4 mb-6"><AlertCircle className="shrink-0 mt-0.5" /><div><h3 className="font-black text-sm uppercase tracking-widest">Account {clientData.status}</h3><p className="text-sm font-medium mt-1 opacity-90">Your AI bot has been disconnected. Please proceed to Settings to manage billing.</p></div></div>)}
              {clientData.status === 'Trial' && (<div className="bg-blue-600 text-white p-5 rounded-2xl shadow-lg flex items-start gap-4 mb-6"><AlertCircle className="shrink-0 mt-0.5" /><div><h3 className="font-black text-sm uppercase tracking-widest">Free Trial Active</h3><p className="text-sm font-medium mt-1 opacity-90">Your trial expires {new Date(clientData.expiryDate || new Date()).toLocaleDateString('en-GB')}. Your AI is fully operational. Go to Settings to upgrade permanently.</p></div></div>)}
              
              {activeTab === 'Overview' && <ClientHome db={db} clientId={activeClientId} />}
              {activeTab === 'Inbox' && <ClientInbox db={db} updateDb={updateDb} dbRef={dbRef} clientId={activeClientId} />}
              {activeTab === 'Bookings' && <ClientBookings db={db} updateDb={updateDb} dbRef={dbRef} clientId={activeClientId} />}
              {activeTab === 'KB' && <ClientKnowledgeBase db={db} updateDb={updateDb} dbRef={dbRef} clientId={activeClientId} openSim={() => setSimMode('customer')} isLocked={isLocked} />}
              {activeTab === 'Settings' && <ClientSettings db={db} updateDb={updateDb} dbRef={dbRef} clientId={activeClientId} isLocked={isLocked} pricing={pricing} authUser={authUser} openApiRules={() => setShowApiRulesModal(true)} onLogout={onLogout} />}
            </div>
          </div>
        </div>
      </div>
      {!simMode && activeTab !== 'Inbox' && (<div className="absolute bottom-6 right-6 z-30 no-print"><button onClick={() => setSimMode('support')} className="bg-blue-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 transition-transform active:scale-90"><HelpCircle size={28} /></button></div>)}
      {simMode && <AIGenericChatWindow db={db} updateDb={updateDb} dbRef={dbRef} clientId={activeClientId} mode={simMode} onClose={() => setSimMode(null)} isLocked={isLocked} />}
    </div>
  );
}

function ClientHome({ db, clientId }) {
  const [showQRPoster, setShowQRPoster] = useState(false);
  const client = (db?.restaurants || INITIAL_DB.restaurants).find(c => c.id === clientId) || {};
  const branchConversations = (db?.conversations || INITIAL_DB.conversations).filter(c => c.restaurant_id === clientId);
  const branchMessages = (db?.messages || INITIAL_DB.messages).filter(m => m.restaurant_id === clientId);
  const cleanPhone = String(client.phone || '').replace(/[^0-9]/g, ''); const waLink = `https://wa.me/${cleanPhone}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(waLink)}`;

  const aiMsgs = branchMessages.filter(m => m.sender === 'AI').length;
  const staffMsgs = branchMessages.filter(m => m.sender === 'staff' && !String(m.text||'').includes('[Template')).length;
  const totalOut = aiMsgs + staffMsgs; const automationRate = totalOut === 0 ? 100 : Math.round((aiMsgs / totalOut) * 100);

  if (showQRPoster) {
    const cleanFileName = safeFileName(`QR_Poster_${client.name}`);
    return (
      <div className="fixed inset-0 bg-gray-900 sm:bg-black/80 z-[300] flex justify-center sm:items-center p-0 sm:p-6 overflow-y-auto no-print-bg">
        <div className="bg-white w-full sm:max-w-xl sm:rounded-3xl shadow-2xl flex flex-col h-full sm:h-auto print-container print:w-full print:max-w-none print:shadow-none print:rounded-none">
          <div className="p-4 bg-gray-50 flex justify-between items-center border-b border-gray-200 print:hidden shrink-0"><h3 className="font-bold text-gray-800">Print Preview</h3><button onClick={() => setShowQRPoster(false)} className="p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300"><X size={16}/></button></div>
          <div id="qr-pdf-content" className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-white print:p-0 print:pt-20"><h1 className="text-4xl font-black text-gray-900 mb-4">{client.name}</h1><p className="text-lg text-gray-600 mb-10 font-medium px-4">Scan this code to chat with our AI Assistant! Book a table, see our menu, and more instantly.</p><div className="bg-white p-6 border-[6px] border-[#064e3b] rounded-[32px] inline-block mb-12 shadow-lg"><img src={qrUrl} crossOrigin="anonymous" alt="QR" className="w-64 h-64 block print:w-[400px] print:h-[400px]" /></div><h2 className="text-xl font-black text-[#064e3b] uppercase tracking-widest mb-10">Open camera to scan</h2><div className="pt-6 border-t-2 border-gray-100 w-full max-w-sm mx-auto"><p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Powered By</p><p className="text-lg text-gray-900 font-black tracking-wide">{BRAND.company}</p></div></div>
          <div className="p-4 bg-gray-50 border-t border-gray-200 print:hidden shrink-0"><Btn onClick={() => generatePDF('qr-pdf-content', `${cleanFileName}.pdf`)} className="w-full"><Printer size={16}/> Print / Save PDF</Btn></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-[#064e3b] text-white border-none flex flex-col items-center justify-center py-8 shadow-md"><h3 className="text-4xl sm:text-5xl font-black">{branchMessages.length}</h3><p className="text-[10px] sm:text-xs font-bold text-emerald-300 uppercase tracking-widest mt-2">Total Msgs</p></Card>
        <Card className="bg-emerald-50 border-emerald-100 flex flex-col items-center justify-center py-8 shadow-sm"><h3 className="text-4xl sm:text-5xl font-black text-emerald-900">{branchConversations.length}</h3><p className="text-[10px] sm:text-xs font-bold text-emerald-700 uppercase tracking-widest mt-2">Unique Chats</p></Card>
        <Card title="Percentage of messages handled automatically by AI vs. Human Staff" className="bg-blue-50 border-blue-100 flex flex-col items-center justify-center py-8 shadow-sm col-span-2 md:col-span-1"><h3 className="text-4xl sm:text-5xl font-black text-blue-900">{automationRate}%</h3><p className="text-[10px] sm:text-xs font-bold text-blue-700 uppercase tracking-widest mt-2">Staff Time Saved</p></Card>
      </div>
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-6">
          <div className="text-center sm:text-left flex-1"><h3 className="font-black text-gray-900 text-lg flex items-center justify-center sm:justify-start gap-2 mb-2"><QrCode size={20} className="text-emerald-600"/> WhatsApp QR Marketing</h3><p className="text-xs text-gray-500 mb-6 leading-relaxed max-w-sm mx-auto sm:mx-0">Print this beautiful QR code poster for your tables, menus, or front door so customers can instantly scan, view your menu, and chat.</p><div className="flex flex-wrap justify-center sm:justify-start gap-3"><button onClick={() => { copyToClipboard(`Chat to book instantly: ${waLink}`); }} className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2 active:scale-95 shadow-sm"><Share2 size={16}/> Copy Link</button><button onClick={() => setShowQRPoster(true)} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 py-3 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2 active:scale-95 shadow-sm"><Printer size={16}/> Save PDF Poster</button></div></div>
          <div className="shrink-0 p-3 border-2 border-gray-100 rounded-2xl shadow-sm bg-white hover:border-emerald-200 transition-colors"><img src={qrUrl} crossOrigin="anonymous" alt="WhatsApp QR Code" className="w-32 h-32 sm:w-40 sm:h-40" /></div>
        </div>
      </Card>
    </div>
  );
}

function ClientInbox({ db, updateDb, dbRef, clientId }) {
  const [activeConvId, setActiveConvId] = useState(null); const [humanReply, setHumanReply] = useState(''); const [templateName, setTemplateName] = useState(''); const endRef = useRef(null);
  const convs = (db?.conversations || INITIAL_DB.conversations).filter(c => c.restaurant_id === clientId).sort((a,b) => new Date(b.last_message_time || 0) - new Date(a.last_message_time || 0));
  
  useEffect(() => { const t = setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); return () => clearTimeout(t); }, [activeConvId, db.messages]);

  if (!activeConvId) {
    if(convs.length===0) return <p className="text-center text-gray-400 p-10 font-bold bg-white rounded-3xl border border-gray-100 shadow-sm">No customer messages yet.</p>;
    return (
      <div className="space-y-4">
        <h2 className="font-black text-gray-800 uppercase tracking-widest text-[10px] px-2 flex items-center gap-2"><MessageCircle size={14}/> Conversations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {convs.map(c => {
            const lastMsgTime = c.last_message_time ? new Date(c.last_message_time).getTime() : 0; 
            const hoursSinceMsg = (Date.now() - lastMsgTime) / (1000 * 60 * 60); 
            const isSessionActive = hoursSinceMsg <= 24; 
            const hoursLeft = Math.floor(24 - hoursSinceMsg);
            return (
              <Card key={c.conversation_id} onClick={() => setActiveConvId(c.conversation_id)} className="hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer">
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 bg-[#EFEAE2] rounded-full flex items-center justify-center shrink-0"><Smartphone size={24} className="text-[#075E54]" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1"><h3 className="font-black text-gray-900 text-base truncate">{c.customer_phone}</h3><span className="text-[9px] font-bold text-gray-400 shrink-0">{c.last_message_time ? new Date(c.last_message_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span></div>
                    <div className="flex items-center justify-between mt-0.5">
                      <div className="flex items-center gap-1.5 min-w-0 pr-2">
                        {c.ai_paused ? <PauseCircle size={12} className="text-amber-500 shrink-0"/> : null}
                        <p className="text-sm text-gray-500 truncate font-medium">{c.last_message}</p>
                      </div>
                      {isSessionActive ? ( 
                        <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded flex items-center gap-1 shrink-0"><Timer size={10}/> {hoursLeft}h left</span> 
                      ) : ( 
                        <span className="text-[9px] font-bold bg-red-50 text-red-700 px-2 py-0.5 rounded shrink-0">Expired</span> 
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    );
  }

  const thread = (db?.messages || INITIAL_DB.messages).filter(m => m.conversation_id === activeConvId).sort((a,b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
  const activeConv = convs.find(c => c.conversation_id === activeConvId);
  const lastCust = [...thread].reverse().find(m => m.sender === 'customer');
  const isPast24 = lastCust ? (Date.now() - new Date(lastCust.timestamp).getTime()) > 86400000 : false;

  const toggleAi = () => updateDb('conversations', (db?.conversations || INITIAL_DB.conversations).map(c => c.conversation_id === activeConvId ? { ...c, ai_paused: !c.ai_paused } : c));
  
  const sendHuman = (overrideText = null) => {
    const txt = typeof overrideText === 'string' ? overrideText : humanReply; if(!txt.trim() || isPast24) return;
    const msg = { message_id: `M${Date.now()}`, conversation_id: activeConvId, restaurant_id: clientId, sender: 'staff', text: txt, timestamp: new Date().toISOString() };
    updateDb('messages', [...(dbRef.current.messages || []), msg]);
    updateDb('conversations', (dbRef.current.conversations || []).map(c => c.conversation_id === activeConvId ? { ...c, last_message: txt, last_message_time: new Date().toISOString() } : c));
    setHumanReply('');
  };

  const sendTemplate = () => {
    if(!templateName.trim()) return;
    const msg = { message_id: `M${Date.now()}`, conversation_id: activeConvId, restaurant_id: clientId, sender: 'staff', text: `[Template Dispatch]: ${templateName.trim()}`, timestamp: new Date().toISOString() };
    updateDb('messages', [...(dbRef.current.messages || []), msg]);
    updateDb('conversations', (dbRef.current.conversations || []).map(c => c.conversation_id === activeConvId ? { ...c, last_message: msg.text, last_message_time: new Date().toISOString() } : c));
    setTemplateName(''); triggerToast(`Template queued.`);
  };

  const handleExportChat = () => {
    if (thread.length === 0) return triggerToast("No messages to export.", "error");
    let txt = `Chat Export - Customer: ${activeConv?.customer_phone}\nDate: ${new Date().toLocaleDateString()}\n\n`;
    thread.forEach(m => { const sender = m.sender === 'customer' ? 'Customer' : m.sender === 'AI' ? 'Amanah AI' : 'Staff'; const time = m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : ''; txt += `[${time}] ${sender}: ${m.text}\n\n`; });
    const blob = new Blob([txt], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `ChatLog_${activeConv?.customer_phone}.txt`; a.click(); triggerToast("Chat log exported successfully!");
  };

  return (
    <div className="bg-[#EFEAE2] -m-4 h-[calc(100vh-140px)] flex flex-col relative z-30 sm:rounded-3xl sm:overflow-hidden sm:shadow-2xl sm:border sm:border-gray-200 sm:m-0 sm:h-[calc(100vh-170px)] sm:max-w-2xl sm:mx-auto">
      <div className="bg-[#075E54] text-white p-4 flex items-center justify-between shadow-md z-10"><div className="flex items-center gap-4"><button onClick={() => setActiveConvId(null)} className="p-2.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors active:scale-95"><ArrowLeft size={20}/></button><div><h3 className="font-bold text-base leading-tight">{activeConv?.customer_phone}</h3><p className="text-[10px] text-emerald-100 font-medium tracking-wide">Customer Chat Log</p></div></div><div className="flex items-center gap-2"><button onClick={handleExportChat} className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors active:scale-95" title="Download Chat"><Download size={18}/></button><button onClick={toggleAi} className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 ${activeConv?.ai_paused ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-emerald-100 text-emerald-900 border border-emerald-200'}`}>{activeConv?.ai_paused ? <><PauseCircle size={14}/> AI Paused</> : <><Bot size={14}/> AI Active</>}</button></div></div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-cover">
        {thread.map(m => {
          const isOut = m.sender === 'AI' || m.sender === 'staff'; const isTpl = String(m.text || '').includes('[Template');
          return (
            <div key={m.message_id} className={`flex flex-col ${isOut ? 'items-end' : 'items-start'}`}>
              <div className={`p-3.5 rounded-2xl max-w-[85%] text-sm shadow-sm whitespace-pre-wrap break-words break-all font-medium ${isOut ? 'bg-[#DCF8C6] rounded-tr-none text-gray-900' : 'bg-white rounded-tl-none text-gray-900'} ${isTpl ? 'border-2 border-amber-300 bg-amber-50' : ''}`}>
                 {m.sender === 'AI' && <div className="text-[10px] font-bold text-emerald-700 mb-1 flex items-center gap-1"><Bot size={12}/> AI</div>}
                 {m.sender === 'staff' && <div className={`text-[10px] font-bold mb-1 flex items-center gap-1 ${isTpl ? 'text-amber-700' : 'text-blue-700'}`}><Users size={12}/> {isTpl ? 'System Template' : 'Staff'}</div>}
                 {m.text}
                 <span className={`text-[8px] font-bold mt-1 block ${isOut ? 'text-emerald-700/60 text-right' : 'text-gray-400 text-left'}`}>{m.timestamp ? new Date(m.timestamp).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : ''}</span>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      {activeConv?.ai_paused ? (
        isPast24 ? (
           <div className="bg-red-50 p-4 text-center border-t border-red-100 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] flex flex-col gap-2"><div className="flex items-center justify-center gap-1.5 text-red-800 font-black text-xs uppercase tracking-widest"><Lock size={14}/> 24-Hour Window Closed</div><p className="text-xs text-red-600 font-medium">Meta requires a pre-approved Template to message this customer now.</p><div className="flex gap-2 mt-2"><Inp value={templateName} onChange={e=>setTemplateName(e.target.value)} placeholder="Meta Template Name (e.g. booking_reminder)" /><Btn onClick={sendTemplate} disabled={!templateName.trim()} variant="red"><Zap size={14}/> Dispatch</Btn></div></div>
        ) : (
          <div className="bg-[#F0F0F0] p-3 pb-6 flex flex-col shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            <div className="flex gap-2 mb-2 overflow-x-auto pb-1 no-scrollbar"><button onClick={() => { sendHuman("Thank you!"); toggleAi(); }} className="text-[10px] bg-red-50 border border-red-200 px-3 py-1.5 rounded-full whitespace-nowrap text-red-700 hover:bg-red-100 font-bold transition-colors shadow-sm flex items-center gap-1"><Bot size={12}/> Resolve & Resume AI</button>{['Your table is ready!', 'Let me check.', 'Can you confirm?'].map(qr => (<button key={qr} onClick={() => setHumanReply(qr)} className="text-[10px] bg-white border border-gray-200 px-3 py-1.5 rounded-full whitespace-nowrap text-gray-600 hover:bg-blue-50 transition-colors shadow-sm">{qr}</button>))}</div>
            <div className="flex gap-2 items-end"><textarea value={humanReply} onChange={e => setHumanReply(e.target.value)} onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendHuman(); } }} placeholder="Type manual reply (Shift+Enter for new line)..." rows="1" className="flex-1 bg-white rounded-2xl px-5 py-4 text-base sm:text-sm font-medium outline-none shadow-sm text-gray-900 focus:ring-2 focus:ring-blue-100 resize-none" /><button onClick={() => sendHuman()} disabled={!humanReply.trim()} className={`w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm active:scale-95 disabled:opacity-50 transition-all`}><Send size={20} className="ml-1" /></button></div>
          </div>
        )
      ) : (<div className="bg-emerald-50 p-4 text-center border-t border-emerald-100 pb-6 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]"><p className="text-xs font-black text-emerald-800 uppercase tracking-widest flex items-center justify-center gap-1.5"><Bot size={14}/> AI is handling this chat.</p><p className="text-xs text-emerald-600 mt-1 font-medium">Pause the AI in the top right to reply manually.</p></div>)}
    </div>
  );
}

function ClientBookings({ db, updateDb, dbRef, clientId }) {
  const res = (db?.reservations || []).filter(r => r.restaurantId === clientId).sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
  return (
    <div className="space-y-4">
      {res.length === 0 ? <p className="text-center text-gray-500 p-10 font-bold bg-white rounded-3xl border border-gray-100 shadow-sm">No bookings yet.</p> : 
        res.map(r => (
          <Card key={r.id} className="border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-start mb-2"><h3 className="font-black text-gray-900 text-lg">{r.phone}</h3><div className="flex items-center gap-3"><Badge type="success">{r.status}</Badge><button onClick={() => { updateDb('reservations', (dbRef.current.reservations || []).filter(item => item.id !== r.id)); triggerToast("Booking cleared."); }} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Mark as Completed/Clear"><CheckCircle2 size={16}/></button></div></div>
            <div className="flex gap-5 text-sm font-bold text-gray-500"><span className="flex items-center gap-1.5"><Calendar size={14}/> {r.date}</span><span className="flex items-center gap-1.5"><Clock size={14}/> {r.time}</span></div>
          </Card>
        ))
      }
    </div>
  );
}

function ClientKnowledgeBase({ db, updateDb, dbRef, clientId, openSim, isLocked }) {
  const client = (db?.restaurants || INITIAL_DB.restaurants).find(c => c.id === clientId) || {}; const menu = (db?.menus || INITIAL_DB.menus).filter(m => m.restaurantId === clientId);
  const cleanPhone = String(client.phone || '').replace(/[^0-9]/g, ''); const waLink = `https://wa.me/${cleanPhone}`;
  const [isAddingMode, setIsAddingMode] = useState(false); const [newItem, setNewItem] = useState({ cat: '', name: '', price: '' }); const [isSaving, setIsSaving] = useState(false); 

  const handleUpdateClient = (field, value) => { if ((['name','city','address','phone'].includes(field)) && !String(value).trim()) { return triggerToast("This field cannot be left blank.", 'error'); } updateDb('restaurants', (db?.restaurants || INITIAL_DB.restaurants).map(c => c.id === clientId ? {...c, [field]: String(value).trim()} : c)); setIsSaving(true); setTimeout(() => setIsSaving(false), 1000); };
  const handleDownloadTemplate = () => { const csv = "Category,Item Name,Price\nStarters,Hummus,25 AED\nMain,Chicken Biryani,60 AED"; const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'amanah_menu_template.csv'; a.click(); };
  const handleFileUpload = (e) => {
    const file = e.target.files[0]; if (!file) return; const reader = new FileReader();
    reader.onload = (evt) => {
      const text = String(evt.target.result); const lines = text.split(/\r?\n/); const newMenus = []; const currentDb = dbRef.current; 
      for (let i=1; i<lines.length; i++) { const line = lines[i].trim(); if (!line) continue; const parts = line.split(','); if (parts.length >= 3) { const cat = parts[0].trim(); const price = parts[parts.length - 1].trim(); const name = parts.slice(1, -1).join(',').trim(); if (name && price) { newMenus.push({ id: Date.now() + i + Math.random(), restaurantId: clientId, cat, name, price }); } } }
      if (newMenus.length > 0) { updateDb('menus', [...(currentDb.menus || []), ...newMenus]); triggerToast(`Successfully imported ${newMenus.length} items!`); } else { triggerToast("No valid items found. Please ensure format is: Category, Name, Price", "error"); } e.target.value = ''; 
    }; reader.readAsText(file);
  };
  const handleAddMenu = () => { if(!newItem.name || !newItem.price) return triggerToast("Name and Price are required.", "error"); updateDb('menus', [...(db?.menus || INITIAL_DB.menus), { id: Date.now(), restaurantId: clientId, ...newItem }]); setIsAddingMode(false); setNewItem({ cat: '', name: '', price: '' }); triggerToast("Menu item added successfully!"); };

  return (
    <div className={`space-y-6 ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex gap-2"><button onClick={openSim} className="flex-1 bg-[#25D366] text-white py-5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform hover:bg-[#20bd5a]"><Bot size={22}/> <span className="hidden sm:inline">Test Internal</span> Simulator</button><button onClick={() => window.open(waLink, '_blank')} className="flex-1 bg-white border-2 border-[#25D366] text-[#25D366] py-5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform hover:bg-green-50"><ExternalLink size={20}/> Real WhatsApp</button></div>
      <div className="flex justify-end px-1">{isSaving && <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1 animate-pulse"><Check size={12}/> Auto-Saved</span>}</div>
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 space-y-5">
        <h2 className="font-black text-purple-900 text-lg flex items-center gap-2"><CalendarDays size={20}/> Reservation Handling</h2>
        <div className="space-y-4">
          <div><label className={CSS.lbl}>How should AI handle bookings?</label><select value={client.reservationMode || 'Internal'} onChange={e => handleUpdateClient('reservationMode', e.target.value)} className={CSS.inp}><option value="Internal">Amanah System</option><option value="Link">External Link</option><option value="API">API Webhook</option></select></div>
          {client.reservationMode === 'Internal' && (<div className="space-y-4 pt-3 border-t border-purple-200"><div><label className={CSS.lbl}>Total Tables</label><Inp type="number" defaultValue={client.totalTables} onBlur={e => handleUpdateClient('totalTables', e.target.value)} placeholder="e.g. 15" /></div><div><label className={CSS.lbl}>Max Guests</label><Inp type="number" defaultValue={client.maxPax} onBlur={e => handleUpdateClient('maxPax', e.target.value)} placeholder="e.g. 8" /></div><p className="text-xs text-purple-800 font-medium leading-relaxed bg-white/50 p-3 rounded-lg border border-purple-100">The AI will politely collect the customer's Name, Date, Time, and Guest Count, and will strictly refuse parties larger than your max allowed guests.</p></div>)}
          {client.reservationMode === 'Link' && (<div className="pt-3 border-t border-purple-200"><label className={CSS.lbl}>Booking URL</label><Inp defaultValue={client.resLink} onBlur={e => handleUpdateClient('resLink', e.target.value)} placeholder="https://..." /></div>)}
          {client.reservationMode === 'API' && (<div className="pt-3 border-t border-purple-200"><label className={CSS.lbl}>API Webhook URL</label><Inp defaultValue={client.resApiUrl} onBlur={e => handleUpdateClient('resApiUrl', e.target.value)} placeholder="https://api.yourbooking.com/v1/create" /></div>)}
        </div>
      </Card>
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 space-y-4">
        <h2 className="font-black text-blue-900 text-lg flex items-center gap-2"><MapPin size={20}/> Basic Info & Location</h2>
        <div className="space-y-4"><div><label className={CSS.lbl}>City</label><Inp defaultValue={client.city} onBlur={e => handleUpdateClient('city', e.target.value)} placeholder="City" /></div><div><label className={CSS.lbl}>Full Address</label><Inp defaultValue={client.address} onBlur={e => handleUpdateClient('address', e.target.value)} placeholder="Address" /></div><div><label className={CSS.lbl}>Google Maps Link</label><Inp defaultValue={client.mapsLink} onBlur={e => handleUpdateClient('mapsLink', e.target.value)} placeholder="Maps Link" /></div><div><label className={CSS.lbl}>Opening Hours</label><textarea defaultValue={client.hours} onBlur={e => handleUpdateClient('hours', e.target.value)} className={`${CSS.inp} h-24`} rows="3" placeholder="Hours" /></div></div>
      </Card>
      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 space-y-4">
        <h2 className="font-black text-orange-900 text-lg flex items-center gap-2"><Utensils size={20}/> Food Delivery Links</h2>
        <div className="space-y-4"><div><label className={CSS.lbl}>Link 1</label><Inp defaultValue={client.deliveryLink1} onBlur={e => handleUpdateClient('deliveryLink1', e.target.value)} placeholder="https://..." /></div><div><label className={CSS.lbl}>Link 2</label><Inp defaultValue={client.deliveryLink2} onBlur={e => handleUpdateClient('deliveryLink2', e.target.value)} placeholder="https://..." /></div><div><label className={CSS.lbl}>Link 3</label><Inp defaultValue={client.deliveryLink3} onBlur={e => handleUpdateClient('deliveryLink3', e.target.value)} placeholder="https://..." /></div></div>
      </Card>
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 space-y-3">
        <h2 className="font-black text-emerald-900 text-lg flex items-center gap-2"><BookOpen size={18}/> General Policies</h2>
        <textarea defaultValue={client.businessInfo} onBlur={e => handleUpdateClient('businessInfo', e.target.value)} className={`${CSS.inp} h-32`} rows="4" placeholder="Parking, Dress Code, etc..." />
      </Card>
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-gray-200 pb-2"><h2 className="font-black text-gray-800 text-lg">Menu Knowledge Base</h2><Badge type="default">{menu.length} Items</Badge></div>
        <div className="flex gap-3"><button onClick={handleDownloadTemplate} className="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:bg-gray-50 transition-colors shadow-sm"><Download size={16}/> Template</button><label className="flex-1 bg-emerald-50 border-2 border-emerald-200 text-emerald-800 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer hover:bg-emerald-100 transition-colors shadow-sm"><Upload size={16}/> Bulk Upload<input type="file" accept=".csv, text/csv, application/vnd.ms-excel, application/csv" className="hidden" onChange={handleFileUpload} /></label></div>
        {isAddingMode ? (
          <Card className="bg-emerald-50 border-emerald-200 space-y-4 shadow-md"><h3 className="font-black text-base text-emerald-900">Add New Dish</h3><Inp value={newItem.cat} onChange={e=>setNewItem({...newItem, cat: e.target.value})} placeholder="Category" /><Inp value={newItem.name} onChange={e=>setNewItem({...newItem, name: e.target.value})} placeholder="Dish Name" autoFocus /><Inp value={newItem.price} onChange={e=>setNewItem({...newItem, price: e.target.value})} placeholder="Price" /><div className="flex gap-3 pt-2"><Btn onClick={handleAddMenu} className="flex-1">Save Item</Btn><button onClick={() => setIsAddingMode(false)} className="flex-1 bg-white text-gray-600 py-3.5 rounded-xl font-black text-[10px] uppercase border border-gray-200">Cancel</button></div></Card>
        ) : ( <button onClick={() => setIsAddingMode(true)} className="w-full bg-white text-[#064e3b] py-5 rounded-2xl border-2 border-dashed font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-emerald-50"><Plus size={18}/> Add Single Item</button> )}
        <div className="space-y-2">
          {menu.length === 0 && !isAddingMode && <p className="text-xs text-gray-500 font-bold text-center p-4">No menu items yet. Add one or upload a template.</p>}
          {menu.map(m => (<Card key={m.id} className="flex justify-between items-center shadow-sm"><div><h3 className="font-black text-gray-900 text-base leading-tight">{m.name}</h3><p className="text-[10px] text-gray-500 font-bold uppercase mt-1">{m.cat || 'Uncategorized'}</p></div><div className="flex items-center gap-4"><div className="font-black font-mono text-emerald-700 text-lg">{m.price}</div><button onClick={() => { updateDb('menus', (dbRef.current.menus || []).filter(item => item.id !== m.id)); triggerToast("Removed."); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button></div></Card>))}
        </div>
      </div>
    </div>
  );
}

function ClientSettings({ db, updateDb, dbRef, clientId, isLocked, pricing, authUser, openApiRules, onLogout }) {
  const [showPayModal, setShowPayModal] = useState(false); const [txnId, setTxnId] = useState(''); const [showPwd, setShowPwd] = useState(false); const [showToken, setShowToken] = useState(false); const [viewInvoice, setViewInvoice] = useState(null); const [delConfirm, setDelConfirm] = useState(false);
  const client = (db?.restaurants || INITIAL_DB.restaurants).find(c => c.id === clientId) || {}; const clientUser = (db?.users || INITIAL_DB.users).find(u => u.id === authUser.id) || {}; const bank = pricing?.bank;
  
  const setupFee = Number(pricing?.setupFee) || 0;
  const annualFee = Number(pricing?.annualFee) || 0;
  const discountPercent = Number(pricing?.discountPercent) || 0;
  
  const totalBaseDue = client.hasPaidSetup ? annualFee : (setupFee + annualFee);
  const discountAmount = totalBaseDue * (discountPercent / 100);
  const finalDue = totalBaseDue - discountAmount;

  const handleUpdateProfile = (e) => {
    e.preventDefault(); const fd = new FormData(e.target);
    const nName = String(fd.get('name') || '').trim(); const nPhone = String(fd.get('phone') || '').trim(); const nEmail = String(fd.get('email') || '').trim(); const nPwd = String(fd.get('password') || '').trim();
    if (!nName || !nPhone || !nEmail || !nPwd) return triggerToast("Fields cannot be empty.", 'error');
    if (!nPhone.startsWith('+')) return triggerToast("Phone must start with '+'", "error");
    if (nPwd.length < 5) return triggerToast('Password must be 5+ characters.', 'error');
    if ((db?.users || INITIAL_DB.users).find(u => u.email.toLowerCase() === nEmail.toLowerCase() && u.id !== authUser.id)) return triggerToast("Email in use.", 'error');
    updateDb('restaurants', (db?.restaurants || INITIAL_DB.restaurants).map(c => c.id === clientId ? { ...c, name: nName, phone: nPhone } : c)); updateDb('users', (db?.users || INITIAL_DB.users).map(u => u.id === authUser.id ? { ...u, email: nEmail, name: nName, password: nPwd } : u)); triggerToast("Profile updated!");
  };

  const handleUpdateAPI = (e) => {
    e.preventDefault(); const fd = new FormData(e.target);
    const pNumber = String(fd.get('phone')||'').trim(); const waba = String(fd.get('wabaId')||'').trim(); const pId = String(fd.get('phoneId')||'').trim(); const token = String(fd.get('sysAccessToken')||'').trim();
    if (!pNumber.startsWith('+')) return triggerToast("Phone number must start with '+'", "error");
    if (!/^\d{10,20}$/.test(waba) || !/^\d{10,20}$/.test(pId)) return triggerToast("Invalid WABA/Phone ID (numeric only).", "error");
    if (!token.startsWith('EA') || token.length < 50) return triggerToast("Invalid Access Token. Must start with 'EA'.", "error");
    updateDb('restaurants', (db?.restaurants || INITIAL_DB.restaurants).map(c => c.id === clientId ? { ...c, wabaId: waba, phoneId: pId, sysAccessToken: token, phone: pNumber, waConnected: true } : c)); triggerToast("API Credentials saved.");
  };

  const handleSubmitManualPayment = () => {
    if(!txnId) return triggerToast("Enter Bank Ref or UPI Txn ID.", 'error');
    updateDb('payments', [...(db?.payments || INITIAL_DB.payments), { id: `TXN-${Date.now()}`, restaurantId: clientId, amount: finalDue, currency: pricing?.currency || 'USD', type: client.hasPaidSetup ? 'Renewal' : 'Setup + Renewal', status: 'Pending', date: new Date().toISOString(), refId: txnId }]); 
    updateDb('restaurants', (db?.restaurants || INITIAL_DB.restaurants).map(c => c.id === clientId ? { ...c, status: 'Pending' } : c));
    setShowPayModal(false); setTxnId(''); triggerToast("Payment submitted for Admin review.");
  };

  const handleRazorpayCheckout = () => {
    if (!(db?.adminSettings?.razorpayKeyId)) return triggerToast("Online payments disabled by Admin. Use Manual Wire / UPI.", "error");
    triggerToast("Razorpay Gateway initializing...", "warning");
  };

  const handleDeleteAccount = () => { updateDb('restaurants', (db?.restaurants||INITIAL_DB.restaurants).filter(r=>r.id!==clientId)); updateDb('users', (db?.users||INITIAL_DB.users).filter(u=>u.id!==authUser.id)); triggerToast("Account deleted.","error"); onLogout(); };

  if (viewInvoice) {
    const issueDate = viewInvoice.date ? new Date(viewInvoice.date).toLocaleDateString('en-GB') : 'N/A';
    return (
      <div className="fixed inset-0 bg-gray-900 sm:bg-black/60 z-[200] flex justify-center sm:items-center overflow-y-auto p-4">
        <div className="bg-white w-full max-w-2xl sm:rounded-3xl shadow-2xl flex flex-col h-full sm:h-auto">
          <div className="p-4 bg-gray-50 flex justify-between border-b shrink-0"><h3 className="font-bold flex items-center gap-2"><Receipt size={18}/> Invoice Details</h3><button onClick={() => setViewInvoice(null)} className="p-2 bg-gray-200 rounded-full"><X size={16}/></button></div>
          <div id="client-invoice-pdf" className="p-8 sm:p-10 space-y-8 bg-white flex-1 overflow-y-auto">
            <div className="flex justify-between items-start border-b-2 pb-8"><div><h1 className="text-3xl font-black text-[#064e3b] mb-1">INVOICE</h1><p className="text-sm font-bold text-gray-500 uppercase">{viewInvoice.id}</p></div><div className="text-right"><h2 className="font-black text-lg">{BRAND.company}</h2><p className="text-xs text-gray-500 mt-1">{BRAND.hq}</p><p className="text-xs text-gray-500 mt-1">{BRAND.email}</p></div></div>
            <div className="flex justify-between"><div><p className="text-[10px] font-black text-gray-400 uppercase mb-1.5">Bill To</p><p className="font-bold text-lg">{viewInvoice.restaurantName}</p><p className="text-sm text-gray-600">{viewInvoice.restaurantCity}, {viewInvoice.restaurantCountry}</p></div><div className="text-right"><p className="text-[10px] font-black text-gray-400 uppercase mb-1.5">Date</p><p className="font-bold text-sm">{issueDate}</p></div></div>
            <div className="border rounded-xl overflow-hidden"><table className="w-full text-left text-sm"><thead className="bg-gray-50"><tr><th className="p-4 font-black text-gray-600 uppercase text-[10px]">Description</th><th className="p-4 text-right font-black text-gray-600 uppercase text-[10px]">Amount</th></tr></thead><tbody className="divide-y"><tr><td className="p-4"><p className="font-bold text-base">{BRAND.product} License</p><p className="text-xs text-gray-500">{viewInvoice.type}</p></td><td className="p-4 text-right font-mono font-bold text-lg">{viewInvoice.amount} {viewInvoice.currency}</td></tr></tbody><tfoot className="bg-gray-50"><tr><td className="p-4 text-right font-black uppercase text-xs pt-6">Total Paid</td><td className="p-4 text-right font-black font-mono text-xl text-[#064e3b] pt-6">{viewInvoice.amount} {viewInvoice.currency}</td></tr></tfoot></table></div>
            <div className="pt-6 text-center pb-10"><p className="text-sm font-bold">Status: <span className="text-emerald-600">PAID & VERIFIED</span></p><p className="text-xs text-gray-500 font-mono">Bank Ref: {viewInvoice.refId}</p></div>
          </div>
          <div className="p-4 bg-gray-50 border-t flex justify-end shrink-0"><Btn onClick={() => generatePDF('client-invoice-pdf', `${safeFileName(viewInvoice.id)}.pdf`)}><Printer size={16}/> Save PDF</Btn></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4 border-2"><h2 className="font-black text-gray-800 text-lg flex items-center gap-2"><Settings size={18}/> Profile</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div><label className={CSS.lbl}>Name</label><Inp name="name" defaultValue={client.name} required /></div>
          <div><label className={CSS.lbl}>Phone</label><Inp type="tel" name="phone" defaultValue={client.phone} required placeholder="+971..." /></div>
          <div><label className={CSS.lbl}>Email</label><Inp type="email" name="email" defaultValue={clientUser.email} required /></div>
          <div><label className={CSS.lbl}>Password</label><div className="relative"><Inp type={showPwd ? "text" : "password"} name="password" defaultValue={clientUser.password} required /><button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"><EyeOff size={18}/></button></div></div>
          <Btn type="submit" className="w-full mt-2">Save Changes</Btn>
        </form>
      </Card>
      
      <Card className="bg-gradient-to-br from-[#064e3b] to-emerald-900 text-white p-6 border-none shadow-2xl">
        <div className="flex justify-between items-start mb-6"><div><h2 className="text-2xl font-black mb-1">Billing</h2></div><Badge type={client.status === 'Active' ? 'success' : client.status === 'Trial' ? 'trial' : 'danger'}>{client.status}</Badge></div>
        <div className="space-y-4 pt-4 border-t border-emerald-800/50">
           <div className="flex justify-between"><span className="text-sm text-emerald-100">Expiry Date</span><span className="font-bold">{new Date(client.expiryDate || new Date()).toLocaleDateString('en-GB')}</span></div>
           <div className="flex justify-between text-lg mt-2"><span className="font-bold">Total Due</span><span className="font-black font-mono text-2xl text-emerald-300">{finalDue} {pricing?.currency}</span></div>
           <button onClick={() => setShowPayModal(true)} disabled={client.status === 'Pending'} className="w-full bg-white text-[#064e3b] py-4 rounded-xl font-black text-xs uppercase shadow-xl disabled:opacity-50 mt-6">{client.status === 'Pending' ? 'Under Review' : 'Pay Now'}</button>
        </div>
      </Card>

      {showPayModal && bank && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-end sm:items-center justify-center p-4 pb-6 no-print">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowPayModal(false)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><X size={18}/></button>
            <div className="text-center mb-6"><h2 className="text-2xl font-black text-gray-900 mt-4">Bank Transfer</h2></div>
            
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-center mb-6">
              <p className="text-xs font-black text-emerald-800 uppercase mb-1.5">Amount Due</p>
              {discountPercent > 0 && <p className="text-sm font-bold text-gray-400 line-through mb-1">{totalBaseDue} {pricing?.currency}</p>}
              <p className="text-4xl font-black font-mono text-emerald-900">{finalDue} <span className="text-xl">{pricing?.currency}</span></p>
              {discountPercent > 0 && <p className="text-[10px] font-black text-emerald-600 mt-2 bg-emerald-100 py-1.5 rounded animate-pulse uppercase tracking-widest">{discountPercent}% Discount Applied!</p>}
            </div>
            
            <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Bank Details ({pricing?.country})</p>
              <p className="font-bold text-sm">{bank.bankName}</p>
              <p className="font-bold text-sm">{bank.accountName}</p>
              <p className="font-black font-mono text-lg">{bank.accountNum}</p>
              <p className="font-bold font-mono text-sm">{bank.routing}</p>
              {bank.upiId && <div className="mt-3 pt-3 border-t border-gray-200"><p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Direct UPI</p><p className="font-black font-mono text-sm text-[#064e3b]">{bank.upiId}</p></div>}
              {bank.upiPhone && <p className="font-bold font-mono text-sm text-[#064e3b]">Ph: {bank.upiPhone}</p>}
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3 shadow-sm">
              <Inp value={txnId} onChange={e=>setTxnId(e.target.value)} placeholder="Enter Bank Txn ID or UPI Ref" />
              <Btn onClick={handleSubmitManualPayment} className="w-full mt-2">Submit Payment for Review</Btn>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
               <button onClick={handleRazorpayCheckout} className="w-full bg-[#0d2366] text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"><CreditCard size={16} /> Pay via Razorpay Gateway</button>
            </div>
          </div>
        </div>
      )}

      {(db?.invoices || []).filter(i => i.restaurantId === clientId).length > 0 && (
        <Card className="space-y-4 border-2 shadow-sm"><h2 className="font-black text-gray-800 text-lg flex items-center gap-2 border-b pb-3"><FileText size={18}/> Billing History</h2>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
             {(db?.invoices || []).filter(i => i.restaurantId === clientId).sort((a,b)=>new Date(b.date||0)-new Date(a.date||0)).map(inv => (
               <div key={inv.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border"><div><p className="font-black text-sm">{inv.amount} {inv.currency}</p><p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">{inv.date ? new Date(inv.date).toLocaleDateString('en-GB') : ''}</p></div><button onClick={() => setViewInvoice(inv)} className="text-[10px] bg-white border px-3 py-1.5 rounded-lg font-black uppercase shadow-sm hover:bg-gray-50">View PDF</button></div>
             ))}
          </div>
        </Card>
      )}

      <div className={`${isLocked ? 'opacity-50 pointer-events-none' : ''} space-y-6`}>
        <Card className="space-y-5 border-2">
          <div className="flex justify-between items-center border-b pb-4"><h2 className="font-black text-gray-900 text-lg">Meta Cloud API</h2><Badge type={client.waConnected ? 'success' : 'danger'}>{client.waConnected ? 'Connected' : 'Offline'}</Badge></div>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex gap-3 mb-2"><Info className="text-blue-600 shrink-0 mt-0.5" size={20}/><div><p className="text-sm text-blue-900 font-bold mb-1">CRITICAL: Phone Rules</p><button type="button" onClick={openApiRules} className="text-[10px] font-black uppercase text-blue-700 underline">Read Policy</button></div></div>
          <form onSubmit={handleUpdateAPI} className="space-y-4">
            <div><label className={CSS.lbl}>Dedicated Meta Phone Number</label><Inp name="phone" defaultValue={client.phone} required placeholder="+971..." /></div>
            <div><label className={CSS.lbl}>WABA ID (WhatsApp Business Account ID)</label><Inp name="wabaId" defaultValue={client.wabaId} required placeholder="WABA ID" /></div>
            <div><label className={CSS.lbl}>Phone Number ID</label><Inp name="phoneId" defaultValue={client.phoneId} required placeholder="Phone ID" /></div>
            <div><label className={CSS.lbl}>System User Access Token</label><div className="relative"><Inp type={showToken ? "text" : "password"} name="sysAccessToken" defaultValue={client.sysAccessToken} required placeholder="EA..." /><button type="button" onClick={() => setShowToken(!showToken)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"><EyeOff size={18}/></button></div></div>
            <Btn type="submit" className="w-full mt-2">Save Meta Settings</Btn>
          </form>
        </Card>
      </div>

      <div className="text-center pt-8">
        {!delConfirm ? (<button type="button" onClick={()=>setDelConfirm(true)} className="text-xs font-bold text-red-600 hover:underline">Permanently Delete Account</button>) : (<Btn type="button" onClick={handleDeleteAccount} variant="red" className="w-full max-w-sm mx-auto">Confirm Deletion</Btn>)}
      </div>
    </div>
  );
}

function AIGenericChatWindow({ db, updateDb, dbRef, clientId, mode, onClose, isLocked }) {
  const [inputText, setInputText] = useState(''); const [isTyping, setIsTyping] = useState(false); const endRef = useRef(null);
  const client = (db?.restaurants || INITIAL_DB.restaurants).find(c => c.id === clientId) || {}; const isSupportMode = mode === 'support';
  const chatHistory = isSupportMode ? (db?.supportMessages || INITIAL_DB.supportMessages).filter(m => m.restaurant_id === clientId) : (db?.messages || INITIAL_DB.messages).filter(m => m.restaurant_id === clientId);

  useEffect(() => { const t = setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); return () => clearTimeout(t); }, [chatHistory, isTyping]);

  const handleClearChat = () => {
    const dbTarget = isSupportMode ? 'supportMessages' : 'messages';
    updateDb(dbTarget, (dbRef.current[dbTarget] || []).filter(m => m.conversation_id !== (isSupportMode ? 'SC001' : 'C001')));
    triggerToast("Simulation chat cleared.");
  };

  const askGemini = async (userText) => {
    if (!isSupportMode && isLocked) return "⚠️ ERROR: Your subscription is suspended.";
    const apiKey = db?.adminSettings?.apiKey; const aiModel = db?.adminSettings?.aiModel || 'gemini-2.5-flash'; 
    if (!apiKey) return "⚠️ AI Engine is offline. Contact Admin.";

    let systemPrompt = "CRITICAL RULE: You must instantly detect the language the user is speaking and reply fluently in that exact same language. You are a highly professional polyglot.\n";
    if (isSupportMode) systemPrompt += "You are the Amanah Support Bot. Explain Meta API rules, Pricing, and Setup clearly.";
    else {
      const menuString = (db?.menus || INITIAL_DB.menus).filter(m => m.restaurantId === clientId).map(m => `${m.name}: ${m.price}`).join(', ');
      let rInst = client.reservationMode === 'Internal' ? "Collect: Date, Time, Pax, Name." : "Tell them to book online.";
      systemPrompt += `You are the bot for ${client.name}. City: ${client.city}. Hours: ${client.hours}. Policies: ${client.businessInfo}. Menu: ${menuString}. Rule: No Hallucinations. ${rInst}`;
    }

    try {
      const controller = new AbortController(); const timeoutId = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ systemInstruction: { parts: [{ text: systemPrompt }] }, contents: [{ parts: [{ text: userText }] }] }), signal: controller.signal });
      clearTimeout(timeoutId); const data = await res.json();
      if (data.error) throw new Error(data.error.message); return data.candidates[0].content.parts[0].text;
    } catch (e) {
      if (e.name === 'AbortError') return "⚠️ Network timeout. AI took too long."; return `⚠️ API Error: ${e.message}`;
    }
  };

  const handleSend = async () => {
    if(!inputText.trim() || isTyping) return;
    const txt = inputText; setInputText(''); setIsTyping(true); 
    const dbTarget = isSupportMode ? 'supportMessages' : 'messages'; const convTarget = isSupportMode ? 'supportConversations' : 'conversations';
    const cDb = dbRef.current; let eConv = (cDb[convTarget] || []).find(c => c.conversation_id === (isSupportMode ? 'SC001' : 'C001'));
    let autoResumed = false;
    
    if (eConv && eConv.ai_paused && eConv.last_message_time && (Date.now() - new Date(eConv.last_message_time).getTime()) / 3600000 > 12) { eConv.ai_paused = false; autoResumed = true; triggerToast("AI auto-resumed.", "success"); }
    updateDb(dbTarget, [...(cDb[dbTarget] || []), { message_id: `M${Date.now()}`, conversation_id: isSupportMode ? 'SC001' : 'C001', restaurant_id: clientId, sender: 'customer', text: txt, timestamp: new Date().toISOString() }]);
    if (eConv) updateDb(convTarget, (cDb[convTarget] || []).map(c => c.conversation_id === (isSupportMode ? 'SC001' : 'C001') ? { ...c, last_message: txt, last_message_time: new Date().toISOString(), ai_paused: eConv.ai_paused } : c));
    else updateDb(convTarget, [...(cDb[convTarget] || []), { conversation_id: isSupportMode ? 'SC001' : 'C001', restaurant_id: clientId, customer_phone: '+971501234567', last_message: txt, last_message_time: new Date().toISOString(), ai_paused: false }]);
    if (eConv?.ai_paused && !autoResumed) { setIsTyping(false); return; }

    const aiTxt = await askGemini(txt); setIsTyping(false);
    updateDb(dbTarget, [...(dbRef.current[dbTarget] || []), { message_id: `M${Date.now()+1}`, conversation_id: isSupportMode ? 'SC001' : 'C001', restaurant_id: clientId, sender: 'AI', text: aiTxt, timestamp: new Date().toISOString() }]);
    updateDb(convTarget, (dbRef.current[convTarget] || []).map(c => c.conversation_id === (isSupportMode ? 'SC001' : 'C001') ? { ...c, last_message: aiTxt, last_message_time: new Date().toISOString() } : c));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex flex-col justify-end sm:justify-center sm:p-6 backdrop-blur-sm no-print">
      <div className="w-full h-[90vh] sm:h-[80vh] sm:max-w-2xl sm:mx-auto bg-[#EFEAE2] flex flex-col sm:rounded-3xl overflow-hidden shadow-2xl relative border">
        <div className={`${isSupportMode ? 'bg-blue-600' : 'bg-[#075E54]'} text-white p-4 flex items-center justify-between shadow-md z-10`}><div className="flex items-center gap-3"><div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">{isSupportMode ? <HelpCircle size={20}/> : <Bot size={20}/>}</div><h3 className="font-bold text-sm">{isSupportMode ? 'Support AI' : 'Bot Simulator'}</h3></div><div className="flex gap-2"><button onClick={handleClearChat} className="p-2.5 bg-white/10 rounded-xl hover:bg-red-500"><Trash2 size={18}/></button><button onClick={onClose} className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20"><X size={18} /></button></div></div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-cover">
          {chatHistory.map(m => (<div key={m.message_id} className={`flex flex-col ${m.sender === 'AI' || m.sender === 'staff' ? 'items-start' : 'items-end'}`}><div className={`p-3.5 rounded-2xl max-w-[85%] text-sm shadow-sm whitespace-pre-wrap break-words font-medium ${m.sender === 'AI' || m.sender === 'staff' ? 'bg-[#DCF8C6] rounded-tr-none text-gray-900' : 'bg-white rounded-tl-none text-gray-900'}`}>{m.text}<span className={`text-[8px] font-bold mt-1 block ${m.sender === 'AI' || m.sender === 'staff' ? 'text-emerald-700/60 text-right' : 'text-gray-400 text-left'}`}>{m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span></div></div>))}
          {isTyping && <div className="p-4 rounded-2xl bg-white w-16 shadow-sm flex justify-center gap-1"><span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span></div>}
          <div ref={endRef} />
        </div>
        <div className="bg-[#F0F0F0] p-3 pb-6 flex gap-2 items-end shadow-inner">
          <input value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key==='Enter' && handleSend()} disabled={isTyping} placeholder="Message..." className="flex-1 bg-white rounded-2xl px-5 py-4 text-base font-medium outline-none disabled:opacity-50" />
          <button onClick={handleSend} disabled={!inputText.trim() || isTyping} className={`w-14 h-14 ${isSupportMode?'bg-blue-600':'bg-[#00A884]'} text-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm disabled:opacity-50`}><Send size={20} className="ml-1" /></button>
        </div>
      </div>
    </div>
  );
}