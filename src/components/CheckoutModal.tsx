import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, type OrderReceipt } from '../state'

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    games,
    completeCheckout,
  } = useStore()

  const navigate = useNavigate()

  const [method, setMethod] = useState<'pix' | 'credit_card'>('pix')
  const [isProcessing, setIsProcessing] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<OrderReceipt | null>(null)
  const [copiedPix, setCopiedPix] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)

  // Campos do Cartão de Crédito - SEMPRE INICIAM E RESETAM EM BRANCO
  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [installments, setInstallments] = useState('1')
  const [cardError, setCardError] = useState<string | null>(null)

  // Timer para o Pix
  const [pixTimeLeft, setPixTimeLeft] = useState(900)

  // Toda vez que o modal abre, FORÇA a limpeza total dos campos do cartão
  useEffect(() => {
    if (isCheckoutOpen) {
      setCardNumber('')
      setCardHolder('')
      setCardExpiry('')
      setCardCvv('')
      setCardError(null)
      if (cart.length > 0) {
        setCompletedOrder(null)
      }
    }
  }, [isCheckoutOpen, cart.length])

  useEffect(() => {
    if (!isCheckoutOpen || method !== 'pix' || completedOrder) return
    const interval = setInterval(() => {
      setPixTimeLeft(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [isCheckoutOpen, method, completedOrder])

  if (!isCheckoutOpen) return null

  const cartGames = cart
    .map(item => ({
      game: games.find(g => g.id === item.gameId)!,
      recipientUserId: item.recipientUserId,
    }))
    .filter(item => Boolean(item.game))

  const finalTotal = cartGames.reduce((acc, curr) => acc + curr.game.price, 0)

  const pixKeyString = `00020126580014BR.GOV.BCB.PIX0136gameshop-${Date.now()}520400005303986540${finalTotal.toFixed(2)}5802BR5916GameShop Pay S.A.6009Sao Paulo62070503***6304`

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKeyString)
    setCopiedPix(true)
    setTimeout(() => setCopiedPix(false), 2500)
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2500)
  }

  const handleExecutePayment = () => {
    if (method === 'credit_card') {
      if (!cardNumber.trim() || !cardHolder.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
        setCardError('Por favor, preencha todos os dados do cartão de crédito.')
        return
      }
      setCardError(null)
    }

    setIsProcessing(true)

    setTimeout(() => {
      const res = completeCheckout(method)
      setIsProcessing(false)
      if (res.success && res.order) {
        setCompletedOrder(res.order)
      }
    }, 1200)
  }

  const formatPixTimer = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={() => {
          if (!isProcessing) setIsCheckoutOpen(false)
        }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-gray-800 bg-gray-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {completedOrder ? 'Comprovante de Compra' : 'Pagamento Seguro — GameShop Pay'}
              </h2>
              <p className="text-[11px] text-gray-400">Entrega imediata na sua biblioteca</p>
            </div>
          </div>

          {!isProcessing && (
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TELA DE SUCESSO / COMPROVANTE */}
          {completedOrder ? (
            <div className="space-y-6 text-center animate-fadeIn py-2">
              <div className="w-16 h-16 bg-emerald-950 border-2 border-emerald-500 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/30">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">Pagamento Confirmado!</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                  Os títulos foram vinculados com sucesso à biblioteca digital e estão prontos para jogar.
                </p>
              </div>

              {/* Box de Recibo Estilizado */}
              <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5 text-left space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-500">ID DO PEDIDO:</span>
                  <span className="text-indigo-400 font-bold">{completedOrder.orderId}</span>
                </div>

                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-500">FORMA DE PAGAMENTO:</span>
                  <span className="text-gray-200 uppercase font-bold">
                    {completedOrder.method === 'pix' ? 'PIX Instantâneo' : 'Cartão de Crédito'}
                  </span>
                </div>

                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-500">DATA:</span>
                  <span className="text-gray-300">{completedOrder.purchasedAt}</span>
                </div>

                {/* Chave de Ativação Digital */}
                <div className="bg-gray-900 border border-indigo-900/50 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-sans">CHAVE DIGITAL DE ATIVAÇÃO:</span>
                    <span className="text-sm font-bold text-indigo-300 tracking-wider">
                      {completedOrder.activationKey}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyKey(completedOrder.activationKey)}
                    className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors font-sans"
                  >
                    {copiedKey ? 'Copiado! ✓' : 'Copiar'}
                  </button>
                </div>

                {/* Itens Adquiridos */}
                <div className="pt-2">
                  <span className="text-[11px] text-gray-400 block mb-2 font-sans font-semibold">
                    ITENS ADQUIRIDOS:
                  </span>
                  <div className="space-y-1.5">
                    {completedOrder.items.map(({ game, recipientName }) => (
                      <div key={game.id} className="flex justify-between text-gray-300">
                        <span>
                          • {game.title}{' '}
                          {recipientName && (
                            <span className="text-emerald-400 font-sans text-[11px]">
                              [Presente para {recipientName}]
                            </span>
                          )}
                        </span>
                        <span>R$ {game.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between border-t border-gray-800 pt-3 text-sm font-bold text-white">
                  <span>TOTAL PAGO:</span>
                  <span className="text-emerald-400">R$ {completedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Ações pós compra */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsCheckoutOpen(false)
                    navigate('/library')
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/30 text-sm"
                >
                  Abrir Minha Biblioteca de Jogos
                </button>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          ) : (
            /* ESCOLHA DE MÉTODO & PAGAMENTO */
            <>
              {/* Seleção de Abas: PIX ou Cartão */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod('pix')}
                  className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 font-semibold text-sm transition-all ${
                    method === 'pix'
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950'
                      : 'bg-gray-950/60 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  <span>Pagar via PIX</span>
                  <span className="text-[10px] bg-emerald-900/80 text-emerald-200 px-1.5 py-0.5 rounded font-mono">
                    Instantâneo
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('credit_card')}
                  className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 font-semibold text-sm transition-all ${
                    method === 'credit_card'
                      ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-950'
                      : 'bg-gray-950/60 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  <span>Cartão de Crédito</span>
                  <span className="text-[10px] bg-indigo-900/80 text-indigo-200 px-1.5 py-0.5 rounded font-mono">
                    Até 3x
                  </span>
                </button>
              </div>

              {/* CONTEÚDO DO MÉTODO SELECIONADO */}
              {method === 'pix' ? (
                <div className="bg-gray-950/80 border border-gray-800 rounded-2xl p-6 flex flex-col items-center text-center space-y-4">
                  <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-950/40 border border-amber-800/60 px-3 py-1.5 rounded-full font-mono">
                    <span>⏱ Expira em {formatPixTimer(pixTimeLeft)}</span>
                  </div>

                  {/* QR Code SVG */}
                  <div className="p-4 bg-white rounded-2xl shadow-xl shadow-black/40 inline-block border-4 border-emerald-500/30">
                    <svg className="w-44 h-44 text-gray-900" viewBox="0 0 100 100" fill="currentColor">
                      <rect x="5" y="5" width="25" height="25" rx="3" fill="#090d16" />
                      <rect x="10" y="10" width="15" height="15" rx="2" fill="white" />
                      <rect x="13" y="13" width="9" height="9" rx="1" fill="#059669" />

                      <rect x="70" y="5" width="25" height="25" rx="3" fill="#090d16" />
                      <rect x="75" y="10" width="15" height="15" rx="2" fill="white" />
                      <rect x="78" y="13" width="9" height="9" rx="1" fill="#059669" />

                      <rect x="5" y="70" width="25" height="25" rx="3" fill="#090d16" />
                      <rect x="10" y="75" width="15" height="15" rx="2" fill="white" />
                      <rect x="13" y="78" width="9" height="9" rx="1" fill="#059669" />

                      <rect x="35" y="10" width="6" height="6" fill="#111827" />
                      <rect x="45" y="15" width="6" height="6" fill="#111827" />
                      <rect x="55" y="8" width="6" height="6" fill="#111827" />
                      <rect x="35" y="25" width="6" height="6" fill="#059669" />
                      <rect x="45" y="32" width="6" height="6" fill="#111827" />
                      <rect x="55" y="28" width="6" height="6" fill="#111827" />
                      <rect x="10" y="45" width="6" height="6" fill="#111827" />
                      <rect x="25" y="48" width="6" height="6" fill="#111827" />
                      <rect x="40" y="44" width="8" height="8" rx="2" fill="#059669" />
                      <rect x="55" y="46" width="6" height="6" fill="#111827" />
                      <rect x="70" y="42" width="6" height="6" fill="#111827" />
                      <rect x="85" y="48" width="6" height="6" fill="#111827" />
                      <rect x="35" y="65" width="6" height="6" fill="#111827" />
                      <rect x="48" y="72" width="6" height="6" fill="#059669" />
                      <rect x="60" y="68" width="6" height="6" fill="#111827" />
                      <rect x="75" y="75" width="6" height="6" fill="#111827" />
                      <rect x="85" y="85" width="6" height="6" fill="#111827" />
                    </svg>
                  </div>

                  <p className="text-xs text-gray-400 max-w-sm">
                    Abra o app do seu banco e escaneie o código QR acima ou copie a chave Pix abaixo.
                  </p>

                  {/* Pix Copia e Cola */}
                  <div className="w-full flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-xl p-2">
                    <input
                      type="text"
                      readOnly
                      value={pixKeyString}
                      className="bg-transparent text-gray-400 text-xs font-mono flex-1 truncate px-2 outline-none"
                    />
                    <button
                      onClick={handleCopyPix}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 flex-shrink-0"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>{copiedPix ? 'Copiado!' : 'Copiar Código'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* CARTÃO DE CRÉDITO - CAMPOS EM BRANCO */
                <div className="space-y-6">
                  {/* Mockup Visual do Cartão 3D */}
                  <div className="w-full max-w-sm mx-auto h-48 rounded-2xl p-5 bg-gradient-to-tr from-indigo-950 via-gray-900 to-violet-900 border border-indigo-700/50 shadow-2xl relative flex flex-col justify-between overflow-hidden">
                    <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />

                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-xs font-black tracking-widest text-indigo-400">GAMESHOP BLACK</span>
                      <div className="w-9 h-7 rounded-md bg-amber-400/90 border border-amber-300 shadow-inner flex items-center justify-center">
                        <div className="w-5 h-3 border border-amber-600/60 rounded-sm" />
                      </div>
                    </div>

                    <div className="relative z-10">
                      <span className="text-lg font-mono font-bold tracking-widest text-white drop-shadow">
                        {cardNumber.trim() || '•••• •••• •••• ••••'}
                      </span>
                    </div>

                    <div className="flex items-end justify-between relative z-10 text-[11px] text-gray-300">
                      <div>
                        <span className="text-[9px] text-gray-500 block uppercase">Titular</span>
                        <span className="font-semibold uppercase tracking-wider">
                          {cardHolder.trim() || 'NOME DO TITULAR'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-gray-500 block uppercase">Validade</span>
                        <span className="font-mono font-semibold">
                          {cardExpiry.trim() || 'MM/AA'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {cardError && (
                    <div className="bg-rose-950/60 border border-rose-800 text-rose-300 text-xs p-3 rounded-xl">
                      {cardError}
                    </div>
                  )}

                  {/* Formulário de Dados com Campos em Branco */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        Número do Cartão
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        placeholder="Ex: 4532 0000 1234 5678"
                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        Nome Impresso no Cartão
                      </label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={e => setCardHolder(e.target.value)}
                        placeholder="Nome como exibido no cartão"
                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        Validade (MM/AA)
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        placeholder="MM/AA"
                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value)}
                        placeholder="123"
                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        Opções de Parcelamento
                      </label>
                      <select
                        value={installments}
                        onChange={e => setInstallments(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="1">1x de R$ {finalTotal.toFixed(2)} (Sem Juros)</option>
                        <option value="2">2x de R$ {(finalTotal / 2).toFixed(2)} (Sem Juros)</option>
                        <option value="3">3x de R$ {(finalTotal / 3).toFixed(2)} (Sem Juros)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Botão de Pagamento */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleExecutePayment}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white transition-all shadow-xl flex items-center justify-center gap-2 ${
                    method === 'pix'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950'
                      : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-950'
                  } ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Processando Pagamento...</span>
                    </>
                  ) : method === 'pix' ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Simular Pagamento Instantâneo Pix (R$ {finalTotal.toFixed(2)})</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Confirmar Pagamento de R$ {finalTotal.toFixed(2)} com Cartão</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
