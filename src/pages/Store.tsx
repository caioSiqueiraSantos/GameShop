import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../state'
import { buildGraphs } from '../io/reader'
import { suggestGamesByFriends } from '../algorithms/bfs'
import { suggestGames } from '../algorithms/jaccard'
import GameCard from '../components/GameCard'
import HeroBanner from '../components/HeroBanner'
import Layout from '../components/Layout'

export default function Store() {
  const { currentUserId, users, games, interactions, reviews, startDirectCheckout } = useStore()
  const navigate = useNavigate()

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const user = users.find(u => u.id === currentUserId)!

  const { social, libraries } = useMemo(
    () => buildGraphs({ users, games, interactions }),
    [users, games, interactions]
  )

  const friendSuggestions = useMemo(
    () => suggestGamesByFriends(social, currentUserId!, libraries),
    [social, currentUserId, libraries]
  )

  // Jaccard agora integra as avaliações (recomendar ou não)
  const jaccardSuggestions = useMemo(
    () => suggestGames(currentUserId!, libraries, reviews),
    [currentUserId, libraries, reviews]
  )

  const recommendations = useMemo(() => {
    const seen = new Set<string>()
    const result: { gameId: string; reason: string }[] = []

    for (const r of friendSuggestions.slice(0, 4)) {
      if (seen.has(r.gameId)) continue
      const names = r.ownedByFriends.map(id => users.find(u => u.id === id)?.displayName ?? id)
      result.push({ gameId: r.gameId, reason: `${names.join(', ')} ${names.length === 1 ? 'joga' : 'jogam'}` })
      seen.add(r.gameId)
    }

    for (const r of jaccardSuggestions.slice(0, 4)) {
      if (seen.has(r.gameId)) continue
      const fromName = users.find(u => u.id === r.fromUser)?.displayName ?? r.fromUser
      const positiveNote = r.positiveReview ? ' • Recomendado' : ''
      result.push({
        gameId: r.gameId,
        reason: `Perfil similar a ${fromName} (${(r.score * 100).toFixed(0)}%)${positiveNote}`,
      })
      seen.add(r.gameId)
    }

    return result.slice(0, 6)
  }, [friendSuggestions, jaccardSuggestions, users])

  const categories = useMemo(() => {
    const set = new Set<string>()
    games.forEach(g => set.add(g.category))
    return ['all', ...Array.from(set)]
  }, [games])

  const filteredGames = useMemo(() => {
    return games.filter(g => {
      const matchCat = selectedCategory === 'all' || g.category === selectedCategory
      const matchQuery =
        searchQuery.trim() === '' ||
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.category.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchQuery
    })
  }, [games, selectedCategory, searchQuery])

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
        {/* Banner de Destaques no Topo da Loja */}
        <HeroBanner />

        {/* Seção de Recomendações por Algoritmos (BFS & Jaccard com Reviews) */}
        {recommendations.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Recomendado para Você</span>
                  <span className="text-xs bg-indigo-950 text-indigo-400 border border-indigo-800 px-2 py-0.5 rounded-full font-mono">
                    Social Graph & Jaccard + Avaliações
                  </span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Algoritmos baseados na rede dos seus amigos e perfis de gosto similar com avaliações comunitárias.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recommendations.map(({ gameId, reason }) => {
                const game = games.find(g => g.id === gameId)!
                return (
                  <GameCard
                    key={gameId}
                    game={game}
                    reason={reason}
                    owned={user.library.includes(gameId)}
                    onBuy={() => startDirectCheckout(gameId)}
                    onClick={() => navigate(`/game/${gameId}`)}
                  />
                )
              })}
            </div>
          </section>
        )}

        {/* Seção do Catálogo Completo com Filtros */}
        <section>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Catálogo Completo</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Explore todos os títulos disponíveis para entrega digital imediata.
              </p>
            </div>

            {/* Barra de Busca e Filtros */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Categorias */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {cat === 'all' ? 'Todos os jogos' : cat}
                  </button>
                ))}
              </div>

              {/* Input de Busca */}
              <div className="relative w-full sm:w-56">
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
                  placeholder="Buscar jogo..."
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {filteredGames.length === 0 ? (
            <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-12 text-center text-gray-500 text-xs">
              Nenhum jogo encontrado para a busca "{searchQuery}".
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredGames.map(game => (
                <GameCard
                  key={game.id}
                  game={game}
                  owned={user.library.includes(game.id)}
                  onBuy={() => startDirectCheckout(game.id)}
                  onClick={() => navigate(`/game/${game.id}`)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  )
}
