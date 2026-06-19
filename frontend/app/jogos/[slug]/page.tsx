"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

export default function JogoInterna({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [isScraping, setIsScraping] = useState(true);
  const [scrapedItems, setScrapedItems] = useState<any[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [condition, setCondition] = useState<string>("todos");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/games/slug/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setGame(data);
          if (data.platforms && data.platforms.length > 0) {
            setSelectedPlatform(data.platforms[0]); // Seleciona a primeira para o scraper
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchGameDetails();
  }, [slug]);

  useEffect(() => {
    if (!game || !selectedPlatform) return;

    const fetchScraping = async () => {
      setIsScraping(true);
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/scrape/mercadolivre?game_name=${encodeURIComponent(game.name)}&platform=${encodeURIComponent(selectedPlatform)}`);
        const data = await res.json();
        setScrapedItems(data || []);
      } catch (error) {
        console.error(error);
        setScrapedItems([]);
      } finally {
        setIsScraping(false);
      }
    };
    fetchScraping();
  }, [game, selectedPlatform]);

  const formatReleaseDate = (dateString: string) => {
    if (!dateString) return "Data não disponível";
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
  };

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
    <main className="min-h-screen bg-zinc-950 text-white pb-24">
      
      {/* 1. SEÇÃO HERO: Poster, Capa e Infos Gerais unificados */}
      <section className="relative w-full pt-32 pb-16 min-h-[500px] flex items-end border-b border-zinc-800/50">
        {game.backdrop_url && (
          <div className="absolute inset-0 w-full h-full z-0">
            <img src={game.backdrop_url} alt="" className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 flex flex-col md:flex-row gap-10 items-end">
          {/* Capa Menor integrada no Hero */}
          <div className="w-40 md:w-56 shrink-0 rounded-xl overflow-hidden border border-zinc-700 shadow-2xl bg-zinc-900">
            {game.cover_url ? (
              <img src={game.cover_url} alt={game.name} className="w-full h-full object-cover aspect-[3/4]" />
            ) : (
              <div className="w-full aspect-[3/4] flex items-center justify-center text-zinc-600">Sem Capa</div>
            )}
          </div>

          {/* Textos e Botões de Ação */}
          <div className="flex flex-col items-start w-full mb-2">
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-zinc-400 mb-2">
              {game.developer}
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 drop-shadow-lg">
              {game.name}
            </h1>
            <div className="flex items-center gap-2 text-zinc-400 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span className="font-medium text-sm md:text-base">
                {formatReleaseDate(game.release_date)}
              </span>
            </div>
            
            {/* Labels Informativas de Plataforma (Apenas visualização, não clicáveis) */}
            <div className="flex flex-wrap gap-2 mb-8">
              {game.platforms?.map((plat: string) => (
                <span key={plat} className="text-xs font-semibold px-3 py-1 bg-zinc-900/60 border border-zinc-700/50 rounded-md text-zinc-300 cursor-default">
                  {plat}
                </span>
              ))}
            </div>

            {/* Ações do Usuário */}
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-zinc-200 transition shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                Adicionar à Estante
              </button>
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-700 px-6 py-3 rounded-xl font-bold text-white hover:bg-zinc-800 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                Lista de Desejos
              </button>
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-700 px-4 py-3 rounded-xl font-bold text-white hover:bg-zinc-800 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* 2. BARRA LATERAL (Filtros do Marketplace) */}
        <aside className="lg:col-span-1 flex flex-col gap-6">
          {game.video_id && (
            <div className="w-full aspect-video rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-md mb-4">
              <iframe
                src={`https://www.youtube.com/embed/${game.video_id}?autoplay=0&mute=0`}
                title="Trailer"
                className="w-full h-full border-0"
                allowFullScreen
              />
            </div>
          )}

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filtros de Busca
            </h3>

            {/* Filtro: Plataforma */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-zinc-400 mb-3">Plataforma Específica</label>
              <div className="flex flex-col gap-2">
                {game.platforms?.map((plat: string) => (
                  <button 
                    key={plat} 
                    onClick={() => setSelectedPlatform(plat)}
                    className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition ${selectedPlatform === plat ? 'bg-white text-black' : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'}`}
                  >
                    {plat}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtro: Condição */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-zinc-400 mb-3">Condição</label>
              <div className="grid grid-cols-2 gap-2">
                {['todos', 'novo', 'usado'].map((cond) => (
                  <button 
                    key={cond}
                    onClick={() => setCondition(cond)}
                    className={`capitalize px-3 py-2 rounded-lg text-xs font-bold transition ${condition === cond ? 'bg-zinc-700 text-white' : 'bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-white'}`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtro: Preço */}
            <div>
              <label className="block text-sm font-semibold text-zinc-400 mb-3">Faixa de Preço (R$)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  placeholder="Mín" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500" 
                />
                <span className="text-zinc-600">-</span>
                <input 
                  type="number" 
                  placeholder="Máx" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500" 
                />
              </div>
            </div>
          </div>
        </aside>

        {/* 3. ÁREA PRINCIPAL (Resultados do Scraper) */}
        <section className="lg:col-span-2">
          <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 md:p-8 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800/50">
              <h2 className="text-lg font-bold tracking-tight">Disponibilidade de Mídia Física</h2>
              <span className="text-xs bg-yellow-500 text-black font-black px-3 py-1.5 rounded-md uppercase tracking-wider">Mercado Livre</span>
            </div>
            
            {isScraping ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-2 border-zinc-800 border-t-yellow-500 rounded-full animate-spin"></div>
                <p className="text-sm text-zinc-500 font-medium animate-pulse">Procurando as melhores ofertas para {selectedPlatform}...</p>
              </div>
            ) : scrapedItems.length > 0 ? (
              <div className="flex flex-col gap-4">
                {scrapedItems.map((item, index) => (
                  <a key={index} href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-zinc-600 hover:bg-zinc-900 transition group shadow-sm">
                    <div className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0 p-2 border border-zinc-200">
                      {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm md:text-base font-semibold text-zinc-300 truncate group-hover:text-white transition">{item.title}</h3>
                      <p className="text-xs text-zinc-500 mt-1 mb-2 font-medium">Condição não especificada</p>
                      <p className="text-xl font-black text-white">R$ {item.price}</p>
                    </div>
                    <div className="hidden sm:flex items-center justify-center p-3 bg-zinc-800 rounded-xl group-hover:bg-yellow-500 group-hover:text-black transition">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <p className="text-lg font-bold mb-2">Mídia física indisponível.</p>
                <p className="text-sm text-zinc-500 max-w-md">Não detectamos estoque ativo no Mercado Livre para a plataforma selecionada.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}