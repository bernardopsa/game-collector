"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

export default function JogoInterna({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [isScraping, setIsScraping] = useState(true);
  const [scrapedItems, setScrapedItems] = useState<any[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/games/db/${id}`);
        if (res.ok) {
          const data = await res.json();
          setGame(data);
          // Pega a primeira plataforma disponível para fazer a busca
          if (data.platforms && data.platforms.length > 0) {
            setSelectedPlatform(data.platforms[0]);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchGameDetails();
  }, [id]);

  // Dispara o scraping assim que o jogo e a plataforma estiverem definidos
  useEffect(() => {
    if (!game || !selectedPlatform) return;

    const fetchScraping = async () => {
      setIsScraping(true);
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/scrape/mercadolivre?game_name=${encodeURIComponent(game.name)}&platform=${encodeURIComponent(selectedPlatform)}`);
        const data = await res.json();
        setScrapedItems(data || []);
      } catch (error) {
        console.error("Erro ao buscar preços:", error);
        setScrapedItems([]);
      } finally {
        setIsScraping(false);
      }
    };

    fetchScraping();
  }, [game, selectedPlatform]);

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
          <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-900 sticky top-24">
            {game.cover_url ? (
              <img src={game.cover_url.replace("t_cover_big", "t_1080p")} alt={game.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600">Sem Capa</div>
            )}
          </div>
        </div>

        <div className="w-full md:w-2/3 flex flex-col">
          <div className="mb-8">
            <h1 className="text-4xl font-black tracking-tight mb-2">{game.name}</h1>
            <p className="text-zinc-500 text-sm mb-6">Lançamento: {game.release_date || "Data não disponível"}</p>
            
            <div className="flex flex-wrap gap-2">
              {game.platforms?.map((plat: string) => (
                <button 
                  key={plat} 
                  onClick={() => setSelectedPlatform(plat)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded transition ${selectedPlatform === plat ? 'bg-white text-black' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'}`}
                >
                  {plat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 md:p-8 flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Disponibilidade de Mídia Física</h2>
              <span className="text-xs bg-yellow-500 text-black font-bold px-2 py-1 rounded">Mercado Livre</span>
            </div>
            
            {isScraping ? (
              <div className="flex-1 flex flex-col items-center justify-center py-6 gap-4">
                <div className="w-8 h-8 border-2 border-zinc-800 border-t-yellow-500 rounded-full animate-spin"></div>
                <p className="text-sm text-zinc-500 tracking-wide animate-pulse">A procurar melhores ofertas...</p>
              </div>
            ) : scrapedItems.length > 0 ? (
              <div className="flex flex-col gap-4">
                {scrapedItems.map((item, index) => (
                  <a key={index} href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-600 transition group">
                    <div className="w-16 h-16 bg-white rounded-md overflow-hidden flex-shrink-0 p-1">
                      {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-zinc-200 line-clamp-2 group-hover:text-white transition">{item.title}</h3>
                      <p className="text-lg font-black text-white mt-1">R$ {item.price}</p>
                    </div>
                    <div className="hidden md:flex items-center justify-center p-2 bg-zinc-800 rounded-full group-hover:bg-yellow-500 group-hover:text-black transition">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <p className="text-base font-bold mb-1">Mídia física indisponível no momento.</p>
                <p className="text-xs text-zinc-500 max-w-sm mb-6">Não detectamos estoque ativo para esta plataforma.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}