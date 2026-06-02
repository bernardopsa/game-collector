"use client";

import {useState} from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/games/search?query=${query}`);
      const data = await res.json();

      if (!res.ok) {
        console.error("Erro reportado pela API:", data);
        alert(`O servidor retornou um erro: ${data.detail || "Erro desconhecido. Verifique o terminal do Python."}`);
        setGames([]);
        return;
      }

      if (Array.isArray(data)) {
        setGames(data);
      } else {
        console.error("Formato inesperado recebido:", data);
        setGames([]);
      }
      
    } catch (error) {
      console.error("Erro de conexão (o back-end está ligado?):", error);
      alert("Erro ao conectar com o servidor. O Uvicorn está rodando?");
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-10 text-center tracking-tight">Game Collector</h1>
        
        {/* Barra de Pesquisa */}
        <form onSubmit={handleSearch} className="flex gap-4 mb-12 justify-center max-w-2xl mx-auto">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Procure um jogo..." 
            className="flex-1 px-5 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
          />
          <button 
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition disabled:opacity-50"
          >
            {loading ? "Buscando..." : "Procurar"}
          </button>
        </form>

        {/* Estante */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {games.map((game) => (
            <div key={game.id} className="bg-zinc-900 rounded-xl overflow-hidden shadow-lg border border-zinc-800 hover:border-zinc-600 transition group">
              {/* Capa do Jogo */}
              <div className="relative aspect-[3/4] overflow-hidden">
                {game.cover_url ? (
                  <img src={game.cover_url} alt={game.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500">Sem Capa</div>
                )}
              </div>
              
              {/* Informações do Jogo */}
              <div className="p-4">
                <h2 className="font-bold text-sm truncate" title={game.name}>{game.name}</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {game.release_date ? game.release_date.substring(0, 4) : "N/A"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}