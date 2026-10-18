import { useParams, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { useStore } from '../state'
import { buildGraphs } from '../io/reader'
import Layout from '../components/Layout'

const GRADIENTS: Record<string, string> = {
  RPG: 'from-purple-900 to-purple-950',
  Action: 'from-red-900 to-red-950',
  FPS: 'from-sky-900 to-sky-950',
  Simulation: 'from-green-900 to-green-950',
  Sandbox: 'from-amber-900 to-amber-950',
}

export default function GameDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentUserId, users, games, interactions, buyGame } = useStore()

  const game = games.find(g => g.id === id)
  const user = users.find(u => u.id === currentUserId)!

  const { libraries } = useMemo(
    () => buildGraphs({ users, games, interactions }),
    [users, games, interactions]
  )

  if (!game) {
    return (
      <Layout>
        <div className="p-8 text-gray-400">Jogo nao encontrado.</div>
      </Layout>
    )
  }

  const owned = user.library.includes(game.id)
  const gradient = GRADIENTS[game.category] ?? 'from-gray-700 to-gray-900'

  const friendsWhoOwn = user.friends
    .filter(fId => libraries.get(fId)?.has(game.id))
    .map(fId => users.find(u => u.id === fId)!)
    .filter(Boolean)

  const othersWhoOwn = users.filter(
    u => u.id !== currentUserId && !user.friends.includes(u.id) && libraries.get(u.id)?.has(game.id)
  )

  return (
    <Layout>
      <div className={`w-full h-64 bg-gradient-to-b ${gradient} relative overflow-hidden`}>
        <img
          src={game.cover}
          alt={game.title}
          className="w-full h-full object-cover opacity-40"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-8 -mt-20 pb-16 relative">
        <div className="flex gap-8 items-start">
          <div className={`w-48 h-64 rounded-xl bg-gradient-to-b ${gradient} flex-shrink-0 overflow-hidden shadow-2xl`}>
            <img
              src={game.cover}
              alt={game.title}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>

          <div className="flex-1 pt-16">
            <span className="text-xs text-gray-500 uppercase tracking-widest">{game.category}</span>
            <h1 className="text-3xl font-bold mt-1 mb-3">{game.title}</h1>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">{game.description}</p>

            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold">
                {game.price === 0 ? 'Gratuito' : `R$ ${game.price.toFixed(2)}`}
              </span>
              {owned ? (
                <span className="bg-green-700 text-white text-sm px-4 py-2 rounded">
                  Na sua biblioteca
                </span>
              ) : (
                <button
                  onClick={() => { buyGame(game.id); navigate('/library') }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-6 py-2 rounded transition-colors"
                >
                  Comprar
                </button>
              )}
            </div>
          </div>
        </div>

        {(friendsWhoOwn.length > 0 || othersWhoOwn.length > 0) && (
          <div className="mt-12">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Quem joga na sua rede
            </h2>
            <div className="space-y-2">
              {friendsWhoOwn.map(u => (
                <div key={u.id} className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-sm font-bold">
                    {u.displayName[0]}
                  </div>
                  <span className="text-sm">{u.displayName}</span>
                  <span className="text-xs text-gray-500 ml-auto">amigo direto</span>
                </div>
              ))}
              {othersWhoOwn.map(u => (
                <div key={u.id} className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-bold">
                    {u.displayName[0]}
                  </div>
                  <span className="text-sm text-gray-400">{u.displayName}</span>
                  <span className="text-xs text-gray-600 ml-auto">outro usuario</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
