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

export interface ShopItem {
  id: string
  emoji: string
  title: string
  desc: string
  price: number
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

export interface AdminUser {
  id: string
  name: string
  email: string
  avatar?: string
  hasPassword: boolean
  createdAt: string
  lastSeenAt: string
  state: {
    xp: number
    gems: number
    hearts: number
    streak: number
    completedLessons: string[]
    perfectLessons: string[]
    achievements: string[]
    ownedShop: string[]
  }
}
