import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { collection, addDoc, query, where, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { Poem } from "../types";
import { 
  PenTool, 
  Plus, 
  Trash2, 
  Heart, 
  Share2, 
  Feather,
  Save,
  X,
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PoetryCornerProps {
  user: User;
  goHome: () => void;
}

export default function PoetryCorner({ user, goHome }: PoetryCornerProps) {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPoems();
  }, [user.uid]);

  async function fetchPoems() {
    try {
      const q = query(
        collection(db, "poems"),
        where("uid", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setPoems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Poem)));
    } catch (error) {
      console.error("Error fetching poems:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!newTitle || !newContent) return;

    try {
      const poem = {
        uid: user.uid,
        title: newTitle,
        content: newContent,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, "poems"), poem);
      setNewTitle("");
      setNewContent("");
      setIsAdding(false);
      fetchPoems();
    } catch (error) {
      console.error("Error saving poem:", error);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteDoc(doc(db, "poems", id));
      fetchPoems();
    } catch (error) {
      console.error("Error deleting poem:", error);
    }
  }

  return (
    <div className="space-y-8">
      <button 
        onClick={goHome}
        className="flex items-center gap-2 text-slate-500 hover:text-pink-600 transition-colors font-medium text-sm mb-4 group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Voltar para Início
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Canto da Poesia</h2>
          <p className="text-slate-500">Onde a alma acadêmica encontra sua voz artística.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-pink-600 text-white py-3 px-6 rounded-2xl font-bold flex items-center gap-2 hover:bg-pink-700 transition-colors shadow-lg shadow-pink-100"
        >
          <Plus className="w-5 h-5" />
          Nova Poesia
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
              <div className="p-6 bg-pink-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Feather className="w-6 h-6" />
                  <h3 className="font-bold text-xl">Inspirar-se</h3>
                </div>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 uppercase">Título</label>
                  <input 
                    type="text" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Dê um nome à sua inspiração..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none transition-all text-lg font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 uppercase">Versos</label>
                  <textarea 
                    rows={8}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Escreva aqui seus versos, rimas e sentimentos..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none transition-all resize-none italic leading-relaxed"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-4 px-6 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSave}
                    className="flex-1 py-4 px-6 bg-pink-600 text-white rounded-2xl font-bold hover:bg-pink-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-pink-100"
                  >
                    <Save className="w-5 h-5" />
                    Salvar Poesia
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {poems.map((poem) => (
          <motion.div
            layout
            key={poem.id}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-pink-50 text-pink-500 rounded-xl">
                <PenTool className="w-5 h-5" />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-pink-500 transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => poem.id && handleDelete(poem.id)}
                  className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h4 className="text-xl font-bold text-slate-900 mb-3">{poem.title}</h4>
            <p className="text-slate-600 italic leading-relaxed whitespace-pre-wrap flex-1 mb-6">
              {poem.content}
            </p>
            
            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                {format(new Date(poem.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}
              </span>
              <div className="flex items-center gap-1 text-pink-500">
                <Heart className="w-4 h-4 fill-current" />
                <span className="text-xs font-bold">Inspirado</span>
              </div>
            </div>
          </motion.div>
        ))}

        {poems.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mx-auto">
              <Feather className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-slate-900">Nenhuma poesia ainda</p>
              <p className="text-slate-500">Sua jornada literária começa com o primeiro verso.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
