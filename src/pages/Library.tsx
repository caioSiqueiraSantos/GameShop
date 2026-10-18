import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../state'
import Layout from '../components/Layout'
import GameCard from '../components/GameCard'

export default function Library() {
  const { currentUserId, users, games } = useStore()
  const navigate = useNavigate()

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const user = users.find(u => u.id === currentUserId)!

  const ownedGames = useMemo(() => {
    return games.filter(g => user.library.includes(g.id))
  }, [games, user.library])

  const categories = useMemo(() => {
    const set = new Set<string>()
    ownedGames.forEach(g => set.add(g.category))
    return ['all', ...Array.from(set)]
  }, [ownedGames])

  const filteredGames = useMemo(() => {
    return ownedGames.filter(g => {
      const matchCategory = selectedCategory === 'all' || g.category === selectedCategory
      const matchSearch =
        searchQuery.trim() === '' ||
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.category.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCategory && matchSearch
    })
  }, [ownedGames, selectedCategory, searchQuery])

  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {}
    ownedGames.forEach(g => {
      counts[g.category] = (counts[g.category] ?? 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [ownedGames])

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-8 py-10">
        {/* Banner do Perfil do Jogador na Biblioteca */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-indigo-600/30">
              {user.displayName[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{user.displayName}</h1>
                <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full font-mono">
                  @{user.username}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {ownedGames.length} {ownedGames.length === 1 ? 'jogo adquirido' : 'jogos adquiridos na biblioteca'}
                {categoryStats.length > 0 && (
                  <span className="ml-2 text-gray-500">
                    • Gêneros favoritos: {categoryStats.slice(0, 2).map(([c, n]) => `${c} (${n})`).join(', ')}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/store')}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20"
            >
              Explorar Loja
            </button>
            <button
              onClick={() => navigate('/friends')}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium px-4 py-2.5 rounded-xl transition-all border border-gray-700"
            >
              Ver Amigos ({user.friends.length})
            </button>
          </div>
        </div>

        {/* Barra de Filtros e Busca de Jogos */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {cat === 'all' ? 'Todos os jogos' : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <svg
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar na biblioteca..."
              className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Grade de Jogos da Biblioteca */}
        {filteredGames.length === 0 ? (
          <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4 text-gray-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-300">
              {ownedGames.length === 0
                ? 'Sua biblioteca ainda está vazia'
                : 'Nenhum jogo encontrado para este filtro'}
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              {ownedGames.length === 0
                ? 'Visite o catálogo da loja e adquira jogos para compor sua biblioteca e receber recomendações personalizadas.'
                : 'Tente alterar os termos de busca ou selecionar outra categoria.'}
            </p>
            {ownedGames.length === 0 && (
              <button
                onClick={() => navigate('/store')}
                className="mt-5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow"
              >
                Ir para a Loja
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredGames.map(game => (
              <GameCard
                key={game.id}
                game={game}
                owned
                onClick={() => navigate(`/game/${game.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
