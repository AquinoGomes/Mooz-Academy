import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { auth, googleProvider, db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Calendar, 
  PenTool, 
  LayoutDashboard, 
  LogOut, 
  LogIn, 
  Plus, 
  FileText, 
  Clock, 
  Bell,
  ChevronRight,
  User as UserIcon,
  Globe,
  Library,
  Search,
  PlusSquare,
  Compass,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2
} from "lucide-react";
import { cn } from "./lib/utils";
import Dashboard from "./components/Dashboard";
import AcademicAssistant from "./components/AcademicAssistant";
import PoetryCorner from "./components/PoetryCorner";
import StudyCalendar from "./components/StudyCalendar";
import SocialConnect from "./components/SocialConnect";
import AcademicLibrary from "./components/AcademicLibrary";

type Tab = "dashboard" | "academic" | "poetry" | "calendar" | "social" | "library";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Save user profile to Firestore
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: currentUser.uid,
            displayName: currentUser.displayName || "Estudante",
            email: currentUser.email,
            photoURL: currentUser.photoURL || ""
          });
        }
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActiveTab("dashboard");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex flex-col items-center justify-center p-4 text-white">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8 bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/20 shadow-2xl"
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Mooz Academy</h1>
            <p className="text-indigo-100">Sua jornada acadêmica simplificada e inspiradora.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <BookOpen className="w-6 h-6 mx-auto mb-2 text-pink-300" />
              <span>TCC & Artigos</span>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-indigo-300" />
              <span>Cronograma</span>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <PenTool className="w-6 h-6 mx-auto mb-2 text-purple-300" />
              <span>Poesias</span>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <Bell className="w-6 h-6 mx-auto mb-2 text-orange-300" />
              <span>Lembretes</span>
            </div>
          </div>

          <button 
            onClick={handleLogin}
            className="w-full py-4 px-6 bg-white text-indigo-600 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-50 transition-colors shadow-lg"
          >
            <LogIn className="w-5 h-5" />
            Entrar com Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <header className="md:hidden bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-xl font-black tracking-tighter text-slate-900 italic">
          Mooz Academy
        </h1>
        <div className="flex items-center gap-3">
          <Heart className="w-6 h-6 text-slate-700" />
          <MessageCircle className="w-6 h-6 text-slate-700" />
        </div>
      </header>

      {/* Sidebar - Desktop Only */}
      <nav className="hidden md:flex w-64 bg-white border-r border-slate-100 flex-col h-screen sticky top-0">
        <div className="p-8 mb-4">
          <h1 className="text-2xl font-black tracking-tighter text-slate-900 italic">
            Mooz Academy
          </h1>
        </div>

        <div className="flex-1 px-4 space-y-1">
          <NavItem 
            active={activeTab === "dashboard"} 
            onClick={() => setActiveTab("dashboard")}
            icon={<LayoutDashboard className="w-6 h-6" />}
            label="Início"
          />
          <NavItem 
            active={activeTab === "academic"} 
            onClick={() => setActiveTab("academic")}
            icon={<BookOpen className="w-6 h-6" />}
            label="Assistente"
          />
          <NavItem 
            active={activeTab === "library"} 
            onClick={() => setActiveTab("library")}
            icon={<Library className="w-6 h-6" />}
            label="Biblioteca"
          />
          <NavItem 
            active={activeTab === "poetry"} 
            onClick={() => setActiveTab("poetry")}
            icon={<PenTool className="w-6 h-6" />}
            label="Poesia"
          />
          <NavItem 
            active={activeTab === "calendar"} 
            onClick={() => setActiveTab("calendar")}
            icon={<Calendar className="w-6 h-6" />}
            label="Cronograma"
          />
          <NavItem 
            active={activeTab === "social"} 
            onClick={() => setActiveTab("social")}
            icon={<Globe className="w-6 h-6" />}
            label="Redes Sociais"
          />
        </div>

        <div className="p-4 space-y-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-all group"
          >
            <LogOut className="w-6 h-6 group-hover:text-red-500" />
            <span className="font-medium group-hover:text-red-500">Sair</span>
          </button>
          
          <div className="flex items-center gap-4 px-4 py-3 border-t border-slate-100 pt-6">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-0.5">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                alt={user.displayName || ""} 
                className="w-full h-full rounded-full border-2 border-white"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user.displayName}</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-4xl mx-auto p-4 md:p-12"
          >
            {activeTab === "dashboard" && <Dashboard user={user} setActiveTab={setActiveTab} />}
            {activeTab === "academic" && <AcademicAssistant user={user} goHome={() => setActiveTab("dashboard")} />}
            {activeTab === "library" && <AcademicLibrary user={user} goHome={() => setActiveTab("dashboard")} />}
            {activeTab === "poetry" && <PoetryCorner user={user} goHome={() => setActiveTab("dashboard")} />}
            {activeTab === "calendar" && <StudyCalendar user={user} goHome={() => setActiveTab("dashboard")} />}
            {activeTab === "social" && <SocialConnect user={user} goHome={() => setActiveTab("dashboard")} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 flex items-center justify-between z-50">
        <button onClick={() => setActiveTab("dashboard")} className={cn("p-2", activeTab === "dashboard" ? "text-slate-900" : "text-slate-400")}>
          <LayoutDashboard className="w-6 h-6" />
        </button>
        <button onClick={() => setActiveTab("academic")} className={cn("p-2", activeTab === "academic" ? "text-slate-900" : "text-slate-400")}>
          <BookOpen className="w-6 h-6" />
        </button>
        <button onClick={() => setActiveTab("library")} className={cn("p-2", activeTab === "library" ? "text-slate-900" : "text-slate-400")}>
          <Library className="w-6 h-6" />
        </button>
        <button onClick={() => setActiveTab("calendar")} className={cn("p-2", activeTab === "calendar" ? "text-slate-900" : "text-slate-400")}>
          <Calendar className="w-6 h-6" />
        </button>
        <button onClick={() => setActiveTab("social")} className={cn("p-2", activeTab === "social" ? "text-slate-900" : "text-slate-400")}>
          <UserIcon className="w-6 h-6" />
        </button>
      </nav>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group",
        active 
          ? "text-slate-900" 
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      <div className={cn(
        "transition-transform",
        active ? "scale-110" : "group-hover:scale-110"
      )}>
        {icon}
      </div>
      <span className={cn(
        "text-base transition-all",
        active ? "font-bold" : "font-medium"
      )}>
        {label}
      </span>
    </button>
  );
}
