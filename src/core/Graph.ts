export interface User {
  id: string
  username: string
  displayName: string
  avatar: string
  friends: string[]
  library: string[]
  password?: string
}

export interface Game {
  id: string
  title: string
  category: string
  description: string
  cover: string
  price: number
  tagline?: string
  bannerCover?: string
}

export interface Interaction {
  userId: string
  gameId: string
  purchasedAt: string
}

export interface CartItem {
  gameId: string
  recipientUserId?: string
}

export interface Review {
  id: string
  gameId: string
  userId: string
  recommended: boolean
  hoursPlayed: number
  content: string
  createdAt: string
  helpfulVotedBy: string[]
}

export class Graph {
  private adj: Map<string, Set<string>> = new Map()

  addVertex(v: string) {
    if (!this.adj.has(v)) this.adj.set(v, new Set())
  }

  addEdge(from: string, to: string, directed = false) {
    this.addVertex(from)
    this.addVertex(to)
    this.adj.get(from)!.add(to)
    if (!directed) this.adj.get(to)!.add(from)
  }

  neighbors(v: string): string[] {
    return Array.from(this.adj.get(v) ?? [])
  }

  hasEdge(from: string, to: string): boolean {
    return this.adj.get(from)?.has(to) ?? false
  }

  vertices(): string[] {
    return Array.from(this.adj.keys())
  }

  size(): number {
    return this.adj.size
  }
}
