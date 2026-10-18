import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Game, Interaction, CartItem, Review } from './core/Graph'
import type { SeedData } from './io/reader'
import seedRaw from '../data/seed.json'

const seed = seedRaw as SeedData

// Jogos padrão limpos, com preços originais e capas
const STANDARD_GAMES: Game[] = seed.games.map(game => {
  if (game.id === 'g1') {
    return {
      ...game,
      tagline: 'Vencedor do Jogo do Ano pela FromSoftware',
      bannerCover: '/covers/elden-ring.jpg',
    }
  }
  if (game.id === 'g3') {
    return {
      ...game,
      tagline: 'Explore a megalópole futurista de Night City',
      bannerCover: '/covers/cyberpunk.jpg',
    }
  }
  if (game.id === 'g2') {
    return {
      ...game,
      tagline: 'O aclamado roguelike de ação da Supergiant Games',
      bannerCover: '/covers/hades2.jpg',
    }
  }
  if (game.id === 'g4') {
    return {
      ...game,
      tagline: 'A jornada lendária do bruxo Geralt de Rívia',
      bannerCover: '/covers/witcher3.jpg',
    }
  }
  if (game.id === 'g5') {
    return {
      ...game,
      tagline: 'Um dos maiores sucessos da história dos videogames',
      bannerCover: '/covers/gta5.jpg',
    }
  }
  return game
})

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    gameId: 'g1', // Elden Ring
    userId: 'u2', // Fillipy
    recommended: true,
    hoursPlayed: 142,
    content: 'Obra-prima absoluta da FromSoftware. O design de mundo aberto é incomparável e o combate é desafiador na medida certa.',
    createdAt: '2026-03-15',
    helpfulVotedBy: ['u1', 'u3', 'u4'],
  },
  {
    id: 'rev-2',
    gameId: 'g1', // Elden Ring
    userId: 'u5', // João Pedro
    recommended: true,
    hoursPlayed: 88,
    content: 'História riquíssima e chefes memoráveis. Recomendo jogar com paciência e explorar cada cantinho do mapa.',
    createdAt: '2026-04-02',
    helpfulVotedBy: ['u2'],
  },
  {
    id: 'rev-3',
    gameId: 'g3', // Cyberpunk 2077
    userId: 'u1', // Caio
    recommended: true,
    hoursPlayed: 95,
    content: 'Night City é uma das cidades mais vivas e imersivas já feitas nos games. A trilha sonora e os gráficos no Ultra são de outro planeta.',
    createdAt: '2026-02-18',
    helpfulVotedBy: ['u2', 'u5'],
  },
  {
    id: 'rev-4',
    gameId: 'g2', // Hades II
    userId: 'u4', // Maria
    recommended: true,
    hoursPlayed: 64,
    content: 'Superou o primeiro em tudo! Melinoë tem mecânicas de feitiçaria muito satisfatórias e a dublagem é impecável.',
    createdAt: '2026-05-10',
    helpfulVotedBy: ['u1', 'u3'],
  },
  {
    id: 'rev-5',
    gameId: 'g4', // The Witcher 3
    userId: 'u3', // Leonardo
    recommended: true,
    hoursPlayed: 210,
    content: 'O melhor RPG da última década. As missões secundárias têm mais profundidade narrativa do que a campanha inteira de outros jogos.',
    createdAt: '2026-01-20',
    helpfulVotedBy: ['u1', 'u2', 'u6'],
  },
  {
    id: 'rev-6',
    gameId: 'g5', // GTA V
    userId: 'u2', // Fillipy
    recommended: true,
    hoursPlayed: 320,
    content: 'Clássico atemporal. Modo história excelente e o online com amigos garante centenas de horas de diversão.',
    createdAt: '2026-02-01',
    helpfulVotedBy: ['u5'],
  },
]

export interface OrderReceipt {
  orderId: string
  items: { game: Game; recipientName?: string }[]
  total: number
  method: 'pix' | 'credit_card'
  activationKey: string
  purchasedAt: string
}

interface State {
  currentUserId: string | null
  users: User[]
  games: Game[]
  interactions: Interaction[]
  reviews: Review[]
  cart: CartItem[]
  isCartOpen: boolean
  isCheckoutOpen: boolean
  lastOrder: OrderReceipt | null

  // Sessão & Usuários
  login: (id: string) => void
  loginWithCredentials: (identifier: string, password: string) => { success: boolean; error?: string }
  registerUser: (data: { username: string; displayName: string; password: string }) => {
    success: boolean
    error?: string
  }
  logout: () => void

  // E-commerce & Carrinho
  addToCart: (gameId: string, recipientUserId?: string) => void
  removeFromCart: (gameId: string) => void
  setCartRecipient: (gameId: string, recipientUserId?: string) => void
  clearCart: () => void
  setIsCartOpen: (open: boolean) => void
  setIsCheckoutOpen: (open: boolean) => void
  completeCheckout: (method: 'pix' | 'credit_card') => { success: boolean; order?: OrderReceipt }
  startDirectCheckout: (gameId: string) => void
  buyGame: (gameId: string) => void

  // Avaliações & Reviews
  addReview: (review: Omit<Review, 'id' | 'createdAt' | 'helpfulVotedBy'>) => void
  toggleReviewHelpful: (reviewId: string) => void

  // Social & Admin
  addFriend: (targetId: string) => void
  removeFriend: (targetId: string) => void
  addGame: (game: Omit<Game, 'id'>) => void
  deleteGame: (gameId: string) => void
  generateRandom: () => void
  resetData: () => void
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      currentUserId: null,
      users: seed.users,
      games: STANDARD_GAMES,
      interactions: seed.interactions,
      reviews: INITIAL_REVIEWS,
      cart: [],
      isCartOpen: false,
      isCheckoutOpen: false,
      lastOrder: null,

      login: (id) => set({ currentUserId: id }),

      loginWithCredentials: (identifier: string, password: string) => {
        const { users } = get()
        const cleanId = identifier.trim().toLowerCase()
        if (!cleanId) {
          return { success: false, error: 'Por favor, informe seu usuário ou e-mail.' }
        }
        if (!password) {
          return { success: false, error: 'Por favor, informe sua senha.' }
        }

        const found = users.find(
          u =>
            u.username.toLowerCase() === cleanId ||
            u.displayName.toLowerCase() === cleanId ||
            u.id.toLowerCase() === cleanId
        )

        if (!found) {
          return {
            success: false,
            error: 'Usuário não encontrado.',
          }
        }

        const userPassword = found.password || 'admin123'
        if (password !== userPassword) {
          return {
            success: false,
            error: 'Senha incorreta.',
          }
        }

        set({ currentUserId: found.id })
        return { success: true }
      },

      registerUser: ({ username, displayName, password }) => {
        const { users } = get()
        const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
        const cleanDisplayName = displayName.trim()
        const cleanPassword = password.trim()

        if (!cleanDisplayName) {
          return { success: false, error: 'Por favor, informe seu nome de exibição.' }
        }
        if (!cleanUsername || cleanUsername.length < 3) {
          return {
            success: false,
            error: 'O nome de usuário deve ter no mínimo 3 caracteres (apenas letras, números e underline).',
          }
        }
        if (!cleanPassword || cleanPassword.length < 4) {
          return { success: false, error: 'A senha deve conter no mínimo 4 caracteres.' }
        }

        const exists = users.some(u => u.username.toLowerCase() === cleanUsername)
        if (exists) {
          return { success: false, error: 'Este nome de usuário já está em uso.' }
        }

        const newUser: User = {
          id: `u${Date.now()}`,
          username: cleanUsername,
          displayName: cleanDisplayName,
          avatar: '',
          friends: [],
          library: [],
          password: cleanPassword,
        }

        set({
          users: [...users, newUser],
          currentUserId: newUser.id,
        })

        return { success: true }
      },

      logout: () => set({ currentUserId: null, cart: [], isCartOpen: false, isCheckoutOpen: false }),

      // Carrinho
      addToCart: (gameId, recipientUserId) => {
        const { cart } = get()
        if (cart.some(item => item.gameId === gameId)) {
          set({ isCartOpen: true })
          return
        }
        set({
          cart: [...cart, { gameId, recipientUserId }],
          isCartOpen: true,
        })
      },

      removeFromCart: (gameId) => {
        const { cart } = get()
        set({ cart: cart.filter(item => item.gameId !== gameId) })
      },

      setCartRecipient: (gameId, recipientUserId) => {
        const { cart } = get()
        set({
          cart: cart.map(item =>
            item.gameId === gameId ? { ...item, recipientUserId } : item
          ),
        })
      },

      clearCart: () => set({ cart: [] }),
      setIsCartOpen: (open) => set({ isCartOpen: open }),
      setIsCheckoutOpen: (open) => set({ isCheckoutOpen: open }),

      // Compra direta: coloca o jogo no carrinho e abre diretamente o modal de pagamento
      startDirectCheckout: (gameId: string) => {
        const { cart, currentUserId, users } = get()
        const user = users.find(u => u.id === currentUserId)
        if (user?.library.includes(gameId)) return

        const inCart = cart.some(i => i.gameId === gameId)
        const updatedCart = inCart ? cart : [...cart, { gameId }]

        set({
          cart: updatedCart,
          isCartOpen: false,
          isCheckoutOpen: true,
        })
      },

      completeCheckout: (method) => {
        const { currentUserId, cart, games, users, interactions } = get()
        if (!currentUserId || cart.length === 0) return { success: false }

        const cartGames = cart
          .map(item => ({
            game: games.find(g => g.id === item.gameId)!,
            recipientUserId: item.recipientUserId,
          }))
          .filter(item => Boolean(item.game))

        const finalTotal = cartGames.reduce((acc, curr) => acc + curr.game.price, 0)
        const orderId = `GS-${Math.floor(100000 + Math.random() * 900000)}`
        const dateStr = new Date().toISOString().split('T')[0]

        // Atualiza a biblioteca de quem comprou ou do amigo presenteado
        let updatedUsers = [...users]
        const newInteractions: Interaction[] = []

        cartGames.forEach(({ game, recipientUserId }) => {
          const targetUserId = recipientUserId || currentUserId
          updatedUsers = updatedUsers.map(u => {
            if (u.id === targetUserId && !u.library.includes(game.id)) {
              return { ...u, library: [...u.library, game.id] }
            }
            return u
          })
          newInteractions.push({
            userId: targetUserId,
            gameId: game.id,
            purchasedAt: dateStr,
          })
        })

        const receipt: OrderReceipt = {
          orderId,
          items: cartGames.map(({ game, recipientUserId }) => {
            const recipient = recipientUserId
              ? users.find(u => u.id === recipientUserId)?.displayName
              : undefined
            return { game, recipientName: recipient }
          }),
          total: finalTotal,
          method,
          activationKey: `${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          purchasedAt: new Date().toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        }

        set({
          users: updatedUsers,
          interactions: [...interactions, ...newInteractions],
          cart: [],
          lastOrder: receipt,
        })

        return { success: true, order: receipt }
      },

      buyGame: (gameId) => {
        // Redireciona para o checkout seguro em vez de ignorar o pagamento
        get().startDirectCheckout(gameId)
      },

      // Reviews
      addReview: (reviewData) => {
        const { currentUserId, reviews, users } = get()
        if (!currentUserId) return

        // Validação estrita: somente proprietários do jogo podem avaliar
        const currentUser = users.find(u => u.id === currentUserId)
        if (!currentUser?.library.includes(reviewData.gameId)) return

        const existingIndex = reviews.findIndex(
          r => r.gameId === reviewData.gameId && r.userId === currentUserId
        )

        const newReview: Review = {
          id: `rev-${Date.now()}`,
          ...reviewData,
          userId: currentUserId,
          createdAt: new Date().toISOString().split('T')[0],
          helpfulVotedBy: [],
        }

        if (existingIndex >= 0) {
          const updated = [...reviews]
          updated[existingIndex] = newReview
          set({ reviews: updated })
        } else {
          set({ reviews: [newReview, ...reviews] })
        }
      },

      toggleReviewHelpful: (reviewId) => {
        const { currentUserId, reviews } = get()
        if (!currentUserId) return
        set({
          reviews: reviews.map(r => {
            if (r.id !== reviewId) return r
            const hasVoted = r.helpfulVotedBy.includes(currentUserId)
            return {
              ...r,
              helpfulVotedBy: hasVoted
                ? r.helpfulVotedBy.filter(id => id !== currentUserId)
                : [...r.helpfulVotedBy, currentUserId],
            }
          }),
        })
      },

      addFriend: (targetId) => {
        const { currentUserId, users } = get()
        if (!currentUserId || currentUserId === targetId) return
        set({
          users: users.map(u => {
            if (u.id === currentUserId && !u.friends.includes(targetId))
              return { ...u, friends: [...u.friends, targetId] }
            if (u.id === targetId && !u.friends.includes(currentUserId))
              return { ...u, friends: [...u.friends, currentUserId] }
            return u
          }),
        })
      },

      removeFriend: (targetId) => {
        const { currentUserId, users } = get()
        if (!currentUserId || currentUserId === targetId) return
        set({
          users: users.map(u => {
            if (u.id === currentUserId)
              return { ...u, friends: u.friends.filter(id => id !== targetId) }
            if (u.id === targetId)
              return { ...u, friends: u.friends.filter(id => id !== currentUserId) }
            return u
          }),
        })
      },

      addGame: (gameData) => {
        const { games } = get()
        set({ games: [...games, { ...gameData, id: `g${Date.now()}` }] })
      },

      deleteGame: (gameId) => {
        const { games, interactions, users, cart, reviews } = get()
        set({
          games: games.filter(g => g.id !== gameId),
          interactions: interactions.filter(i => i.gameId !== gameId),
          users: users.map(u => ({ ...u, library: u.library.filter(id => id !== gameId) })),
          cart: cart.filter(item => item.gameId !== gameId),
          reviews: reviews.filter(r => r.gameId !== gameId),
        })
      },

      generateRandom: () => {
        const { users, games, interactions } = get()

        const updatedUsers = users.map(user => {
          const candidates = users.filter(u => u.id !== user.id && !user.friends.includes(u.id))
          const toAdd = candidates
            .sort(() => Math.random() - 0.5)
            .slice(0, Math.floor(Math.random() * 3))
            .map(u => u.id)
          return { ...user, friends: [...user.friends, ...toAdd] }
        })

        const newInteractions: Interaction[] = []
        for (const user of updatedUsers) {
          const unowned = games.filter(
            g => !user.library.includes(g.id) && !interactions.some(i => i.userId === user.id && i.gameId === g.id)
          )
          const toAdd = unowned.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3))
          for (const game of toAdd) {
            newInteractions.push({
              userId: user.id,
              gameId: game.id,
              purchasedAt: new Date().toISOString().split('T')[0],
            })
          }
        }

        set({
          users: updatedUsers,
          interactions: [...interactions, ...newInteractions],
        })
      },

      resetData: () => {
        localStorage.removeItem('gameshop')
        window.location.reload()
      },
    }),
    {
      name: 'gameshop',
      merge: (persistedState: unknown, currentState: State): State => {
        const persisted = (persistedState as Partial<State>) || {}
        const existingGames = persisted.games || []
        const existingGameIds = new Set(existingGames.map(g => g.id))
        const missingGames = STANDARD_GAMES.filter(g => !existingGameIds.has(g.id))
        const mergedGames = [...existingGames, ...missingGames].map(g => {
          const std = STANDARD_GAMES.find(sg => sg.id === g.id)
          return std ? { ...g, tagline: std.tagline, bannerCover: std.bannerCover } : g
        })

        const existingInteractions = persisted.interactions || []
        const existingInterKey = new Set(existingInteractions.map(i => `${i.userId}_${i.gameId}`))
        const missingInteractions = seed.interactions.filter(
          i => !existingInterKey.has(`${i.userId}_${i.gameId}`)
        )
        const mergedInteractions = [...existingInteractions, ...missingInteractions]

        const persistedUsers = persisted.users || currentState.users
        const mergedUsers = persistedUsers.map(u => {
          const seedUser = seed.users.find(su => su.id === u.id)
          if (!seedUser) return u
          const combinedLib = Array.from(new Set([...u.library, ...seedUser.library]))
          return { ...u, library: combinedLib }
        })

        const mergedReviews = persisted.reviews && persisted.reviews.length > 0
          ? persisted.reviews
          : INITIAL_REVIEWS

        return {
          ...currentState,
          ...persisted,
          users: mergedUsers,
          games: mergedGames,
          interactions: mergedInteractions,
          reviews: mergedReviews,
          cart: persisted.cart || [],
          isCartOpen: false,
          isCheckoutOpen: false,
        }
      },
    }
  )
)
