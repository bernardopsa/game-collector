"use client";

import { useState, useEffect } from "react";

export default function Perfil() {
  const [activeTab, setActiveTab] = useState("collection");
  const [query, setQuery] = useState("");
  const [games, setGames] = useState<any[]>([]);
  const [myCollection, setMyCollection] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [modalType, setModalType] = useState<"estante" | "wishlist" | null>(null);
  
  const [mediaPlatform, setMediaPlatform] = useState("PlayStation 5");
  const [edition, setEdition] = useState("Standard");
  const [fetchedEditions, setFetchedEditions] = useState<any[]>([]);
  const [stores, setStores] = useState<string[]>([]);
  const [condition, setCondition] = useState("Tanto faz");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/games/search?query=${query}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setGames(data);
      else setGames([]);
    } catch (error) {
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGame = async () => {
    if (!selectedGame) return;
    try {
      const res = await fetch("http://127.0.0.1:5000/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          igdb_id: selectedGame.id,
          name: selectedGame.name,
          cover_url: selectedGame.cover_url,
          release_date: selectedGame.release_date,
          platforms: selectedGame.platforms,
        }),
      });

      if (res.ok) {
        alert(`✅ ${selectedGame.name} adicionado com sucesso!`);
        closeModal();
        fetchMyCollection();
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  const fetchMyCollection = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/games");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setMyCollection(data);
    } catch (error) {
      console.error("Erro ao carregar:", error);
    }
  };

  const handleRemoveGame = async (gameId: number, gameName: string) => {
    if (!window.confirm(`Remover ${gameName} da coleção?`)) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/games/${gameId}`, { method: "DELETE" });
      if (res.ok) fetchMyCollection();
    } catch (error) {
      console.error("Erro ao remover:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "collection") fetchMyCollection();
  }, [activeTab]);

  const toggleStore = (store: string) => {
    setStores((prev) => prev.includes(store) ? prev.filter((s) => s !== store) : [...prev, store]);
  };

  const openModal = async (game: any, type: "estante" | "wishlist") => {
    setSelectedGame(game);
    setModalType(type);
    setEdition("Standard");
    setFetchedEditions([]);
    
    // Define a primeira plataforma do array como padrão
    if (game.platforms && game.platforms.length > 0) {
      setMediaPlatform(game.platforms[0]);
    } else {
      setMediaPlatform("Desconhecida");
    }
    
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/games/${game.id}/editions`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setFetchedEditions(data);
      }
    } catch (error) {
      console.error("Erro ao buscar edições:", error);
    }
  };

  const closeModal = () => {
    setSelectedGame(null);
    setModalType(null);
    setMinPrice("");
    setMaxPrice("");
    setCondition("Tanto faz");
    setFetchedEditions([]);
  };

  return (
    <main className="flex-1 bg-zinc-950 text-white p-8 relative min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 tracking-tight">O Meu Perfil</h1>
        
        <div className="flex gap-4 mb-10 border-b border-zinc-800 pb-4">
          <button onClick={() => setActiveTab("collection")} className={`font-semibold transition-colors duration-300 ${activeTab === "collection" ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}>A Minha Coleção</button>
          <button onClick={() => setActiveTab("search")} className={`font-semibold transition-colors duration-300 ${activeTab === "search" ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}>Adicionar Jogos</button>
        </div>

        {activeTab === "search" && (
          <div>
            <form onSubmit={handleSearch} className="flex gap-4 mb-8 max-w-2xl">
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Procurar um novo jogo..." className="flex-1 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-zinc-500" />
              <button type="submit" disabled={loading} className="px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition">
                {loading ? "A procurar..." : "Procurar"}
              </button>
            </form>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {games.map((game) => (
                <div key={game.id} className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 flex flex-col h-full group relative">
                  <div className="relative aspect-[3/4]">
                    {game.cover_url ? (
                      <img src={game.cover_url} alt={game.name} className="w-full h-full object-cover transition duration-300 group-hover:blur-sm group-hover:brightness-50" />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center transition duration-300 group-hover:blur-sm group-hover:brightness-50">Sem Capa</div>
                    )}
                    
                    <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button onClick={() => openModal(game, "estante")} title="Adicionar à Estante" className="p-3 bg-zinc-950/80 rounded-full hover:bg-white hover:text-black text-white transition transform hover:scale-110">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14"/>
                          <path d="M12 5v14"/>
                        </svg>
                      </button>
                      <button onClick={() => openModal(game, "wishlist")} title="Adicionar à Lista de Desejos" className="p-3 bg-zinc-950/80 rounded-full hover:bg-white hover:text-black text-white transition transform hover:scale-110">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="8" width="18" height="14" rx="2"/>
                          <path d="M12 5a3 3 0 1 0-3 3"/>
                          <path d="M12 5a3 3 0 1 1 3 3"/>
                          <path d="M12 8v14"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <h2 className="font-bold text-sm truncate" title={game.name}>{game.name}</h2>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "collection" && (
          <div>
            {myCollection.length === 0 ? (
              <p className="text-zinc-500">A sua estante está vazia.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {myCollection.map((game) => (
                  <div key={game.id} className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 flex flex-col h-full group">
                    <div className="relative aspect-[3/4]">
                      {game.cover_url ? (
                        <img src={game.cover_url} alt={game.title} className="w-full h-full object-cover group-hover:opacity-50 transition" />
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">Sem Capa</div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                        <button onClick={() => handleRemoveGame(game.id, game.title)} className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded shadow-lg hover:bg-red-500">
                          Remover
                        </button>
                      </div>
                    </div>
                    <div className="p-3">
                      <h2 className="font-bold text-sm truncate" title={game.title}>{game.title}</h2>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedGame && modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex gap-4">
              {selectedGame.cover_url && (
                <img src={selectedGame.cover_url} alt={selectedGame.name} className="w-16 h-24 object-cover rounded-md shadow-md" />
              )}
              <div className="flex flex-col justify-center">
                <h3 className="text-xl font-bold leading-tight">{selectedGame.name}</h3>
                <p className="text-zinc-400 text-sm mt-1">{modalType === "estante" ? "Adicionar à Estante" : "Adicionar à Lista de Desejos"}</p>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Plataforma</label>
                  <select value={mediaPlatform} onChange={(e) => setMediaPlatform(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500">
                    {selectedGame.platforms && selectedGame.platforms.length > 0 ? (
                      selectedGame.platforms.map((plat: string) => (
                        <option key={plat} value={plat}>{plat}</option>
                      ))
                    ) : (
                      <option value="Desconhecida">Desconhecida</option>
                    )}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Edição</label>
                  <select value={edition} onChange={(e) => setEdition(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500">
                    <option value="Standard">Standard</option>
                    {fetchedEditions.map((ed) => (
                      <option key={ed.id} value={ed.name}>{ed.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {modalType === "wishlist" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Condição da Mídia</label>
                    <div className="flex gap-2">
                      {["Novo", "Usado", "Tanto faz"].map((cond) => (
                        <button key={cond} onClick={() => setCondition(cond)} className={`flex-1 py-1.5 rounded-lg text-sm transition ${condition === cond ? "bg-zinc-700 text-white" : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white"}`}>
                          {cond}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Preço Mín (R$)</label>
                      <input type="number" placeholder="Opcional" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Preço Máx (R$)</label>
                      <input type="number" placeholder="Opcional" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Lojas para Notificação</label>
                    <div className="flex flex-wrap gap-2">
                      {["Amazon", "Mercado Livre", "Shopee", "Olx"].map((store) => (
                        <button key={store} onClick={() => toggleStore(store)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${stores.includes(store) ? "bg-zinc-800 border-zinc-600 text-white" : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700"}`}>
                          {store}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/50">
              <button onClick={closeModal} className="px-5 py-2 text-sm font-medium text-zinc-400 hover:text-white transition">Cancelar</button>
              <button onClick={handleSaveGame} className="px-5 py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-zinc-200 transition">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}