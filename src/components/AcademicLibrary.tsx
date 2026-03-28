import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { collection, addDoc, query, where, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { Book, BookType } from "../types";
import { 
  Library, 
  Plus, 
  Trash2, 
  BookOpen, 
  Search,
  X,
  ChevronLeft,
  User as UserIcon,
  Star,
  Book as BookIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AcademicLibraryProps {
  user: User;
  goHome: () => void;
}

export default function AcademicLibrary({ user, goHome }: AcademicLibraryProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"Todos" | BookType>("Todos");

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newType, setNewType] = useState<BookType>("Famoso");
  const [newDesc, setNewDesc] = useState("");
  const [newCover, setNewCover] = useState("");

  useEffect(() => {
    fetchBooks();
  }, [user.uid]);

  async function fetchBooks() {
    try {
      const q = query(
        collection(db, "books"),
        where("uid", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setBooks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book)));
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!newTitle || !newAuthor) return;

    try {
      const book = {
        uid: user.uid,
        title: newTitle,
        author: newAuthor,
        type: newType,
        description: newDesc,
        coverUrl: newCover || `https://picsum.photos/seed/${newTitle}/200/300`,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, "books"), book);
      resetForm();
      fetchBooks();
    } catch (error) {
      console.error("Error saving book:", error);
    }
  }

  function resetForm() {
    setNewTitle("");
    setNewAuthor("");
    setNewType("Famoso");
    setNewDesc("");
    setNewCover("");
    setIsAdding(false);
  }

  async function handleDelete(id: string) {
    try {
      await deleteDoc(doc(db, "books", id));
      fetchBooks();
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  }

  const filteredBooks = filter === "Todos" ? books : books.filter(b => b.type === filter);

  return (
    <div className="space-y-8">
      <button 
        onClick={goHome}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium text-sm mb-4 group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Voltar para Início
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Biblioteca Acadêmica</h2>
          <p className="text-slate-500">Sua coleção pessoal de referências e obras autorais.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 text-white py-3 px-6 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
        >
          <Plus className="w-5 h-5" />
          Adicionar Livro
        </button>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        {(["Todos", "Famoso", "Autônomo"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              filter === t ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {filteredBooks.map((book) => (
          <motion.div
            layout
            key={book.id}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl transition-all"
          >
            <div className="aspect-[2/3] relative overflow-hidden">
              <img 
                src={book.coverUrl} 
                alt={book.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <button 
                  onClick={() => book.id && handleDelete(book.id)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <p className="text-white text-xs font-medium line-clamp-3 italic">
                  {book.description}
                </p>
              </div>
              <div className="absolute top-2 left-2">
                <span className={`text-[10px] font-bold uppercase py-1 px-2 rounded-lg ${
                  book.type === "Famoso" ? "bg-amber-400 text-amber-900" : "bg-indigo-500 text-white"
                }`}>
                  {book.type}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{book.title}</h4>
              <p className="text-xs text-slate-500 line-clamp-1">{book.author}</p>
            </div>
          </motion.div>
        ))}

        {filteredBooks.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mx-auto">
              <Library className="w-10 h-10" />
            </div>
            <p className="text-slate-500">Nenhum livro encontrado nesta categoria.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 bg-indigo-600 text-white flex items-center justify-between">
                <h3 className="font-bold text-xl">Adicionar à Biblioteca</h3>
                <button onClick={resetForm} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Título da Obra</label>
                  <input 
                    type="text" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ex: O Capital"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Autor</label>
                  <input 
                    type="text" 
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ex: Karl Marx"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Tipo de Autor</label>
                  <div className="flex gap-2">
                    {(["Famoso", "Autônomo"] as BookType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewType(t)}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${
                          newType === t 
                            ? "bg-indigo-600 border-indigo-600 text-white" 
                            : "bg-white border-slate-200 text-slate-500 hover:border-indigo-300"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Descrição/Resumo</label>
                  <textarea 
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    rows={3}
                    placeholder="Uma breve descrição da obra..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">URL da Capa (Opcional)</label>
                  <input 
                    type="text" 
                    value={newCover}
                    onChange={(e) => setNewCover(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="https://..."
                  />
                </div>
                <button 
                  onClick={handleSave}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 mt-4"
                >
                  Adicionar Livro
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
