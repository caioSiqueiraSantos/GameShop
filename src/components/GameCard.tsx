import type { Game } from '../core/Graph'
import { useStore } from '../state'

interface Props {
  game: Game
  owned?: boolean
  reason?: string
  onBuy?: () => void
  onClick?: () => void
}

const GRADIENTS: Record<string, string> = {
  RPG: 'from-purple-900 to-purple-950',
  Action: 'from-red-900 to-red-950',
  FPS: 'from-sky-900 to-sky-950',
  Simulation: 'from-green-900 to-green-950',
  Sandbox: 'from-amber-900 to-amber-950',
}

export default function GameCard({ game, owned, reason, onBuy, onClick }: Props) {
  const { cart, addToCart, startDirectCheckout } = useStore()
  const gradient = GRADIENTS[game.category] ?? 'from-gray-700 to-gray-900'
  const inCart = cart.some(item => item.gameId === game.id)

  const handleBuy = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onBuy) {
      onBuy()
    } else {
      startDirectCheckout(game.id)
    }
  }

  return (
    <div
      onClick={onClick}
      className="group bg-gray-900/90 border border-gray-800 rounded-xl overflow-hidden cursor-pointer hover:border-indigo-500/80 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        {/* Cover Image Container */}
        <div className={`h-40 bg-gradient-to-b ${gradient} relative overflow-hidden`}>
          <img
            src={game.cover}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />

          {/* Badges no Topo da Imagem */}
          <div className="absolute top-2 right-2 pointer-events-none">
            {owned ? (
              <span className="bg-emerald-800/90 border border-emerald-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow">
                Na biblioteca
              </span>
            ) : inCart ? (
              <span className="bg-indigo-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow">
                No carrinho ✓
              </span>
            ) : null}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-3.5">
          <p className="font-bold text-sm text-white truncate group-hover:text-indigo-400 transition-colors">
            {game.title}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{game.category}</p>

          {reason && (
            <div className="mt-1.5 bg-indigo-950/40 border border-indigo-900/50 rounded-md px-2 py-1">
              <p className="text-[10px] text-indigo-300 truncate" title={reason}>
                💡 {reason}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Preço e Ações */}
      <div className="p-3.5 pt-0 mt-auto">
        <div className="flex items-center justify-between pt-2 border-t border-gray-800/80">
          <span className="text-sm font-bold text-white font-mono">
            {game.price === 0 ? 'Gratuito' : `R$ ${game.price.toFixed(2)}`}
          </span>

          {!owned && (
            <div className="flex items-center gap-1.5">
              {/* Botão Carrinho Rápido */}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  addToCart(game.id)
                }}
                className={`p-1.5 rounded-lg border transition-all ${
                  inCart
                    ? 'bg-indigo-950 border-indigo-700 text-indigo-300'
                    : 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-300 hover:text-white'
                }`}
                title={inCart ? 'Já está no carrinho' : 'Adicionar ao carrinho'}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </button>

              {/* Botão Comprar Imediato (leva ao checkout para pagamento) */}
              <button
                type="button"
                onClick={handleBuy}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-2.5 py-1.5 rounded-lg transition-colors shadow-sm"
              >
                Comprar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
