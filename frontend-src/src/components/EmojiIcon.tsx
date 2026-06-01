import {
  Banknote, Building2, PiggyBank, BookOpen, Home, TrendingUp,
  CreditCard, Briefcase, Brain, Crown, Flame, Star, Sparkles,
  CheckCircle, Trophy, Heart, Zap, Shield, Moon, Medal, Gem,
  Award, Feather, type LucideIcon,
} from 'lucide-react'

const MAP: Record<string, LucideIcon> = {
  // Modules
  '💰': Banknote,
  '🏦': Building2,
  '🐷': PiggyBank,
  '📒': BookOpen,
  '🏠': Home,
  '📈': TrendingUp,
  '💳': CreditCard,
  '🏢': Briefcase,
  '🧠': Brain,
  '👑': Crown,
  // Achievements
  '🎉': Award,
  '🔥': Flame,
  '⭐': Star,
  '🌟': Sparkles,
  '💯': CheckCircle,
  '🏆': Trophy,
  // Shop
  '❤️': Heart,
  '⚡': Zap,
  '🔒': Shield,
  '🦅': Feather,
  '🌙': Moon,
  // Leagues
  '🥉': Medal,
  '🥈': Medal,
  '🥇': Medal,
  '💎': Gem,
  '♦️': Gem,
  '💚': Gem,
  '💜': Gem,
  '🤍': Gem,
  '🖤': Gem,
}

interface EmojiIconProps {
  emoji: string
  size?: number
  color?: string
  className?: string
}

export function EmojiIcon({ emoji, size = 20, color, className }: EmojiIconProps) {
  const Icon = MAP[emoji]
  if (!Icon) return <span style={{ fontSize: size * 0.9 }}>{emoji}</span>
  return <Icon size={size} color={color} className={className} />
}
