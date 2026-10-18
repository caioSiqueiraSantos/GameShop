import type { Review } from '../core/Graph'

export interface GameSuggestion {
  gameId: string
  score: number
  fromUser: string
  positiveReview?: boolean
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0
  const intersection = [...a].filter(x => b.has(x)).length
  const union = new Set([...a, ...b]).size
  return intersection / union
}

/**
 * Sugere jogos utilizando índice Jaccard ponderado pelas avaliações dos usuários (recomendações positivas/negativas).
 */
export function suggestGames(
  userId: string,
  libraries: Map<string, Set<string>>,
  reviews?: Review[]
): GameSuggestion[] {
  const mine = libraries.get(userId) ?? new Set()
  const best = new Map<string, { score: number; from: string; positiveReview?: boolean }>()

  // Se não houver reviews, executa o Jaccard tradicional baseado apenas em propriedade de biblioteca
  if (!reviews || reviews.length === 0) {
    for (const [otherId, theirs] of libraries) {
      if (otherId === userId) continue
      const sim = jaccard(mine, theirs)
      if (sim === 0) continue

      for (const gameId of theirs) {
        if (mine.has(gameId)) continue
        const current = best.get(gameId)
        if (!current || sim > current.score) {
          best.set(gameId, { score: sim, from: otherId })
        }
      }
    }

    return Array.from(best.entries())
      .map(([gameId, { score, from }]) => ({ gameId, score, fromUser: from }))
      .sort((a, b) => b.score - a.score)
  }

  // Mapeia avaliações por usuário e jogo: Map<`${userId}_${gameId}`, boolean>
  const userGameRating = new Map<string, boolean>()
  const gamePositiveCount = new Map<string, number>()
  const gameNegativeCount = new Map<string, number>()

  for (const r of reviews) {
    userGameRating.set(`${r.userId}_${r.gameId}`, r.recommended)
    if (r.recommended) {
      gamePositiveCount.set(r.gameId, (gamePositiveCount.get(r.gameId) ?? 0) + 1)
    } else {
      gameNegativeCount.set(r.gameId, (gameNegativeCount.get(r.gameId) ?? 0) + 1)
    }
  }

  // Constrói conjunto de afinidade positiva de cada usuário:
  // Jogos na biblioteca excluindo aqueles avaliados negativamente (disliked)
  const userPositiveProfiles = new Map<string, Set<string>>()
  for (const [uId, lib] of libraries) {
    const positiveSet = new Set<string>()
    for (const gId of lib) {
      const isDisliked = userGameRating.get(`${uId}_${gId}`) === false
      if (!isDisliked) {
        positiveSet.add(gId)
      }
    }
    userPositiveProfiles.set(uId, positiveSet)
  }

  const myPositiveProfile = userPositiveProfiles.get(userId) ?? mine

  for (const [otherId, otherLib] of libraries) {
    if (otherId === userId) continue

    const otherPositiveProfile = userPositiveProfiles.get(otherId) ?? otherLib

    // Similaridade Jaccard baseada nos jogos que ambos apreciam
    const sim = jaccard(myPositiveProfile, otherPositiveProfile)
    if (sim === 0) continue

    for (const gameId of otherLib) {
      // Ignora jogos que o usuário atual já possui
      if (mine.has(gameId)) continue

      // CRÍTICO: Se o outro usuário NÃO RECOMENDOU este jogo, não o sugerimos a partir dele!
      const otherReview = userGameRating.get(`${otherId}_${gameId}`)
      if (otherReview === false) {
        continue // Outro usuário avaliou negativamente, portanto descarte a sugestão deste título
      }

      // Se o outro usuário avaliou com recomendação positiva explícita, aplicamos bônus de confiança
      const isExplicitPositive = otherReview === true
      const bonus = isExplicitPositive ? 1.25 : 1.0

      // Considera sentimento global da comunidade
      const pos = gamePositiveCount.get(gameId) ?? 0
      const neg = gameNegativeCount.get(gameId) ?? 0
      const totalReviews = pos + neg
      const communityMultiplier = totalReviews > 0 ? (pos + 1) / (totalReviews + 1) : 1.0

      const finalScore = Math.min(1.0, sim * bonus * communityMultiplier)

      const current = best.get(gameId)
      if (!current || finalScore > current.score) {
        best.set(gameId, { score: finalScore, from: otherId, positiveReview: isExplicitPositive })
      }
    }
  }

  return Array.from(best.entries())
    .map(([gameId, { score, from, positiveReview }]) => ({
      gameId,
      score,
      fromUser: from,
      positiveReview,
    }))
    .sort((a, b) => b.score - a.score)
}
