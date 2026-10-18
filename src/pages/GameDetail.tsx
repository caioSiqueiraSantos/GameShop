import { useParams, useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
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
  const {
    currentUserId,
    users,
    games,
    interactions,
    addToCart,
    startDirectCheckout,
    cart,
    reviews,
    addReview,
    toggleReviewHelpful,
  } = useStore()

  const [reviewText, setReviewText] = useState('')
  const [isRecommended, setIsRecommended] = useState(true)
  const [hoursPlayedInput, setHoursPlayedInput] = useState(24)
  const [reviewFilter, setReviewFilter] = useState<'all' | 'friends'>('all')
  const [showReviewSuccess, setShowReviewSuccess] = useState(false)

  const game = games.find(g => g.id === id)
  const user = users.find(u => u.id === currentUserId)!

  const { libraries } = useMemo(
    () => buildGraphs({ users, games, interactions }),
    [users, games, interactions]
  )

  if (!game) {
    return (
      <Layout>
        <div className="p-12 text-center text-gray-400">Jogo não encontrado.</div>
      </Layout>
    )
  }

  const owned = user.library.includes(game.id)
  const inCart = cart.some(item => item.gameId === game.id)
  const gradient = GRADIENTS[game.category] ?? 'from-gray-700 to-gray-900'

  const friendsWhoOwn = user.friends
    .filter(fId => libraries.get(fId)?.has(game.id))
    .map(fId => users.find(u => u.id === fId)!)
    .filter(Boolean)

  const othersWhoOwn = users.filter(
    u => u.id !== currentUserId && !user.friends.includes(u.id) && libraries.get(u.id)?.has(game.id)
  )

  // Reviews do jogo
  const gameReviews = reviews.filter(r => r.gameId === game.id)
  const positiveReviews = gameReviews.filter(r => r.recommended).length
  const approvalRate = gameReviews.length > 0 ? Math.round((positiveReviews / gameReviews.length) * 100) : 95

  const filteredReviews = gameReviews.filter(r => {
    if (reviewFilter === 'friends') {
      return user.friends.includes(r.userId)
    }
    return true
  })

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!owned || !reviewText.trim()) return

    addReview({
      gameId: game.id,
      userId: currentUserId!,
      recommended: isRecommended,
      hoursPlayed: Number(hoursPlayedInput) || 12,
      content: reviewText.trim(),
    })

    setReviewText('')
    setShowReviewSuccess(true)
    setTimeout(() => setShowReviewSuccess(false), 3000)
  }

  return (
    <Layout>
      {/* Hero Banner Superior com Cover Expandido */}
      <div className={`w-full h-80 bg-gradient-to-b ${gradient} relative overflow-hidden`}>
        <img
          src={game.cover}
          alt={game.title}
          className="w-full h-full object-cover opacity-35 filter blur-sm scale-105"
          onError={e => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 -mt-36 pb-20 relative">
        {/* Card Principal do Jogo */}
        <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row gap-8 items-start">
          {/* Capa */}
          <div
            className={`w-52 h-72 rounded-2xl bg-gradient-to-b ${gradient} flex-shrink-0 overflow-hidden shadow-2xl border border-gray-700/60 relative group`}
          >
            <img
              src={game.cover}
              alt={game.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={e => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>

          {/* Informações Centrais e Compra */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-3 py-1 rounded-full font-mono font-semibold">
                {game.category}
              </span>
              <span className="text-xs text-gray-500 font-mono">ID: #{game.id}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{game.title}</h1>
            <p className="text-gray-300 text-sm leading-relaxed mt-3 mb-6">{game.description}</p>

            {/* Termômetro de Avaliações Comunitárias */}
            <div className="bg-gray-950/70 border border-gray-800 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-gray-400 uppercase tracking-wider block font-semibold">
                  Avaliações da Comunidade
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-emerald-400 font-bold text-sm">
                    {approvalRate >= 80 ? 'Muito Positivas' : 'Ligeiramente Positivas'}
                  </span>
                  <span className="text-gray-400 text-xs font-mono">
                    ({approvalRate}% de recomendação em {Math.max(gameReviews.length * 15, 60)} análises)
                  </span>
                </div>
              </div>

              {/* Barra de Sentimento */}
              <div className="w-full sm:w-48">
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full transition-all" style={{ width: `${approvalRate}%` }} />
                  <div className="bg-rose-500 h-full transition-all" style={{ width: `${100 - approvalRate}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1">
                  <span>{approvalRate}% Recomendam</span>
                  <span>{100 - approvalRate}% Não</span>
                </div>
              </div>
            </div>

            {/* Bloco Comercial de Preço & Ações com Pagamento Obrigatório */}
            <div className="pt-4 border-t border-gray-800 flex flex-wrap items-center justify-between gap-4">
              <span className="text-3xl font-black text-white font-mono">
                {game.price === 0 ? 'Gratuito' : `R$ ${game.price.toFixed(2)}`}
              </span>

              <div className="flex items-center gap-3">
                {owned ? (
                  <button
                    onClick={() => navigate('/library')}
                    className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-950 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Na sua Biblioteca</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => addToCart(game.id)}
                      className={`text-sm font-bold px-5 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 ${
                        inCart
                          ? 'bg-indigo-950 border border-indigo-700 text-indigo-300'
                          : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      <span>{inCart ? 'No Carrinho ✓' : 'Adicionar ao Carrinho'}</span>
                    </button>

                    {/* Botão Comprar Agora: Direciona ao Checkout Seguro para Pagamento via Pix ou Cartão */}
                    <button
                      onClick={() => startDirectCheckout(game.id)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-7 py-3 rounded-xl transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-2"
                    >
                      <span>Comprar Agora</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* DUAS COLUNAS: REDE SOCIAL DE AMIGOS E SEÇÃO DE REVIEWS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12 items-start">
          {/* Coluna 1: Avaliações da Comunidade (8 colunas) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Avaliações & Opiniões</span>
                  <span className="text-xs bg-gray-800 text-gray-400 px-2.5 py-0.5 rounded-full font-mono">
                    {gameReviews.length}
                  </span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Análises verificadas e impacto no sistema de recomendação por afinidade.
                </p>
              </div>

              {/* Filtro de Amigos */}
              <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-xl p-1 text-xs">
                <button
                  onClick={() => setReviewFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    reviewFilter === 'all' ? 'bg-indigo-600 text-white font-medium' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Todas ({gameReviews.length})
                </button>
                <button
                  onClick={() => setReviewFilter('friends')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    reviewFilter === 'friends'
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Amigos ({gameReviews.filter(r => user.friends.includes(r.userId)).length})
                </button>
              </div>
            </div>

            {/* FORMULÁRIO: Apenas se a pessoa possuir o jogo na biblioteca! */}
            {owned ? (
              <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 shadow-lg animate-fadeIn">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                  <span>Avaliar {game.title}</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                    Proprietário Verificado ✓
                  </span>
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  Sua recomendação influencia diretamente as sugestões aos seus amigos e usuários com gostos similares.
                </p>

                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {/* Seletor: Recomendado ou Não */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsRecommended(true)}
                      className={`py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                        isRecommended
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950'
                          : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      <span>👍 Recomendo este Jogo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsRecommended(false)}
                      className={`py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                        !isRecommended
                          ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-md shadow-rose-950'
                          : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      <span>👎 Não Recomendo</span>
                    </button>
                  </div>

                  {/* Textarea */}
                  <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    placeholder="Escreva sua análise detalhada sobre jogabilidade, enredo e experiência..."
                    rows={3}
                    className="w-full bg-gray-950 border border-gray-700/80 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>Horas jogadas:</span>
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={hoursPlayedInput}
                        onChange={e => setHoursPlayedInput(Number(e.target.value))}
                        className="w-16 bg-gray-950 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white text-center font-mono"
                      />
                      <span>horas</span>
                    </div>

                    <button
                      type="submit"
                      disabled={!reviewText.trim()}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs px-5 py-2 rounded-xl transition-all shadow"
                    >
                      {showReviewSuccess ? 'Análise Publicada! ✓' : 'Publicar Análise'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* AVISO DE RESTRIÇÃO SE NÃO TIVER O JOGO */
              <div className="bg-gray-950/60 border border-gray-800 rounded-2xl p-6 text-center">
                <div className="w-10 h-10 rounded-xl bg-gray-800/80 border border-gray-700 flex items-center justify-center mx-auto mb-2 text-gray-400">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-gray-300">Avaliação restrita a proprietários</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Você precisa adquirir este jogo e tê-lo na sua biblioteca antes de poder avaliá-lo e influenciar o sistema de recomendações.
                </p>
              </div>
            )}

            {/* Feed de Reviews */}
            {filteredReviews.length === 0 ? (
              <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-8 text-center text-gray-500 text-xs">
                {reviewFilter === 'friends'
                  ? 'Nenhum amigo seu publicou análise deste jogo ainda.'
                  : 'Nenhuma análise encontrada.'}
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredReviews.map(rev => {
                  const reviewer = users.find(u => u.id === rev.userId)
                  const isFriend = user.friends.includes(rev.userId)
                  const isSelf = rev.userId === currentUserId
                  const hasVotedHelpful = rev.helpfulVotedBy.includes(currentUserId!)

                  return (
                    <div
                      key={rev.id}
                      className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 space-y-3 hover:border-gray-700 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-700 to-violet-700 flex items-center justify-center text-xs font-bold text-white shadow">
                            {reviewer?.displayName ? reviewer.displayName[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">
                                {reviewer?.displayName || 'Jogador'}
                              </span>
                              {isFriend && (
                                <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-1.5 py-0.2 rounded font-semibold">
                                  Seu Amigo
                                </span>
                              )}
                              {isSelf && (
                                <span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.2 rounded font-mono">
                                  Você
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-500 font-mono">
                              {rev.hoursPlayed}h registradas • {rev.createdAt}
                            </span>
                          </div>
                        </div>

                        {/* Tag de Recomendação */}
                        <div
                          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl border ${
                            rev.recommended
                              ? 'bg-emerald-950/70 border-emerald-800 text-emerald-400'
                              : 'bg-rose-950/70 border-rose-800 text-rose-400'
                          }`}
                        >
                          <span>{rev.recommended ? '👍 Recomendado' : '👎 Não Recomendado'}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-300 leading-relaxed pl-12">{rev.content}</p>

                      {/* Votação de Útil */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-800/80 pl-12 text-[11px]">
                        <span className="text-gray-500">
                          {rev.helpfulVotedBy.length > 0 &&
                            `${rev.helpfulVotedBy.length} ${rev.helpfulVotedBy.length === 1 ? 'pessoa achou' : 'pessoas acharam'} esta análise útil`}
                        </span>

                        <button
                          onClick={() => toggleReviewHelpful(rev.id)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all ${
                            hasVotedHelpful
                              ? 'bg-indigo-950 border-indigo-700 text-indigo-300 font-bold'
                              : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white'
                          }`}
                        >
                          <span>👍 Foi útil?</span>
                          <span className="font-mono">({rev.helpfulVotedBy.length})</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Coluna 2: Quem joga na sua rede (Grafo Social - 4 colunas) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span>Quem joga na sua rede</span>
              </h3>
              <p className="text-[11px] text-gray-400 mb-4">
                Conexões do grafo social que possuem este título na biblioteca.
              </p>

              {friendsWhoOwn.length === 0 && othersWhoOwn.length === 0 ? (
                <div className="bg-gray-950/60 rounded-xl p-4 text-center text-xs text-gray-500">
                  Nenhum amigo na sua rede possui este jogo ainda.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {friendsWhoOwn.map(u => (
                    <div
                      key={u.id}
                      className="flex items-center gap-3 bg-gray-950/70 border border-indigo-900/40 rounded-xl p-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow">
                        {u.displayName[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate">{u.displayName}</p>
                        <p className="text-[10px] text-gray-400 font-mono">@{u.username}</p>
                      </div>
                      <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-medium">
                        Amigo direto
                      </span>
                    </div>
                  ))}

                  {othersWhoOwn.slice(0, 4).map(u => (
                    <div
                      key={u.id}
                      className="flex items-center gap-3 bg-gray-950/40 border border-gray-800 rounded-xl p-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-300 flex-shrink-0">
                        {u.displayName[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-300 truncate">{u.displayName}</p>
                        <p className="text-[10px] text-gray-500 font-mono">@{u.username}</p>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">2º grau</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
