import React from 'react'

/**
 * Clean, elegant minimalist line-art category icons matching the circular badge aesthetic.
 * All icons rendered at 48x48 viewBox with crisp 1.6px strokes.
 */

export function MusicCategoryIcon({ className = 'size-9' }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <g transform="rotate(-42 24 24)">
        {/* Dome capsule */}
        <path d="M19 17C19 12 21.2 9.5 24 9.5C26.8 9.5 29 12 29 17Z" />
        {/* Mesh grid inside dome */}
        <path d="M19.5 14H28.5" />
        <path d="M24 9.5V17" />
        <path d="M21.5 11.2C22 13 22 15 22 17" />
        <path d="M26.5 11.2C26 13 26 15 26 17" />
        {/* Collar band */}
        <path d="M18 17.5H30" strokeWidth="2.2" />
        {/* Tapered handle */}
        <path d="M20.5 18.5L22 32H26L27.5 18.5" />
        {/* Base connector */}
        <path d="M21.5 32H26.5" strokeWidth="2" />
        {/* Cord tail */}
        <path d="M24 33V36C24 38.5 26 39.5 25.5 42" strokeWidth="1.5" />
      </g>
    </svg>
  )
}

export function NightlifeCategoryIcon({ className = 'size-9' }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {/* Hanging chain / wire */}
      <path d="M24 5V14" strokeWidth="1.5" />
      {/* Disco ball main circle */}
      <circle cx="24" cy="27" r="13" />
      {/* Horizontal latitude curves */}
      <path d="M11.5 24C15 26 33 26 36.5 24" />
      <path d="M11.5 30C15 32 33 32 36.5 30" />
      <path d="M14 19C17 21 31 21 34 19" />
      <path d="M14 35C17 37 31 37 34 35" />
      {/* Vertical longitude lines */}
      <path d="M24 14V40" />
      <path d="M18 15.5C19.5 20 19.5 34 18 38.5" />
      <path d="M30 15.5C28.5 20 28.5 34 30 38.5" />
      {/* 4-point star sparkles */}
      <path d="M10 14L10.7 16.3L13 17L10.7 17.7L10 20L9.3 17.7L7 17L9.3 16.3L10 14Z" fill="currentColor" stroke="none" />
      <circle cx="8" cy="27" r="1" fill="currentColor" stroke="none" />
      <path d="M38 15L38.7 17.3L41 18L38.7 18.7L38 21L37.3 18.7L35 18L37.3 17.3L38 15Z" fill="currentColor" stroke="none" />
      <circle cx="40" cy="28" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function ArtsCategoryIcon({ className = 'size-9' }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {/* Left mask (Comedy - smiling) */}
      <path d="M19 11C13.5 11 10 15 10 20.5C10 26.5 14 31 19 31C21 31 23 30 24 28.5C23.5 26.5 23.5 24 24 22C24.5 17 23 11 19 11Z" />
      {/* Comedy eyes (happy arches) */}
      <path d="M13 18C13.8 16.8 15.2 16.8 16 18" />
      <path d="M18 18C18.8 16.8 20.2 16.8 21 18" />
      {/* Comedy smile */}
      <path d="M13.5 23.5C14.5 26 18.5 26 19.5 23.5" />
      <path d="M13 23.5H20" />
      
      {/* Right mask (Tragedy - frowning) */}
      <path d="M29 17C24.5 17 22.5 20.5 22.5 25.5C22.5 31.5 26 36 31 36C36 36 39 31.5 39 25.5C39 19.5 35 17 29 17Z" />
      {/* Tragedy eyes */}
      <circle cx="26.5" cy="23.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="33.5" cy="23.5" r="1.2" fill="currentColor" stroke="none" />
      {/* Tragedy mouth */}
      <path d="M26.5 31C28 28.8 32 28.8 33.5 31" />
    </svg>
  )
}

export function TravelCategoryIcon({ className = 'size-9' }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {/* Calendar body */}
      <rect x="12" y="13" width="24" height="26" rx="3.5" />
      {/* Top binding line */}
      <path d="M12 21H36" />
      {/* Binding rings at top */}
      <path d="M18 9V14" strokeWidth="2" />
      <path d="M24 9V14" strokeWidth="2" />
      <path d="M30 9V14" strokeWidth="2" />
      {/* Perforation dots / dashed header */}
      <path d="M16 17H17M20 17H21M24 17H25M28 17H29M32 17H33" strokeWidth="1.5" />
      {/* Sun inside calendar */}
      <circle cx="24" cy="30" r="4.5" />
      {/* Sun rays */}
      <path d="M24 22.5V24" />
      <path d="M24 36V37.5" />
      <path d="M16.5 30H18" />
      <path d="M30 30H31.5" />
      <path d="M18.7 24.7L19.8 25.8" />
      <path d="M28.2 34.2L29.3 35.3" />
      <path d="M18.7 35.3L19.8 34.2" />
      <path d="M28.2 25.8L29.3 24.7" />
    </svg>
  )
}

export function HealthCategoryIcon({ className = 'size-9' }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {/* Back speech bubble */}
      <path d="M25 15H35C36.66 15 38 16.34 38 18V28C38 29.66 36.66 31 35 31H34V35L29.5 31H26" />
      {/* Front speech bubble */}
      <path d="M13 14H27C28.66 14 30 15.34 30 17V26C30 27.66 28.66 29 27 29H18L13 33V29C11.34 29 10 27.66 10 26V17C10 15.34 11.34 14 13 14Z" />
      {/* Heart inside front bubble */}
      <path d="M20 23.5C20 23.5 15.5 20.5 15.5 18C15.5 16.5 16.7 15.5 18 15.5C19 15.5 19.6 16 20 16.6C20.4 16 21 15.5 22 15.5C23.3 15.5 24.5 16.5 24.5 18C24.5 20.5 20 23.5 20 23.5Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export function GamingCategoryIcon({ className = 'size-9' }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {/* Top cord loop */}
      <path d="M24 20C24 16 26 12 24 9C23 7.5 21 8 20.5 9.5" />
      {/* Controller body */}
      <path d="M16 20H32C36.5 20 40 23.5 40 28C40 33 35.5 39 31 39C28.5 39 27 35.5 25 35.5H23C21 35.5 19.5 39 17 39C12.5 39 8 33 8 28C8 23.5 11.5 20 16 20Z" />
      {/* D-pad on left */}
      <path d="M13 28H19M16 25V31" strokeWidth="1.8" />
      {/* Action buttons on right */}
      <circle cx="31" cy="26" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="35" cy="28" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="31" cy="30" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="27" cy="28" r="1.3" fill="currentColor" stroke="none" />
      {/* Center grip lines */}
      <path d="M22 28H23M25 28H26" strokeWidth="1.2" />
    </svg>
  )
}

export function BusinessCategoryIcon({ className = 'size-9' }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {/* Presentation board */}
      <rect x="13" y="11" width="22" height="17" rx="2" />
      {/* Top clip */}
      <path d="M21 9H27V11H21V9Z" />
      {/* Content inside board */}
      <rect x="16" y="15" width="6" height="9" rx="1" />
      <path d="M19 18V21" />
      {/* Horizontal bullet text lines */}
      <path d="M25 16H31" />
      <path d="M25 19.5H30" />
      <path d="M25 23H28" />
      {/* Tripod legs */}
      <path d="M17 28L13 40" />
      <path d="M31 28L35 40" />
      <path d="M24 28V38" />
      {/* Bottom marker tray */}
      <path d="M15 28H33" strokeWidth="2" />
    </svg>
  )
}

export function FoodDrinkCategoryIcon({ className = 'size-9' }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {/* Pizza Slice on left */}
      <path d="M11 25C13.5 24 19 23.5 22 25L17 38L11 25Z" />
      {/* Crust top curve */}
      <path d="M10 24C13 22.8 19.5 22.3 23 24" strokeWidth="2" />
      {/* Pepperonis */}
      <circle cx="15.5" cy="27.5" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="18.5" cy="30.5" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="16" cy="33.5" r="1.1" fill="currentColor" stroke="none" />

      {/* Drink Cup on right */}
      <path d="M25 24H35L33.5 38H26.5L25 24Z" />
      {/* Lid */}
      <path d="M24 24H36" strokeWidth="2" />
      <path d="M27 22H33V24H27V22Z" />
      {/* Bent straw */}
      <path d="M30 22V14L34 11" strokeWidth="1.8" />
      {/* Cup decorative line */}
      <path d="M26 29H34" />
    </svg>
  )
}

export function SportsCategoryIcon({ className = 'size-9' }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {/* Classic soccer ball */}
      <circle cx="24" cy="24" r="14" />
      {/* Center pentagon */}
      <path d="M24 19L28 22L26.5 26.5H21.5L20 22L24 19Z" />
      {/* Seam lines to outer circle */}
      <path d="M24 19V10" />
      <path d="M28 22L36 18" />
      <path d="M26.5 26.5L34 33" />
      <path d="M21.5 26.5L14 33" />
      <path d="M20 22L12 18" />
      {/* Motion swoosh */}
      <path d="M8 38C12 41 18 42 24 42" strokeWidth="1.4" strokeDasharray="2 3" />
    </svg>
  )
}

export function TechnologyCategoryIcon({ className = 'size-9' }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {/* Desktop monitor screen */}
      <rect x="10" y="12" width="28" height="19" rx="2.5" />
      {/* Monitor stand & base */}
      <path d="M24 31V37" strokeWidth="2" />
      <path d="M17 37H31" strokeWidth="2" />
      {/* Code bracket glyphs inside */}
      <path d="M18 18L15 21.5L18 25" />
      <path d="M30 18L33 21.5L30 25" />
      <path d="M26 17L22 26" strokeWidth="1.5" />
    </svg>
  )
}

export function EducationCategoryIcon({ className = 'size-9' }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {/* Mortarboard cap top diamond */}
      <path d="M24 11L9 19L24 27L39 19L24 11Z" />
      {/* Skull cap underlayer */}
      <path d="M15 22.5V30C15 34 19 37 24 37C29 37 33 34 33 30V22.5" />
      {/* Tassel */}
      <path d="M34 20V29L36 32" strokeWidth="1.5" />
      <circle cx="36" cy="33" r="1.5" fill="currentColor" stroke="none" />
      {/* Open book at bottom */}
      <path d="M14 37C18 35 22 36 24 37C26 36 30 35 34 37V41C30 39 26 40 24 41C22 40 18 39 14 41V37Z" />
    </svg>
  )
}

export function FilmCategoryIcon({ className = 'size-9' }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {/* Clapperboard body */}
      <rect x="11" y="22" width="26" height="18" rx="2" />
      {/* Angled top clapper stick */}
      <g transform="rotate(-12 11 22)">
        <rect x="11" y="15" width="26" height="7" rx="1.5" />
        <path d="M15 15L19 22" />
        <path d="M21 15L25 22" />
        <path d="M27 15L31 22" />
      </g>
      {/* Center play triangle */}
      <polygon points="22,28 28,31 22,34" fill="currentColor" stroke="none" />
      {/* Sparkles */}
      <circle cx="40" cy="17" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="38" cy="22" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  )
}

export const CATEGORY_SVG_MAP = {
  music: MusicCategoryIcon,
  nightlife: NightlifeCategoryIcon,
  arts: ArtsCategoryIcon,
  travel: TravelCategoryIcon,
  health: HealthCategoryIcon,
  gaming: GamingCategoryIcon,
  business: BusinessCategoryIcon,
  'food-drink': FoodDrinkCategoryIcon,
  sports: SportsCategoryIcon,
  technology: TechnologyCategoryIcon,
  education: EducationCategoryIcon,
  film: FilmCategoryIcon,
}
