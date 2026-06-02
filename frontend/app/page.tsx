import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 bg-zinc-950 text-white pb-24">
      <section className="relative w-full h-[50vh] min-h-[400px] bg-gradient-to-b from-zinc-900 to-zinc-950 flex flex-col justify-end p-8 md:p-16 border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto w-full">
          <span className="text-zinc-500 font-semibold tracking-wider text-sm mb-2 block uppercase">DE COLECIONADOR PARA COLECIONADOR</span>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter max-w-2xl">
            Aprimore a sua coleção de videogames.
          </h1>
          <p className="text-zinc-400 max-w-xl text-lg mb-8">
            Acompanhe a flutuação de preços das raridades, não perca nenhuma pré-venda e mostre a sua estante de jogos para outros gamers.
          </p>
          <div className="flex gap-4">
            <Link href="/cadastro" className="px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition">
              Criar Conta Gratuita
            </Link>
            <Link href="/jogos" className="px-6 py-3 bg-zinc-900 text-white border border-zinc-700 font-semibold rounded-full hover:bg-zinc-800 transition">
              Explorar Catálogo
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 mt-16 space-y-16">
        <GameShelf title="Lançamentos Recentes" />
        <GameShelf title="Pré-Vendas Liberadas" />
        <GameShelf title="Em Destaque na Comunidade" />
        <GameShelf title="Raridades Disponíveis" />
      </div>
    </main>
  );
}

// Componente reutilizável para desenhar as fileiras
function GameShelf({ title }: { title: string }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <button className="text-sm font-medium text-zinc-400 hover:text-white transition">
          Ver todos &rarr;
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="flex flex-col gap-3 group cursor-pointer">
            <div className="relative aspect-[3/4] bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden group-hover:border-zinc-600 transition duration-300">
            </div>
            <div>
              <div className="h-4 w-3/4 bg-zinc-800 rounded mb-2"></div>
              <div className="h-3 w-1/2 bg-zinc-900 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}