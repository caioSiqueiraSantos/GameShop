import { useNavigate } from 'react-router-dom'
import { useStore } from '../state'

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    games,
    users,
    currentUserId,
    removeFromCart,
    setCartRecipient,
    clearCart,
    setIsCheckoutOpen,
  } = useStore()

  const navigate = useNavigate()

  if (!isCartOpen) return null

  const currentUser = users.find(u => u.id === currentUserId)
  const friends = (currentUser?.friends || [])
    .map(fId => users.find(u => u.id === fId))
    .filter(Boolean) as typeof users

  const cartItems = cart
    .map(item => ({
      game: games.find(g => g.id === item.gameId)!,
      recipientUserId: item.recipientUserId,
    }))
    .filter(item => Boolean(item.game))

  const total = cartItems.reduce((acc, curr) => acc + curr.game.price, 0)

  const handleProceedToCheckout = () => {
    setIsCartOpen(false)
    setIsCheckoutOpen(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-md bg-gray-900 border-l border-gray-800 shadow-2xl flex flex-col h-full z-10">
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Carrinho de Jogos</span>
                <span className="text-xs bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full font-mono">
                  {cartItems.length}
                </span>
              </h2>
              <p className="text-[11px] text-gray-400">Entrega digital instantânea</p>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
            title="Fechar carrinho"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-800/80 border border-gray-700 flex items-center justify-center text-gray-500 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-300">Seu carrinho está vazio</h3>
            <p className="text-xs text-gray-500 mt-1.5 max-w-xs leading-relaxed">
              Explore o catálogo da loja e adicione jogos para concluir a compra pelo sistema de pagamento.
            </p>
            <button
              onClick={() => {
                setIsCartOpen(false)
                navigate('/store')
              }}
              className="mt-6 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/25"
            >
              Explorar Loja de Jogos
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
            {cartItems.map(({ game, recipientUserId }) => (
              <div
                key={game.id}
                className="bg-gray-950/70 border border-gray-800 rounded-xl p-3.5 flex flex-col gap-2.5 hover:border-gray-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={game.cover}
                    alt={game.title}
                    className="w-14 h-16 object-cover rounded-lg flex-shrink-0 bg-gray-800 border border-gray-700/50"
                    onError={e => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-white truncate">{game.title}</h4>
                      <button
                        onClick={() => removeFromCart(game.id)}
                        className="text-gray-500 hover:text-rose-400 p-1 rounded hover:bg-rose-950/30 transition-colors"
                        title="Remover do carrinho"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>

                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">
                      {game.category}
                    </span>

                    <div className="flex items-baseline gap-2 mt-1.5">
                      <span className="text-sm font-bold text-white font-mono">
                        {game.price === 0 ? 'Gratuito' : `R$ ${game.price.toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Seletor de Destinatário */}
                <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-gray-400 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                      />
                    </svg>
                    <span>Destino:</span>
                  </span>

                  <select
                    value={recipientUserId || ''}
                    onChange={e => setCartRecipient(game.id, e.target.value || undefined)}
                    className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-[11px] text-gray-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Minha Biblioteca (Para Mim)</option>
                    {friends.length > 0 && (
                      <optgroup label="Presentear Amigo:">
                        {friends.map(friend => (
                          <option key={friend.id} value={friend.id}>
                            🎁 {friend.displayName} (@{friend.username})
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer & Checkout Area */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-gray-800 bg-gray-950/90 space-y-4">
            {/* Resumo Financeiro Limpo */}
            <div className="space-y-1.5 text-xs text-gray-400">
              <div className="flex justify-between text-base font-bold text-white pt-1">
                <span>Total do Pedido:</span>
                <span className="font-mono text-emerald-400">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Botão de Ação */}
            <div className="space-y-2">
              <button
                onClick={handleProceedToCheckout}
                className="w-full bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Ir para o Pagamento ({cartItems.length})</span>
              </button>

              <button
                onClick={clearCart}
                className="w-full text-[11px] text-gray-500 hover:text-gray-400 transition-colors py-1"
              >
                Esvaziar carrinho
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
