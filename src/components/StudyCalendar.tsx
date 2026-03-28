import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { collection, addDoc, query, where, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { StudyEvent, EventType } from "../types";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  Clock, 
  Bell, 
  AlertCircle,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "../lib/utils";

interface StudyCalendarProps {
  user: User;
  goHome: () => void;
}

export default function StudyCalendar({ user, goHome }: StudyCalendarProps) {
  const [events, setEvents] = useState<StudyEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [newTime, setNewTime] = useState("09:00");
  const [newType, setNewType] = useState<EventType>("Estudo");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    fetchEvents();
  }, [user.uid, currentMonth]);

  async function fetchEvents() {
    try {
      const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");
      
      const q = query(
        collection(db, "studyEvents"),
        where("uid", "==", user.uid),
        where("date", ">=", start),
        where("date", "<=", end),
        orderBy("date", "asc")
      );
      const snap = await getDocs(q);
      setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyEvent)));
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!newTitle || !newDate) return;

    try {
      const event = {
        uid: user.uid,
        title: newTitle,
        date: newDate,
        time: newTime,
        type: newType,
        description: newDesc,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, "studyEvents"), event);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
    }
  }

  function resetForm() {
    setNewTitle("");
    setNewDate(format(new Date(), "yyyy-MM-dd"));
    setNewTime("09:00");
    setNewType("Estudo");
    setNewDesc("");
    setIsAdding(false);
  }

  async function handleDelete(id: string) {
    try {
      await deleteDoc(doc(db, "studyEvents", id));
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  }

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

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
          <h2 className="text-3xl font-bold text-slate-900">Cronograma de Estudos</h2>
          <p className="text-slate-500">Organize suas datas, provas e lembretes importantes.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 text-white py-3 px-6 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
        >
          <Plus className="w-5 h-5" />
          Novo Evento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar View */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900 capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
              <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {/* Empty cells for padding */}
            {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            
            {days.map(day => {
              const dayEvents = events.filter(e => isSameDay(new Date(e.date), day));
              return (
                <div 
                  key={day.toString()} 
                  className={cn(
                    "aspect-square rounded-lg md:rounded-2xl p-0.5 md:p-1 border transition-all relative group cursor-pointer",
                    isToday(day) ? "border-indigo-500 bg-indigo-50/30" : "border-slate-100 hover:border-slate-200",
                    !isSameMonth(day, currentMonth) && "opacity-30"
                  )}
                >
                  <span className={cn(
                    "text-[10px] md:text-sm font-bold block text-center mt-0.5 md:mt-1",
                    isToday(day) ? "text-indigo-600" : "text-slate-700"
                  )}>
                    {format(day, "d")}
                  </span>
                  <div className="flex flex-wrap justify-center gap-0.5 md:gap-1 mt-0.5 md:mt-1">
                    {dayEvents.slice(0, 3).map((e, idx) => (
                      <div 
                        key={e.id || idx} 
                        className={cn(
                          "w-1 md:w-1.5 h-1 md:h-1.5 rounded-full",
                          e.type === "Prova" ? "bg-red-500" :
                          e.type === "Trabalho" ? "bg-orange-500" :
                          "bg-indigo-500"
                        )} 
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Event List */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-500" />
            Eventos do Mês
          </h3>
          <div className="space-y-4">
            {events.length > 0 ? (
              events.map((event) => (
                <div key={event.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative group">
                  <button 
                    onClick={() => event.id && handleDelete(event.id)}
                    className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={cn(
                      "text-[10px] font-bold uppercase py-0.5 px-2 rounded-full",
                      event.type === "Prova" ? "bg-red-100 text-red-600" :
                      event.type === "Trabalho" ? "bg-orange-100 text-orange-600" :
                      "bg-indigo-100 text-indigo-600"
                    )}>
                      {event.type}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {format(new Date(event.date), "dd/MM")} às {event.time}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900">{event.title}</h4>
                  <p className="text-sm text-slate-500 mt-1">{event.description}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <CalendarIcon className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p className="text-sm text-slate-400">Nenhum evento este mês.</p>
              </div>
            )}
          </div>
        </div>
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
                <h3 className="font-bold text-xl">Novo Evento</h3>
                <button onClick={resetForm} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Título</label>
                  <input 
                    type="text" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ex: Prova de Cálculo I"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Data</label>
                    <input 
                      type="date" 
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Hora</label>
                    <input 
                      type="time" 
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Tipo</label>
                  <select 
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as EventType)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Estudo">Estudo</option>
                    <option value="Prova">Prova</option>
                    <option value="Trabalho">Trabalho</option>
                    <option value="Lembrete">Lembrete</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Descrição</label>
                  <textarea 
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    rows={3}
                    placeholder="Detalhes adicionais..."
                  />
                </div>
                <button 
                  onClick={handleSave}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 mt-4"
                >
                  Criar Evento
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
