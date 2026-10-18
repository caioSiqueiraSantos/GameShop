import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../state'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { currentUserId, users, logout } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const user = users.find(u => u.id === currentUserId)

  const isStore = location.pathname.startsWith('/store') || location.pathname.startsWith('/game')
  const isLibrary = location.pathname.startsWith('/library')
  const isFriends = location.pathname.startsWith('/friends')
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="bg-gray-900/90 backdrop-blur-md border-b border-gray-800 px-8 py-3.5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate('/store')}
            className="flex items-center gap-2.5 text-lg font-black tracking-wider text-white hover:text-indigo-400 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-600/30">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <span>GameShop</span>
          </button>

          {/* Navegação Principal Diferenciada */}
          <nav className="flex items-center gap-1">
            <button
              onClick={() => navigate('/store')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isStore
                  ? 'bg-gray-800 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
              }`}
            >
              Loja
            </button>
            <button
              onClick={() => navigate('/library')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isLibrary
                  ? 'bg-gray-800 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
              }`}
            >
              Biblioteca
            </button>
            <button
              onClick={() => navigate('/friends')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isFriends
                  ? 'bg-gray-800 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
              }`}
            >
              Amigos
            </button>
          </nav>
        </div>

        {/* Lado Direito: Usuário Conectado e Botão Discreto de Admin */}
        <div className="flex items-center gap-4">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Admin</span>
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
    </div>
  )
}
