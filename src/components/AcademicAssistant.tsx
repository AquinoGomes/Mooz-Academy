import React, { useState, useRef } from "react";
import { User } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { AcademicWorkType } from "../types";
import { 
  FileUp, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Download,
  Trash2,
  Home,
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { cn } from "../lib/utils";

interface AcademicAssistantProps {
  user: User;
  goHome: () => void;
}

export default function AcademicAssistant({ user, goHome }: AcademicAssistantProps) {
  const [mode, setMode] = useState<"analyze" | "generate">("analyze");
  const [file, setFile] = useState<File | null>(null);
  const [topic, setTopic] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ title: string; type: AcademicWorkType; summary: string } | null>(null);
  const [workType, setWorkType] = useState<AcademicWorkType>("Artigo");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.name.endsWith(".doc") || droppedFile.name.endsWith(".docx"))) {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const simulateProcessing = async () => {
    if (mode === "analyze" && !file) return;
    if (mode === "generate" && !topic) return;
    
    setProcessing(true);
    setResult(null);

    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 3000));

    const mockResults: Record<AcademicWorkType, string> = {
      "TCC": mode === "generate" 
        ? `Estrutura completa de TCC sobre "${topic}": 1. Introdução (Contextualização, Problema, Objetivos); 2. Referencial Teórico (Principais autores da área); 3. Metodologia (Qualitativa/Quantitativa); 4. Cronograma de execução. Sugestão de título: "A Evolução de ${topic} no Contexto Contemporâneo".`
        : "Este trabalho apresenta uma análise profunda sobre a sustentabilidade urbana no Brasil, focando em políticas públicas de mobilidade. O resumo destaca a necessidade de integração entre transporte coletivo e ciclovias, baseando-se em normas da ABNT NBR 14724.",
      "Trabalho Acadêmico": mode === "generate"
        ? `Esboço de Trabalho Acadêmico sobre "${topic}": Capa, Folha de Rosto, Sumário, Introdução, Desenvolvimento, Conclusão e Referências. Foco na organização lógica e clareza textual conforme normas institucionais.`
        : "Trabalho acadêmico estruturado abordando os fundamentos de ${topic}. Inclui revisão bibliográfica e análise de casos práticos relevantes para a disciplina.",
      "Artigo": mode === "generate"
        ? `Resumo de Artigo Científico sobre "${topic}": Resumo, Palavras-chave, Introdução, Desenvolvimento e Conclusão. Foco em resultados práticos e citações diretas/indiretas seguindo a NBR 10520.`
        : "O presente artigo discute os avanços da inteligência artificial aplicada à educação básica. Foram analisadas ferramentas de personalização do ensino e seu impacto no engajamento dos alunos do ensino fundamental II.",
      "Texto": mode === "generate"
        ? `Texto Dissertativo sobre "${topic}": Argumentação lógica dividida em 4 parágrafos. Tese central: A importância de ${topic} para o desenvolvimento social e acadêmico.`
        : "Um ensaio reflexivo sobre a importância da leitura na formação crítica do cidadão. O autor argumenta que o acesso à literatura diversificada é fundamental para o exercício pleno da democracia."
    };

    const newResult = {
      title: mode === "generate" ? topic : (file?.name.split(".")[0] || "Sem título"),
      type: workType,
      summary: mockResults[workType]
    };

    setResult(newResult);
    setProcessing(false);

    // Save to Firestore
    try {
      await addDoc(collection(db, "academicWorks"), {
        uid: user.uid,
        ...newResult,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error saving work:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button 
        onClick={goHome}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium text-sm mb-4 group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Voltar para Início
      </button>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-900">Assistente Acadêmico AI</h2>
        <p className="text-slate-500">Escolha entre analisar um arquivo existente ou gerar um novo conteúdo do zero.</p>
      </div>

      <div className="flex justify-center p-1 bg-slate-100 rounded-2xl w-fit mx-auto">
        <button
          onClick={() => setMode("analyze")}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all",
            mode === "analyze" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Analisar Arquivo
        </button>
        <button
          onClick={() => setMode("generate")}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all",
            mode === "generate" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Gerar Automaticamente
        </button>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
          {(["TCC", "Trabalho Acadêmico", "Artigo", "Texto"] as AcademicWorkType[]).map((type) => (
            <button
              key={type}
              onClick={() => setWorkType(type)}
              className={`py-2 md:py-3 px-2 md:px-4 rounded-xl md:rounded-2xl text-[10px] md:text-sm font-bold transition-all ${
                workType === type 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {mode === "analyze" ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer group ${
              isDragging 
                ? "border-indigo-500 bg-indigo-50" 
                : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50"
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden" 
              accept=".pdf,.doc,.docx"
            />
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <FileUp className="w-8 h-8" />
              </div>
              {file ? (
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">{file.name}</p>
                  <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">Arraste seu arquivo aqui</p>
                  <p className="text-sm text-slate-500">PDF ou DOC (Máx. 10MB)</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
              <label className="text-xs font-bold text-indigo-400 uppercase mb-2 block">Tema ou Assunto do Trabalho</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Impacto da IA na Educação, Sustentabilidade em Cidades..."
                className="w-full p-4 bg-white border border-indigo-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-lg font-medium"
              />
            </div>
          </div>
        )}

        <button
          disabled={(mode === "analyze" && !file) || (mode === "generate" && !topic) || processing}
          onClick={simulateProcessing}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-100"
        >
          {processing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {mode === "analyze" ? "Analisando conteúdo..." : "Gerando conteúdo..."}
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {mode === "analyze" ? "Gerar Resumo Inteligente" : `Gerar ${workType} Agora`}
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden"
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{result.title}</h3>
                  <p className="text-xs text-indigo-100 uppercase font-bold tracking-wider">{result.type}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Resumo Executivo
                </h4>
                <p className="text-slate-600 leading-relaxed text-lg italic">
                  "{result.summary}"
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Sugestão ABNT</p>
                  <p className="text-sm text-slate-700">Verifique as margens (3cm sup/esq, 2cm inf/dir) e fonte Arial/Times 12.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Próximo Passo</p>
                  <p className="text-sm text-slate-700">Adicione referências bibliográficas seguindo a NBR 6023.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
