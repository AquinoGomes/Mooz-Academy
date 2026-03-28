import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { 
  MessageCircle, 
  Instagram, 
  Linkedin, 
  Save, 
  CheckCircle2, 
  ExternalLink,
  Smartphone,
  Globe,
  ChevronLeft
} from "lucide-react";
import { motion } from "framer-motion";

interface SocialConnectProps {
  user: User;
  goHome: () => void;
}

export default function SocialConnect({ user, goHome }: SocialConnectProps) {
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setWhatsapp(data.whatsapp || "");
          setInstagram(data.instagram || "");
          setLinkedin(data.linkedin || "");
        }
      } catch (error) {
        console.error("Error fetching social profile:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user.uid]);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        whatsapp,
        instagram,
        linkedin
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving social profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <button 
        onClick={goHome}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium text-sm mb-4 group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Voltar para Início
      </button>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-900">Conexões Sociais</h2>
        <p className="text-slate-500">Vincule suas redes sociais e facilite o contato com colegas e orientadores.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-6">
          {/* WhatsApp */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-green-500" />
              WhatsApp (com DDD)
            </label>
            <div className="relative">
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ex: 11999999999"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all pl-12"
              />
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
          </div>

          {/* Instagram */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
              <Instagram className="w-4 h-4 text-pink-500" />
              Instagram (Usuário)
            </label>
            <div className="relative">
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="Ex: @seuusuario"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none transition-all pl-12"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">@</span>
            </div>
          </div>

          {/* LinkedIn */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
              <Linkedin className="w-4 h-4 text-blue-600" />
              LinkedIn (URL do Perfil)
            </label>
            <div className="relative">
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="Ex: linkedin.com/in/seu-perfil"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all pl-12"
              />
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 disabled:opacity-50"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : success ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Salvo com Sucesso!
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Salvar Conexões
            </>
          )}
        </button>
      </div>

      {/* Preview Section */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl text-white space-y-6">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-400" />
          Como outros verão você
        </h3>
        
        <div className="flex items-center gap-4">
          <img 
            src={user.photoURL || ""} 
            alt={user.displayName || ""} 
            className="w-16 h-16 rounded-full border-2 border-indigo-500"
            referrerPolicy="no-referrer"
          />
          <div>
            <h4 className="font-bold text-xl">{user.displayName}</h4>
            <p className="text-slate-400 text-sm">{user.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {whatsapp && (
            <a 
              href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-green-600/20 border border-green-600/30 rounded-xl text-green-400 hover:bg-green-600/30 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {instagram && (
            <a 
              href={`https://instagram.com/${instagram.replace("@", "")}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-pink-600/20 border border-pink-600/30 rounded-xl text-pink-400 hover:bg-pink-600/30 transition-colors"
            >
              <Instagram className="w-4 h-4" />
              Instagram
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {linkedin && (
            <a 
              href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-600/30 rounded-xl text-blue-400 hover:bg-blue-600/30 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {!whatsapp && !instagram && !linkedin && (
            <p className="text-slate-500 italic text-sm">Nenhuma conexão configurada.</p>
          )}
        </div>
      </div>
    </div>
  );
}
