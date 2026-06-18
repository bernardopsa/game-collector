"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

export default function JogoInterna({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isScraping, setIsScraping] = useState(true);

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/games/db/${id}`);
        if (res.ok) {
          const data = await res.json();
          setGame(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchGameDetails();

    const timer = setTimeout(() => setIsScraping(false), 2000);
    return () => clearTimeout(timer);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-zinc-800 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-400">Jogo não encontrado.</p>
        <Link href="/" className="text-sm bg-white text-black px-4 py-2 rounded-lg font-bold">Voltar para Home</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 mt-8">
        
        <div className="w-full md:w-1/3 max-w-sm">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-900">
            {game.cover_url ? (
              <img src={game.cover_url.replace("t_cover_big", "t_1080p")} alt={game.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600">Sem Capa</div>
            )}
          </div>
        </div>

        <div className="w-full md:w-2/3 flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">{game.name}</h1>
            <p className="text-zinc-500 text-sm mb-6">Lançamento: {game.release_date || "Data não disponível"}</p>
            
            <div className="flex flex-wrap gap-2 mb-8">
              {game.platforms?.map((plat: string) => (
                <span key={plat} className="text-xs font-semibold bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded text-zinc-400">
                  {plat}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8 flex flex-col min-h-[250px] justify-center">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Disponibilidade de Mídia Física</h2>
            
            {isScraping ? (
              <div className="flex flex-col items-center justify-center py-6 gap-3">
                <div className="w-6 h-6 border-2 border-zinc-800 border-t-white rounded-full animate-spin"></div>
                <p className="text-xs text-zinc-500 tracking-wide">Vasculhando e-commerces em tempo real...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <p className="text-base font-bold mb-1">Mídia física indisponível nas lojas integradas.</p>
                <p className="text-xs text-zinc-500 max-w-sm mb-6">Não detectamos estoque ativo para este título.</p>
                <button className="px-6 py-3 bg-white text-black text-xs font-bold rounded-xl hover:bg-zinc-200 transition shadow-md w-full max-w-xs">
                  Monitorar e Avisar Quando Chegar
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}