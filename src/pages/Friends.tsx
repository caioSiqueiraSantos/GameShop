import { useState, useMemo } from 'react'
import { useStore } from '../state'
import { buildGraphs } from '../io/reader'
import { suggestFriends } from '../algorithms/bfs'
import Layout from '../components/Layout'

export default function Friends() {
  const { currentUserId, users, games, interactions, addFriend, removeFriend } = useStore()

  const [searchQuery, setSearchQuery] = useState('')

  const user = users.find(u => u.id === currentUserId)!

  const { social } = useMemo(
    () => buildGraphs({ users, games, interactions }),
    [users, games, interactions]
  )

  const friendSuggestions = useMemo(
    () => suggestFriends(social, currentUserId!),
    [social, currentUserId]
  )

  const currentFriends = useMemo(() => {
    return user.friends
      .map(id => users.find(u => u.id === id))
      .filter(Boolean) as typeof users
  }, [user.friends, users])

  // Busca de usuários armazenados no storage
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return []
    return users.filter(u => {
      const matchUsername = u.username.toLowerCase().includes(query)
      const matchName = u.displayName.toLowerCase().includes(query)
      const matchId = u.id.toLowerCase() === query
      return matchUsername || matchName || matchId
    })
  }, [searchQuery, users])

  // Calcula amigos em comum com qualquer usuário
  const getMutualFriends = (targetId: string) => {
    const myFriends = new Set(social.neighbors(currentUserId!))
    const theirFriends = social.neighbors(targetId)
    return theirFriends
      .filter(id => myFriends.has(id))
      .map(id => users.find(u => u.id === id)?.displayName)
      .filter(Boolean) as string[]
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-8 py-10">
        {/* Cabeçalho da Página de Amigos e Comunidade */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-cyan-600/25">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Amigos & Comunidade</h1>
              <p className="text-xs text-gray-400 mt-1">
                Você possui <strong className="text-indigo-300">{currentFriends.length} conexões diretas</strong> na sua rede social.
                Pesquise usuários cadastrados e conecte-se para expandir suas recomendações de jogos.
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-gray-500 font-mono block">Grafo de Usuários</span>
            <span className="text-sm font-semibold text-gray-300">
              {users.length} usuários registrados no sistema
            </span>
          </div>
        </div>

        {/* CAMPO DE PESQUISA DE USUÁRIOS NO STORAGE */}
        <section className="mb-10">
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 shadow-xl">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Pesquisar Usuários no Sistema</span>
            </label>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Digite o nome de exibição ou @usuário para buscar no storage..."
                className="w-full bg-gray-950/80 border border-gray-700/80 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white"
                  title="Limpar busca"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Resultados da Busca */}
            {searchQuery.trim() !== '' && (
              <div className="mt-4 pt-4 border-t border-gray-800 animate-fadeIn">
                <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
                  <span>Resultados da busca ({searchResults.length} encontrados)</span>
                  <span className="text-[11px] text-gray-500">Busca dinâmica no LocalStorage</span>
                </div>

                {searchResults.length === 0 ? (
                  <p className="text-xs text-gray-500 py-3 text-center">
                    Nenhum usuário encontrado correspondente a "{searchQuery}".
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {searchResults.map(targetUser => {
                      const isSelf = targetUser.id === currentUserId
                      const isFriend = user.friends.includes(targetUser.id)
                      const mutuals = getMutualFriends(targetUser.id)

                      return (
                        <div
                          key={targetUser.id}
                          className="p-3.5 rounded-xl border border-gray-800 bg-gray-950/70 flex items-center justify-between group hover:border-gray-700 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-sm font-bold text-gray-200 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex-shrink-0">
                              {targetUser.displayName[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-gray-200 truncate group-hover:text-white">
                                {targetUser.displayName}
                              </p>
                              <p className="text-[11px] text-gray-400 font-mono truncate">@{targetUser.username}</p>
                              <div className="text-[10px] text-gray-500 mt-0.5">
                                <span>{targetUser.library.length} jogos</span>
                                {mutuals.length > 0 && !isSelf && (
                                  <span className="ml-1 text-indigo-400">
                                    • {mutuals.length} em comum
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex-shrink-0 ml-2">
                            {isSelf ? (
                              <span className="text-[11px] text-gray-500 bg-gray-800 px-2.5 py-1 rounded-md">
                                Você
                              </span>
                            ) : isFriend ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-md font-medium">
                                  Amigo ✓
                                </span>
                                <button
                                  onClick={() => removeFriend(targetUser.id)}
                                  className="text-[10px] text-gray-500 hover:text-rose-400 p-1 hover:bg-rose-950/40 rounded transition-colors"
                                  title="Remover amizade"
                                >
                                  Desfazer
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addFriend(targetUser.id)}
                                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3 py-1.5 rounded-lg transition-colors shadow-sm flex items-center gap-1"
                              >
                                <span>+ Adicionar</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* DUAS COLUNAS: MEUS AMIGOS E SUGESTÕES BFS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Coluna 1: Meus Amigos */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <span>Meus Amigos</span>
                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full font-mono">
                  {currentFriends.length}
                </span>
              </h2>
            </div>

            {currentFriends.length === 0 ? (
              <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mx-auto mb-3 text-gray-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-300">Você ainda não possui amigos adicionados</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  Use o campo de busca acima ou as sugestões de amizade ao lado para se conectar com outros jogadores.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentFriends.map(friend => (
                  <div
                    key={friend.id}
                    className="p-3.5 rounded-xl border border-gray-800 bg-gray-900/50 hover:bg-gray-800/40 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-700 to-violet-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow">
                        {friend.displayName[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{friend.displayName}</p>
                        <p className="text-[11px] text-gray-400 font-mono">@{friend.username}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{friend.library.length} jogos na biblioteca</p>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFriend(friend.id)}
                      className="text-[11px] text-gray-500 hover:text-rose-400 hover:bg-rose-950/30 px-2 py-1 rounded transition-colors"
                      title="Remover amizade"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Coluna 2: Sugestões de Amizade (BFS - Busca em Largura) */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs bg-indigo-950 text-indigo-400 border border-indigo-800 px-2 py-0.5 rounded font-mono font-semibold">
                  BFS
                </span>
                <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Sugestões de Amizade
                </h2>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Amigos de amigos na rede de grafos rankeados por conexões mútuas.
              </p>
            </div>

            {friendSuggestions.length === 0 ? (
              <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 text-center text-xs text-gray-500">
                Nenhuma sugestão indireta no momento. Adicione mais amigos para expandir o raio de busca do algoritmo.
              </div>
            ) : (
              <div className="space-y-2.5">
                {friendSuggestions.map(s => {
                  const candidate = users.find(u => u.id === s.userId)!
                  const mutuals = s.mutualFriends.map(
                    id => users.find(u => u.id === id)?.displayName ?? id
                  )

                  return (
                    <div
                      key={s.userId}
                      className="p-3.5 bg-gray-900/60 border border-gray-800 rounded-xl hover:border-gray-700 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-300 flex-shrink-0">
                            {candidate.displayName[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">
                              {candidate.displayName}
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono">@{candidate.username}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => addFriend(s.userId)}
                          className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <span>Adicionar</span>
                        </button>
                      </div>

                      <div className="bg-gray-950/60 rounded-lg p-2 text-[11px] text-gray-400 flex items-start gap-1.5">
                        <svg className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span>
                          <strong className="text-gray-300 font-medium">{s.mutualFriends.length} em comum:</strong>{' '}
                          {mutuals.join(', ')}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
