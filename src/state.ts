import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Game, Interaction } from './core/Graph'
import type { SeedData } from './io/reader'
import seedRaw from '../data/seed.json'

const seed = seedRaw as SeedData

interface State {
  currentUserId: string | null
  users: User[]
  games: Game[]
  interactions: Interaction[]
  login: (id: string) => void
  loginWithCredentials: (identifier: string, password: string) => { success: boolean; error?: string }
  registerUser: (data: { username: string; displayName: string; password: string }) => {
    success: boolean
    error?: string
  }
  logout: () => void
  buyGame: (gameId: string) => void
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
      games: seed.games,
      interactions: seed.interactions,

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

      logout: () => set({ currentUserId: null }),

      buyGame: (gameId) => {
        const { currentUserId, interactions, users } = get()
        if (!currentUserId) return
        if (interactions.some(i => i.userId === currentUserId && i.gameId === gameId)) return
        set({
          interactions: [
            ...interactions,
            { userId: currentUserId, gameId, purchasedAt: new Date().toISOString().split('T')[0] },
          ],
          users: users.map(u =>
            u.id === currentUserId ? { ...u, library: [...u.library, gameId] } : u
          ),
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
        const { games, interactions, users } = get()
        set({
          games: games.filter(g => g.id !== gameId),
          interactions: interactions.filter(i => i.gameId !== gameId),
          users: users.map(u => ({ ...u, library: u.library.filter(id => id !== gameId) })),
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
    { name: 'gameshop' }
  )
)
