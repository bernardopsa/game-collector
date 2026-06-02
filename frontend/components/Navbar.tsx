import Link from "next/link";

export default function Navbar() {
  const isLoggedIn = false; 

  return (
    <nav className="w-full bg-zinc-950 border-b border-zinc-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo e Links da Esquerda */}
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-black tracking-tighter">
            GameCollector
          </Link>
          <div className="hidden md:flex gap-6 text-sm font-medium text-zinc-400">
            <Link href="/jogos" className="hover:text-white transition">Jogos</Link>
            <Link href="/promocoes" className="hover:text-white transition">Promoções</Link>
          </div>
        </div>

        {/* Barra de Busca Centralizada */}
        <div className="flex-1 max-w-md mx-8 hidden lg:block">
          <input 
            type="text" 
            placeholder="Buscar um Jogo..." 
            className="w-full px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-sm focus:outline-none focus:border-zinc-500"
          />
        </div>

        {/* Menus da Direita (Condicional de Login) */}
        <div className="flex items-center gap-4 text-sm font-medium">
          {isLoggedIn ? (
            <Link href="/perfil" className="px-4 py-2 bg-white text-black rounded-full hover:bg-zinc-200 transition">
              Perfil
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-zinc-400 hover:text-white transition">
                Login
              </Link>
              <Link href="/cadastro" className="px-4 py-2 bg-white text-black rounded-full hover:bg-zinc-200 transition">
                Criar Conta
              </Link>
            </>
          )}
        </div>
        
      </div>
    </nav>
  );
}