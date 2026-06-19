"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [recentes, setRecentes] = useState<any[]>([]);
  const [prevendas, setPrevendas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/home");
        const data = await res.json();
        setRecentes(data.recentes || []);
        setPrevendas(data.prevendas || []);
      } catch (error) {
        console.error("Erro ao carregar a home:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <main className="flex-1 bg-zinc-950 text-white pb-24">
      <section className="relative w-full h-[50vh] min-h-[400px] bg-gradient-to-b from-zinc-900 to-zinc-950 flex flex-col justify-end p-8 md:p-16 border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <span className="text-zinc-500 font-semibold tracking-wider text-sm mb-2 block uppercase">O Mercado de Mídia Física</span>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter max-w-2xl">
            Rastreie, encontre e gira a sua coleção.
          </h1>
          <p className="text-zinc-400 max-w-xl text-lg mb-8">
            Acompanhe a flutuação de preços das raridades, não perca nenhuma pré-venda e mostre a sua estante para a comunidade.
          </p>
          <div className="flex gap-4">
            <Link href="/cadastro" className="px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition shadow-lg">
              Criar Conta Gratuita
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 mt-16 space-y-16">
        <GameShelf title="Lançamentos Relevantes" games={recentes} loading={loading} />
        <GameShelf title="Pré-Vendas Liberadas" games={prevendas} loading={loading} />
        <GameShelf title="Em Destaque na Comunidade" games={[]} loading={loading} isPlaceholder />
      </div>
    </main>
  );
}

function GameShelf({ title, games, loading, isPlaceholder = false }: { title: string, games: any[], loading: boolean, isPlaceholder?: boolean }) {
  if (loading) {
    return (
      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-6">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="aspect-[3/4] bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse"></div>
          ))}
        </div>
      </section>
    );
  }

  if (games.length === 0 || isPlaceholder) {
    return (
      <section className="opacity-50 grayscale pointer-events-none">
        <h2 className="text-2xl font-bold tracking-tight mb-6">{title} <span className="text-sm font-normal text-zinc-500 ml-2">(Em breve)</span></h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="aspect-[3/4] bg-zinc-900/50 rounded-xl border border-zinc-800 flex items-center justify-center">
              <span className="text-zinc-700 font-medium">--</span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <button className="text-sm font-medium text-zinc-400 hover:text-white transition">
          Ver todos &rarr;
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {games.slice(0, 5).map((game) => (
          <Link 
            key={game.id} 
            href={`/jogos/${game.slug}`}
            className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 relative group aspect-[3/4] cursor-pointer block"
          >
            {game.cover_url ? (
              <img src={game.cover_url} alt={game.name} className="w-full h-full object-cover transition duration-300 group-hover:brightness-50 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center transition duration-300 group-hover:brightness-50">Sem Capa</div>
            )}
            
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 p-4 z-10 text-center">
              <h2 className="font-bold text-sm md:text-base text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] line-clamp-3 mb-2A">
                {game.name}
              </h2>
              <span className="text-xs font-semibold px-2 py-1 bg-white/20 backdrop-blur-md rounded-full text-white">
                {game.release_date?.substring(0, 4) || "Breve"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}