import { useState, useEffect, ReactNode } from "react";
import { User } from "firebase/auth";
import { collection, query, where, limit, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { AcademicWork, StudyEvent, Poem } from "../types";
import { 
  BookOpen, 
  Calendar, 
  PenTool, 
  Clock, 
  ChevronRight,
  Plus,
  Library,
  Share2,
  PlusSquare,
  Heart,
  MessageCircle,
  MoreHorizontal
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DashboardProps {
  user: User;
  setActiveTab: (tab: any) => void;
}

export default function Dashboard({ user, setActiveTab }: DashboardProps) {
  const [recentWorks, setRecentWorks] = useState<AcademicWork[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<StudyEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const worksQuery = query(
          collection(db, "academicWorks"),
          where("uid", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(3)
        );
        const eventsQuery = query(
          collection(db, "studyEvents"),
          where("uid", "==", user.uid),
          where("date", ">=", format(new Date(), "yyyy-MM-dd")),
          orderBy("date", "asc"),
          limit(3)
        );

        const [worksSnap, eventsSnap] = await Promise.all([
          getDocs(worksQuery),
          getDocs(eventsQuery)
        ]);

        setRecentWorks(worksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AcademicWork)));
        setUpcomingEvents(eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyEvent)));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user.uid]);

  return (
    <div className="max-w-2xl mx-auto space-y-12">
      {/* Stories Style Quick Actions */}
      <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        <StoryItem icon={<PlusSquare className="w-6 h-6 md:w-8 md:h-8" />} label="Novo Artigo" color="bg-indigo-500" onClick={() => setActiveTab("academic")} />
        <StoryItem icon={<Library className="w-6 h-6 md:w-8 md:h-8" />} label="Biblioteca" color="bg-amber-500" onClick={() => setActiveTab("library")} />
        <StoryItem icon={<PenTool className="w-6 h-6 md:w-8 md:h-8" />} label="Nova Poesia" color="bg-rose-500" onClick={() => setActiveTab("poetry")} />
        <StoryItem icon={<Calendar className="w-6 h-6 md:w-8 md:h-8" />} label="Agenda" color="bg-emerald-500" onClick={() => setActiveTab("calendar")} />
        <StoryItem icon={<Share2 className="w-6 h-6 md:w-8 md:h-8" />} label="Conectar" color="bg-sky-500" onClick={() => setActiveTab("social")} />
      </div>

      <div className="space-y-10">
        {/* Main Feed Item */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-4 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-0.5">
                <img src={user.photoURL || ""} className="w-full h-full rounded-full border-2 border-white" referrerPolicy="no-referrer" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{user.displayName}</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Estudante Ativo</p>
              </div>
            </div>
            <MoreHorizontal className="w-5 h-5 text-slate-400" />
          </div>
          <div className="aspect-video bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-12 text-center">
            <div className="space-y-4">
              <h3 className="text-3xl font-black text-white tracking-tight">Bem-vindo ao Mooz Academy</h3>
              <p className="text-indigo-100 text-sm max-w-xs mx-auto">Sua jornada acadêmica simplificada e inspiradora começa aqui.</p>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-4">
              <Heart className="w-6 h-6 text-slate-700 hover:text-red-500 cursor-pointer transition-colors" />
              <MessageCircle className="w-6 h-6 text-slate-700 hover:text-indigo-500 cursor-pointer transition-colors" />
              <Share2 className="w-6 h-6 text-slate-700 hover:text-sky-500 cursor-pointer transition-colors" />
            </div>
            <p className="text-sm text-slate-800">
              <span className="font-bold mr-2">{user.displayName}</span>
              Pronto para transformar seus estudos hoje? Explore o assistente ou adicione novos livros à sua biblioteca.
            </p>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 px-2">Atividades Recentes</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  Próximos Eventos
                </h3>
                <button onClick={() => setActiveTab("calendar")} className="text-xs font-bold text-indigo-600 hover:underline">Ver todos</button>
              </div>
              <div className="space-y-4">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${
                        event.type === 'Prova' ? 'bg-red-500' : 
                        event.type === 'Trabalho' ? 'bg-amber-500' : 'bg-indigo-500'
                      }`} />
                      <div>
                        <p className="text-sm font-bold text-slate-900">{event.title}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{format(new Date(event.date), "dd 'de' MMMM", { locale: ptBR })}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4 italic">Nenhum evento próximo.</p>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  Trabalhos
                </h3>
                <button onClick={() => setActiveTab("academic")} className="text-xs font-bold text-purple-600 hover:underline">Ver todos</button>
              </div>
              <div className="space-y-4">
                {recentWorks.length > 0 ? (
                  recentWorks.map((work) => (
                    <div key={work.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-sm font-bold text-slate-900 truncate">{work.title}</p>
                      <p className="text-[10px] text-slate-500 font-medium uppercase">{work.type}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4 italic">Nenhum trabalho recente.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StoryItem({ icon, label, color, onClick }: { icon: ReactNode, label: string, color: string, onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 flex-shrink-0 group">
      <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full ${color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{label}</span>
    </button>
  );
}
