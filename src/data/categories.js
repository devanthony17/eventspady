import {
  MusicCategoryIcon,
  TechnologyCategoryIcon,
  BusinessCategoryIcon,
  FoodDrinkCategoryIcon,
  SportsCategoryIcon,
  ArtsCategoryIcon,
  HealthCategoryIcon,
  EducationCategoryIcon,
  FilmCategoryIcon,
  TravelCategoryIcon,
  GamingCategoryIcon,
  NightlifeCategoryIcon,
} from '@components/icons/CategoryIcons'

/**
 * Predefined categories — mirrors the platform category list.
 * `icon` is a custom modern multi-layer SVG component with depth and vibrant gradients.
 */
export const categories = [
  { id: 'music', name: 'Music', icon: MusicCategoryIcon, image: '/images/categories/music.svg', count: 2, color: 'from-fuchsia-500 to-purple-600' },
  { id: 'nightlife', name: 'Nightlife', icon: NightlifeCategoryIcon, image: '/images/categories/nightlife.svg', count: 2, color: 'from-indigo-600 to-purple-900' },
  { id: 'arts', name: 'Performing & Visual Arts', icon: ArtsCategoryIcon, image: '/images/categories/arts.svg', count: 2, color: 'from-rose-500 to-pink-700' },
  { id: 'travel', name: 'Holidays', icon: TravelCategoryIcon, image: '/images/categories/travel.svg', count: 2, color: 'from-cyan-500 to-blue-700' },
  { id: 'health', name: 'Dating', icon: HealthCategoryIcon, image: '/images/categories/health.svg', count: 2, color: 'from-lime-500 to-emerald-700' },
  { id: 'gaming', name: 'Hobbies', icon: GamingCategoryIcon, image: '/images/categories/gaming.svg', count: 1, color: 'from-purple-600 to-fuchsia-800' },
  { id: 'business', name: 'Business', icon: BusinessCategoryIcon, image: '/images/categories/business.svg', count: 1, color: 'from-blue-600 to-slate-900' },
  { id: 'food-drink', name: 'Food & Drink', icon: FoodDrinkCategoryIcon, image: '/images/categories/food-drink.svg', count: 1, color: 'from-orange-500 to-red-600' },
  { id: 'sports', name: 'Sports', icon: SportsCategoryIcon, image: '/images/categories/sports.svg', count: 2, color: 'from-emerald-500 to-teal-700' },
  { id: 'technology', name: 'Technology', icon: TechnologyCategoryIcon, image: '/images/categories/technology.svg', count: 1, color: 'from-sky-500 to-indigo-600' },
  { id: 'education', name: 'Education', icon: EducationCategoryIcon, image: '/images/categories/education.svg', count: 1, color: 'from-blue-500 to-cyan-700' },
  { id: 'film', name: 'Film & Media', icon: FilmCategoryIcon, image: '/images/categories/film.svg', count: 1, color: 'from-violet-600 to-indigo-900' },
]

export const getCategory = (id) => categories.find((c) => c.id === id)
