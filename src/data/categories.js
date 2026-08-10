import {
  Music2,
  Cpu,
  Briefcase,
  UtensilsCrossed,
  Trophy,
  Palette,
  HeartPulse,
  GraduationCap,
  Clapperboard,
  Plane,
  Gamepad2,
  Martini,
} from 'lucide-react'

/**
 * Predefined categories — mirrors the admin panel's "Manage Categories" list.
 * `icon` is a lucide component so tiles stay crisp at any size.
 */
export const categories = [
  { id: 'music', name: 'Music', icon: Music2, image: '/images/categories/music.svg', count: 428, color: 'from-fuchsia-500 to-purple-600' },
  { id: 'technology', name: 'Technology', icon: Cpu, image: '/images/categories/technology.svg', count: 312, color: 'from-sky-500 to-indigo-600' },
  { id: 'business', name: 'Business', icon: Briefcase, image: '/images/categories/business.svg', count: 264, color: 'from-slate-600 to-slate-900' },
  { id: 'food-drink', name: 'Food & Drink', icon: UtensilsCrossed, image: '/images/categories/food-drink.svg', count: 197, color: 'from-orange-500 to-red-600' },
  { id: 'sports', name: 'Sports', icon: Trophy, image: '/images/categories/sports.svg', count: 183, color: 'from-emerald-500 to-teal-700' },
  { id: 'arts', name: 'Arts & Culture', icon: Palette, image: '/images/categories/arts.svg', count: 156, color: 'from-rose-500 to-pink-700' },
  { id: 'health', name: 'Health & Wellness', icon: HeartPulse, image: '/images/categories/health.svg', count: 142, color: 'from-lime-500 to-emerald-700' },
  { id: 'education', name: 'Education', icon: GraduationCap, image: '/images/categories/education.svg', count: 128, color: 'from-blue-500 to-cyan-700' },
  { id: 'film', name: 'Film & Media', icon: Clapperboard, image: '/images/categories/film.svg', count: 96, color: 'from-violet-600 to-indigo-900' },
  { id: 'travel', name: 'Travel & Outdoor', icon: Plane, image: '/images/categories/travel.svg', count: 88, color: 'from-cyan-500 to-blue-700' },
  { id: 'gaming', name: 'Gaming & Esports', icon: Gamepad2, image: '/images/categories/gaming.svg', count: 74, color: 'from-purple-600 to-fuchsia-800' },
  { id: 'nightlife', name: 'Nightlife', icon: Martini, image: '/images/categories/nightlife.svg', count: 61, color: 'from-indigo-600 to-purple-900' },
]

export const getCategory = (id) => categories.find((c) => c.id === id)
