export interface Question {
  type: 'mc' | 'tf' | 'fill'
  q: string
  opts?: string[]
  a: number | boolean
  explanation?: string
}

export interface Lesson {
  id: string
  title: string
  icon?: string
  questions: Question[]
}

export interface Module {
  id: number
  emoji: string
  title: string
  color: string
  mascotImage?: string
  lessons: Lesson[]
}

export interface Achievement {
  id: string
  emoji: string
  title: string
  desc: string
  xp: number
}

export interface League {
  id: string
  name: string
  emoji: string
  minXp: number
  color: string
}

export interface ShopItem {
  id: string
  emoji: string
  title: string
  desc: string
  price: number
}

export interface UserState {
  xp: number
  gems: number
  hearts: number
  streak: number
  lastActiveDate: string | null
  completedLessons: string[]
  perfectLessons: string[]
  ownedShop: string[]
  achievements: string[]
  boostExpiresAt: number | null
  settings: { sound: boolean; animations: boolean }
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: string
  state: UserState
}

export interface LeaderboardEntry {
  id: string
  name: string
  avatar?: string
  xp: number
  streak: number
  completed: number
}

export interface Content {
  modules: Module[]
  achievements: Achievement[]
  leagues: League[]
  shop_items: ShopItem[]
}
