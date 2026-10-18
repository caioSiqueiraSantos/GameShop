import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../state'
import CartDrawer from './CartDrawer'
import CheckoutModal from './CheckoutModal'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { currentUserId, users, logout, cart, games, setIsCartOpen } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const user = users.find(u => u.id === currentUserId)

  const isStore = location.pathname.startsWith('/store') || location.pathname.startsWith('/game')
  const isLibrary = location.pathname.startsWith('/library')
  const isFriends = location.pathname.startsWith('/friends')
  const isAdmin = location.pathname.startsWith('/admin')

  // Total rápido do carrinho para exibição no cabeçalho
  const cartGames = cart
    .map(item => games.find(g => g.id === item.gameId))
    .filter(Boolean) as typeof games

  const cartTotal = cartGames.reduce((acc, curr) => acc + curr.price, 0)

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="bg-gray-900/90 backdrop-blur-md border-b border-gray-800 px-6 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-6 sm:gap-8">
          <button
            onClick={() => navigate('/store')}
            className="flex items-center gap-2.5 text-lg font-black tracking-wider text-white hover:opacity-90 transition-all group"
          >
            <img
              src="/logo.jpg?v=3"
              alt="GameShop"
              className="w-9 h-9 rounded-xl object-cover shadow-md shadow-indigo-600/30 ring-1 ring-white/10 group-hover:scale-105 transition-transform"
            />
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent font-extrabold tracking-tight">
              GameShop
            </span>
          </button>

          {/* Navegação Principal */}
          <nav className="flex items-center gap-1">
            <button
              onClick={() => navigate('/store')}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                isStore
                  ? 'bg-gray-800 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
              }`}
            >
              Loja
            </button>
            <button
              onClick={() => navigate('/library')}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                isLibrary
                  ? 'bg-gray-800 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
              }`}
            >
              Biblioteca
            </button>
            <button
              onClick={() => navigate('/friends')}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                isFriends
                  ? 'bg-gray-800 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
              }`}
            >
              Amigos
            </button>
          </nav>
        </div>

        {/* Lado Direito: Carrinho de Compras, Usuário e Ações */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* BOTÃO DO CARRINHO DE COMPRAS COM BADGE DINÂMICO */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 bg-gray-900/90 hover:bg-gray-800 border border-gray-700/80 hover:border-indigo-500/80 px-3 py-2 rounded-xl transition-all group"
            title="Abrir carrinho de compras"
          >
            <div className="relative">
              <svg
                className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white font-mono text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-md shadow-indigo-600/50">
                  {cart.length}
                </span>
              )}
            </div>

            <div className="hidden md:flex flex-col text-left">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Carrinho</span>
              <span className="text-xs font-bold text-white font-mono">
                {cart.length === 0 ? 'R$ 0,00' : `R$ ${cartTotal.toFixed(2)}`}
              </span>
            </div>
          </button>

          {/* Botão Admin Discreto */}
          <button
            onClick={() => navigate('/admin')}
            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
              isAdmin
                ? 'bg-indigo-950/60 border-indigo-700/80 text-indigo-300'
                : 'text-gray-500 hover:text-gray-300 border-gray-800/80 hover:border-gray-700 bg-gray-900/40 hover:bg-gray-800/60'
            }`}
            title="Painel de Administração"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="hidden sm:inline">Admin</span>
          </button>

          <div className="h-4 w-px bg-gray-800" />

          {/* Perfil do Usuário */}
          <button
            onClick={() => navigate('/library')}
            className="flex items-center gap-2.5 group text-left"
            title="Ver sua biblioteca e perfil"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-700 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow">
              {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
            </div>
            <div className="hidden sm:block">
              <span className="block text-xs font-semibold text-gray-200 group-hover:text-indigo-400 transition-colors">
                {user?.displayName}
              </span>
              <span className="block text-[11px] text-gray-500 font-mono">
                @{user?.username}
              </span>
            </div>
          </button>

          {/* Botão Sair */}
          <button
            onClick={logout}
            className="text-xs text-gray-500 hover:text-rose-400 transition-colors px-2 py-1 rounded hover:bg-gray-800/40"
            title="Encerrar sessão"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* COMPONENTES GLOBAIS DE E-COMMERCE */}
      <CartDrawer />
      <CheckoutModal />
    </div>
  )
}
