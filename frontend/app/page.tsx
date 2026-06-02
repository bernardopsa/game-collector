"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("search"); // "search" ou "collection"
  
  const [query, setQuery] = useState("");
  const [games, setGames] = useState<any[]>([]); // Resultados da busca
  const [myCollection, setMyCollection] = useState<any[]>([]); // Jogos salvos no SQLite
  const [loading, setLoading] = useState(false);

  // 1. Busca na Twitch/IGDB
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/games/search?query=${query}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setGames(data);
      } else {
        setGames([]);
      }
    } catch (error) {
      console.error("Erro ao buscar:", error);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  // 2. Salvar no SQLite
  const handleSaveGame = async (game: any) => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          igdb_id: game.id,
          name: game.name,
          cover_url: game.cover_url,
          release_date: game.release_date,
          platforms: game.platforms,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ ${game.name} adicionado à sua coleção!`);
        fetchMyCollection(); // Atualiza a coleção em background
      } else {
        alert(`❌ Erro: ${data.detail}`);
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  // 3. Buscar a coleção do SQLite
  const fetchMyCollection = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/games");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setMyCollection(data);
      }
    } catch (error) {
      console.error("Erro ao carregar coleção:", error);
    }
  };

// 4. Remover do SQLite
  const handleRemoveGame = async (gameId: number, gameName: string) => {
    if (!window.confirm(`Tem a certeza que deseja remover ${gameName} da coleção?`)) return;

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/games/${gameId}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        fetchMyCollection(); 
      } else {
        const data = await res.json();
        alert(`❌ Erro ao remover: ${data.detail}`);
      }
    } catch (error) {
      console.error("Erro ao remover o jogo:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "collection") {
      fetchMyCollection();
    }
  }, [activeTab]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center tracking-tight">Game Collector</h1>
        
        {/* Navegação (Tabs) */}
        <div className="flex justify-center gap-4 mb-12">
          <button 
            onClick={() => setActiveTab("search")}
            className={`px-6 py-2 rounded-full font-semibold transition-colors duration-300 ${activeTab === "search" ? "bg-white text-black shadow-lg" : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"}`}
          >
            Buscar Jogos
          </button>
          <button 
            onClick={() => setActiveTab("collection")}
            className={`px-6 py-2 rounded-full font-semibold transition-colors duration-300 ${activeTab === "collection" ? "bg-white text-black shadow-lg" : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"}`}
          >
            Minha Coleção
          </button>
        </div>

        {/* --- ABA DE BUSCA --- */}
        {activeTab === "search" && (
          <div>
            <form onSubmit={handleSearch} className="flex gap-4 mb-12 justify-center max-w-2xl mx-auto">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Procure um jogo (ex: The Last of Us)..." 
                className="flex-1 px-5 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
              />
              <button type="submit" disabled={loading} className="px-8 py-3 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition disabled:opacity-50">
                {loading ? "A procurar..." : "Procurar"}
              </button>
            </form>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {games.map((game) => (
                <div key={game.id} className="bg-zinc-900 rounded-xl overflow-hidden shadow-lg border border-zinc-800 hover:border-zinc-600 transition group flex flex-col h-full">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {game.cover_url ? (
                      <img src={game.cover_url} alt={game.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500">Sem Capa</div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1 justify-between gap-4">
                    <div>
                      <h2 className="font-bold text-sm truncate" title={game.name}>{game.name}</h2>
                      <p className="text-xs text-zinc-400 mt-1">{game.release_date ? game.release_date.substring(0, 4) : "N/A"}</p>
                    </div>
                    <button onClick={() => handleSaveGame(game)} className="w-full py-2 bg-zinc-800 hover:bg-white hover:text-black text-white text-xs font-semibold rounded transition-colors duration-200">
                      Adicionar à Coleção
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- ABA DA MINHA COLEÇÃO --- */}
        {activeTab === "collection" && (
          <div>
            {myCollection.length === 0 ? (
              <p className="text-center text-zinc-500 mt-20 text-lg">A sua coleção ainda está vazia.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {myCollection.map((game) => (
                  <div key={game.id} className="bg-zinc-900 rounded-xl overflow-hidden shadow-lg border border-zinc-800 hover:border-zinc-600 transition group flex flex-col h-full">
                    <div className="relative aspect-[3/4] overflow-hidden">
                      {game.cover_url ? (
                        <img src={game.cover_url} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500">Sem Capa</div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1 justify-between gap-4">
                      <div>
                        <h2 className="font-bold text-sm truncate" title={game.title}>{game.title}</h2>
                        <p className="text-xs text-zinc-400 mt-1">{game.release_date ? game.release_date.substring(0, 4) : "N/A"}</p>
                      </div>
                      
                      {/* NOVO: Botão de Remover */}
                      <button 
                        onClick={() => handleRemoveGame(game.id, game.title)}
                        className="w-full py-2 bg-red-950/30 text-red-500 hover:bg-red-900 hover:text-white border border-red-900/50 text-xs font-semibold rounded transition-colors duration-200"
                      >
                        Remover da Coleção
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}