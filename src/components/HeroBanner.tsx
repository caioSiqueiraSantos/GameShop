import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../state'

export default function HeroBanner() {
  const { games, users, currentUserId, addToCart, startDirectCheckout } = useStore()
  const navigate = useNavigate()

  const currentUser = users.find(u => u.id === currentUserId)

  // Seleciona jogos destacados (g1, g3, g2, g4 ou fallback)
  const featuredIds = ['g1', 'g3', 'g2', 'g4']
  const featuredGames = featuredIds
    .map(id => games.find(g => g.id === id))
    .filter(Boolean) as typeof games

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Auto-avanço suave do carrossel
  useEffect(() => {
    if (isPaused || featuredGames.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % featuredGames.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [isPaused, featuredGames.length])

  if (featuredGames.length === 0) return null

  const currentGame = featuredGames[currentIndex]
  const isOwned = currentUser?.library.includes(currentGame.id)

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? featuredGames.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % featuredGames.length)
  }

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full rounded-3xl overflow-hidden mb-12 bg-gray-950 border border-gray-800 shadow-2xl group"
    >
      {/* Background Cover */}
      <div className="relative h-[360px] sm:h-[420px] w-full overflow-hidden">
        <img
          src={currentGame.bannerCover || currentGame.cover}
          alt={currentGame.title}
          className="w-full h-full object-cover object-center filter brightness-90 contrast-105 scale-105 transition-transform duration-1000 ease-out group-hover:scale-100"
        />

        {/* Gradientes atmosféricos */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-black/30" />
      </div>

      {/* Conteúdo do Banner */}
      <div className="absolute inset-0 p-8 sm:p-12 flex flex-col justify-between z-10">
        {/* Top Badges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-600/90 text-white shadow-md shadow-indigo-600/40 backdrop-blur-md">
            Destaque da Loja
          </span>

          <span className="text-xs font-mono px-3 py-1 rounded-full bg-gray-900/80 text-gray-300 border border-gray-700/80 backdrop-blur-md">
            {currentGame.category}
          </span>
        </div>

        {/* Center / Bottom Info */}
        <div className="max-w-xl space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
            {currentGame.title}
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 leading-relaxed drop-shadow">
            {currentGame.tagline || currentGame.description}
          </p>

          {/* Preços e Ações */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="bg-gray-900/90 border border-gray-700/80 px-4 py-2 rounded-2xl backdrop-blur-md">
              <span className="text-lg sm:text-2xl font-black text-white font-mono">
                {currentGame.price === 0 ? 'Gratuito' : `R$ ${currentGame.price.toFixed(2)}`}
              </span>
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center gap-2.5">
              {isOwned ? (
                <button
                  onClick={() => navigate('/library')}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl transition-all shadow-lg shadow-emerald-950 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Na sua Biblioteca</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => addToCart(currentGame.id)}
                    className="bg-gray-900/90 hover:bg-gray-800 border border-gray-700/80 text-white font-bold text-xs sm:text-sm px-4 py-3 rounded-2xl transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    <span>Adicionar ao Carrinho</span>
                  </button>

                  <button
                    onClick={() => startDirectCheckout(currentGame.id)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-2"
                  >
                    <span>Comprar Agora</span>
                  </button>
                </>
              )}

              <button
                onClick={() => navigate(`/game/${currentGame.id}`)}
                className="bg-gray-900/90 hover:bg-gray-800 text-gray-200 border border-gray-700/80 font-semibold text-xs sm:text-sm px-4 py-3 rounded-2xl transition-all backdrop-blur-md"
              >
                Ver Detalhes
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé do Banner */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2.5">
            {featuredGames.map((game, idx) => (
              <button
                key={game.id}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all rounded-full ${
                  idx === currentIndex
                    ? 'w-8 h-2.5 bg-indigo-500 shadow-md shadow-indigo-500/50'
                    : 'w-2.5 h-2.5 bg-gray-600 hover:bg-gray-400'
                }`}
                title={game.title}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="w-9 h-9 rounded-xl bg-gray-900/80 hover:bg-gray-800 border border-gray-700/80 text-gray-300 hover:text-white flex items-center justify-center transition-all backdrop-blur-md"
              title="Jogo anterior"
            >
              ❮
            </button>
            <button
              onClick={handleNext}
              className="w-9 h-9 rounded-xl bg-gray-900/80 hover:bg-gray-800 border border-gray-700/80 text-gray-300 hover:text-white flex items-center justify-center transition-all backdrop-blur-md"
              title="Próximo jogo"
            >
              ❯
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
