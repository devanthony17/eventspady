/**
 * Generates every asset referenced from `public/images`.
 * Assets are self-contained SVGs so the app renders with zero external requests.
 *
 *   npm run images
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public', 'images')

/* ---------------------------------------------------------------- helpers */

// Deterministic PRNG so regenerating assets never churns the diff.
function rng(seed) {
  let h = 2166136261
  for (const ch of String(seed)) {
    h ^= ch.charCodeAt(0)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h += 0x6d2b79f5
    let t = h
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Brand anchors — midnight blue primary, warm accent. */
const BRAND = {
  deep: '#0b0b2e',
  midnight: '#191970',
  mid: '#384a9a',
  light: '#6b83cd',
  pale: '#c2cfec',
  accent: '#ff7d11',
}

const PALETTES = [
  [BRAND.midnight, BRAND.light, BRAND.accent],
  ['#0ea5e9', BRAND.mid, '#22d3ee'],
  ['#f43f5e', '#ff9b38', '#ffdaa8'],
  ['#059669', '#34d399', '#a7f3d0'],
  [BRAND.deep, BRAND.midnight, BRAND.accent],
  ['#db2777', BRAND.light, '#fbcfe8'],
  ['#1d4ed8', '#38bdf8', '#c7d2fe'],
  ['#c2410c', '#f59e0b', '#fde68a'],
  ['#312e81', '#818cf8', '#c7d2fe'],
  ['#0f766e', '#2dd4bf', '#99f6e4'],
]

const write = (name, svg) => {
  const file = join(OUT, name)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, svg.trim().replace(/\n\s+/g, '\n'))
  return name
}

const defs = (id, [a, b, c], angle = 135) => `
<defs>
  <linearGradient id="g${id}" gradientTransform="rotate(${angle})">
    <stop offset="0%" stop-color="${a}"/>
    <stop offset="60%" stop-color="${b}"/>
    <stop offset="100%" stop-color="${c}"/>
  </linearGradient>
  <radialGradient id="r${id}" cx="30%" cy="20%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity=".45"/>
    <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
  </radialGradient>
  <filter id="b${id}" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="42"/>
  </filter>
</defs>`

/* ------------------------------------------------------------ art recipes */

function artBlobs(rand, w, h, id) {
  let out = ''
  for (let i = 0; i < 5; i++) {
    const cx = rand() * w
    const cy = rand() * h
    const rx = 90 + rand() * 220
    out += `<ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="${rx.toFixed(0)}" ry="${(rx * 0.72).toFixed(0)}" fill="#fff" opacity="${(0.05 + rand() * 0.12).toFixed(3)}" filter="url(#b${id})"/>`
  }
  return out
}

function artRings(rand, w, h) {
  let out = ''
  const cx = w * (0.25 + rand() * 0.5)
  const cy = h * (0.3 + rand() * 0.4)
  for (let i = 1; i <= 7; i++) {
    out += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${(i * (w / 14)).toFixed(0)}" fill="none" stroke="#fff" stroke-opacity="${(0.22 - i * 0.022).toFixed(3)}" stroke-width="2"/>`
  }
  return out
}

function artWaves(rand, w, h) {
  let out = ''
  for (let i = 0; i < 6; i++) {
    const y = h * (0.25 + i * 0.12)
    const amp = 22 + rand() * 46
    out += `<path d="M -40 ${y.toFixed(0)} Q ${(w * 0.25).toFixed(0)} ${(y - amp).toFixed(0)} ${(w * 0.5).toFixed(0)} ${y.toFixed(0)} T ${(w + 40).toFixed(0)} ${y.toFixed(0)}" fill="none" stroke="#fff" stroke-opacity="${(0.3 - i * 0.035).toFixed(3)}" stroke-width="${(3 - i * 0.3).toFixed(1)}" stroke-linecap="round"/>`
  }
  return out
}

function artConfetti(rand, w, h) {
  let out = ''
  for (let i = 0; i < 46; i++) {
    const x = rand() * w
    const y = rand() * h
    const s = 5 + rand() * 16
    const rot = rand() * 90
    out +=
      rand() > 0.5
        ? `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${s.toFixed(0)}" height="${(s * 0.42).toFixed(0)}" rx="2" fill="#fff" opacity="${(0.1 + rand() * 0.3).toFixed(2)}" transform="rotate(${rot.toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`
        : `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(s * 0.3).toFixed(1)}" fill="#fff" opacity="${(0.1 + rand() * 0.3).toFixed(2)}"/>`
  }
  return out
}

function artGrid(rand, w, h) {
  let out = ''
  const step = 34
  for (let x = step; x < w; x += step) {
    for (let y = step; y < h; y += step) {
      const o = 0.05 + rand() * 0.22
      out += `<circle cx="${x}" cy="${y}" r="${(1.4 + rand() * 2.2).toFixed(1)}" fill="#fff" opacity="${o.toFixed(2)}"/>`
    }
  }
  return out
}

function artArcs(rand, w, h) {
  let out = ''
  for (let i = 0; i < 5; i++) {
    const r = w * (0.2 + i * 0.13)
    out += `<path d="M ${(w * 0.1).toFixed(0)} ${h} A ${r.toFixed(0)} ${r.toFixed(0)} 0 0 1 ${(w * 0.1 + r * 2).toFixed(0)} ${h}" fill="none" stroke="#fff" stroke-opacity="${(0.26 - i * 0.04).toFixed(3)}" stroke-width="2.5"/>`
  }
  return out
}

const RECIPES = [artBlobs, artRings, artWaves, artConfetti, artGrid, artArcs]

/**
 * Abstract cover art. Deterministic per `seed`.
 */
function cover(seed, w = 1200, h = 800) {
  const rand = rng(seed)
  const id = Math.floor(rand() * 100000)
  const palette = PALETTES[Math.floor(rand() * PALETTES.length)]
  const recipe = RECIPES[Math.floor(rand() * RECIPES.length)]
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
${defs(id, palette, Math.floor(rand() * 180))}
<rect width="${w}" height="${h}" fill="url(#g${id})"/>
${artBlobs(rng(seed + 'blob'), w, h, id)}
${recipe(rand, w, h, id)}
<rect width="${w}" height="${h}" fill="url(#r${id})"/>
</svg>`
}

/**
 * Ambient motion backdrop for the hero. CSS animations declared inside the SVG
 * keep running when it is loaded via <img>, so it reads as looping footage
 * until real video files are dropped into `public/videos`.
 */
function motionBackdrop(seed, w = 1920, h = 1080) {
  const rand = rng(seed)
  const id = Math.floor(rand() * 100000)

  // Locked to brand blues so the hero never drifts off-palette.
  const HERO_PALETTES = [
    [BRAND.midnight, BRAND.mid, BRAND.accent],
    ['#1d4ed8', BRAND.midnight, BRAND.light],
    [BRAND.mid, '#0ea5e9', BRAND.accent],
  ]
  const [a, b, c] = HERO_PALETTES[Math.floor(rand() * HERO_PALETTES.length)]

  const orbs = Array.from({ length: 6 }, (_, i) => {
    const cx = rand() * w
    const cy = rand() * h
    const r = 200 + rand() * 340
    const dur = (26 + rand() * 26).toFixed(1)
    const dx = (rand() * 340 - 170).toFixed(0)
    const dy = (rand() * 260 - 130).toFixed(0)
    const fill = [a, b, c, '#ffffff'][i % 4]
    return `<circle class="orb o${i}" cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="${fill}" opacity="${(0.18 + rand() * 0.26).toFixed(2)}" filter="url(#soft${id})">
<animateTransform attributeName="transform" type="translate" values="0 0; ${dx} ${dy}; 0 0" dur="${dur}s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" keyTimes="0; 0.5; 1"/>
</circle>`
  }).join('\n')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" role="img">
<defs>
<linearGradient id="base${id}" gradientTransform="rotate(${Math.floor(rand() * 140)})">
<stop offset="0%" stop-color="${BRAND.deep}"/>
<stop offset="55%" stop-color="${a}"/>
<stop offset="100%" stop-color="${BRAND.deep}"/>
</linearGradient>
<filter id="soft${id}" x="-40%" y="-40%" width="180%" height="180%">
<feGaussianBlur stdDeviation="120"/>
</filter>
<linearGradient id="sweep${id}" x1="0" y1="0" x2="1" y2="0">
<stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
<stop offset="50%" stop-color="#ffffff" stop-opacity=".10"/>
<stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
</defs>
<rect width="${w}" height="${h}" fill="url(#base${id})"/>
${orbs}
<rect width="${(w * 0.55).toFixed(0)}" height="${h}" fill="url(#sweep${id})">
<animate attributeName="x" values="${-w * 0.6};${w};${-w * 0.6}" dur="${(30 + rand() * 14).toFixed(1)}s" repeatCount="indefinite"/>
</rect>
<rect width="${w}" height="${h}" fill="${BRAND.deep}" opacity=".28"/>
</svg>`
}

/* -------------------------------------------------------------- icon mark */

const MARK = (size, fg = '#fff', bg = 'url(#gm)') => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">
<defs><linearGradient id="gm" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="#191970"/><stop offset="100%" stop-color="#ff7d11"/>
</linearGradient></defs>
<rect width="64" height="64" rx="16" fill="${bg}"/>
<path d="M20 21h24a3 3 0 0 1 3 3v5a5 5 0 0 0 0 10v5a3 3 0 0 1-3 3H20a3 3 0 0 1-3-3v-5a5 5 0 0 0 0-10v-5a3 3 0 0 1 3-3Z" fill="${fg}" fill-opacity=".95"/>
<path d="M32 21v3m0 5v3m0 5v3m0 5v3" stroke="#0038bd" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="3 4"/>
</svg>`

const wordmark = (dark = false) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 64" width="260" height="64">
<defs><linearGradient id="gw" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="#191970"/><stop offset="100%" stop-color="#ff7d11"/>
</linearGradient></defs>
<rect width="64" height="64" rx="16" fill="url(#gw)"/>
<path d="M20 21h24a3 3 0 0 1 3 3v5a5 5 0 0 0 0 10v5a3 3 0 0 1-3 3H20a3 3 0 0 1-3-3v-5a5 5 0 0 0 0-10v-5a3 3 0 0 1 3-3Z" fill="#fff" fill-opacity=".95"/>
<path d="M32 21v3m0 5v3m0 5v3m0 5v3" stroke="#0038bd" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="3 4"/>

<text x="78" y="41" font-family="Plus Jakarta Sans, Inter, system-ui, sans-serif" font-size="26" font-weight="800" fill="${dark ? '#ffffff' : '#201f2c'}" letter-spacing="-.6">Events<tspan fill="${dark ? '#99ade0' : '#191970'}">pady</tspan></text>
</svg>`

/* --------------------------------------------------------------- avatars */

function avatar(seed) {
  const rand = rng(seed)
  const palette = PALETTES[Math.floor(rand() * PALETTES.length)]
  const id = Math.floor(rand() * 99999)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
${defs(id, palette, 120)}
<rect width="200" height="200" fill="url(#g${id})"/>
<circle cx="100" cy="78" r="34" fill="#fff" fill-opacity=".92"/>
<path d="M28 200c0-42 32-66 72-66s72 24 72 66Z" fill="#fff" fill-opacity=".92"/>
</svg>`
}

/* ------------------------------------------------------------ og / social */

const ogImage = () => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
<defs>
<linearGradient id="og" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="#0b0b2e"/><stop offset="55%" stop-color="#191970"/><stop offset="100%" stop-color="#ff7d11"/>
</linearGradient>
<filter id="ob" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="60"/></filter>
</defs>
<rect width="1200" height="630" fill="url(#og)"/>
<ellipse cx="240" cy="140" rx="300" ry="220" fill="#fff" opacity=".12" filter="url(#ob)"/>
<ellipse cx="1020" cy="520" rx="280" ry="200" fill="#fff" opacity=".1" filter="url(#ob)"/>
<rect x="72" y="76" width="88" height="88" rx="22" fill="#fff" fill-opacity=".16"/>
<path d="M96 106h40a4 4 0 0 1 4 4v6a7 7 0 0 0 0 14v6a4 4 0 0 1-4 4H96a4 4 0 0 1-4-4v-6a7 7 0 0 0 0-14v-6a4 4 0 0 1 4-4Z" fill="#fff"/>
<text x="72" y="300" font-family="Plus Jakarta Sans, Inter, system-ui, sans-serif" font-size="82" font-weight="800" fill="#fff" letter-spacing="-2">Eventspady</text>
<text x="72" y="372" font-family="Plus Jakarta Sans, Inter, system-ui, sans-serif" font-size="34" font-weight="500" fill="#fff" fill-opacity=".82">Discover, book and manage unforgettable events.</text>
<text x="72" y="452" font-family="Plus Jakarta Sans, Inter, system-ui, sans-serif" font-size="24" font-weight="600" fill="#fff" fill-opacity=".7">Ticketing · QR check-in · Payments · Guest management</text>
</svg>`

const maintenance = () => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
<defs><linearGradient id="mg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="#9273ff"/><stop offset="100%" stop-color="#ff9b38"/></linearGradient></defs>
<circle cx="400" cy="300" r="220" fill="url(#mg)" opacity=".16"/>
<circle cx="400" cy="300" r="150" fill="url(#mg)" opacity=".24"/>
<g stroke="#191970" stroke-width="14" stroke-linecap="round" fill="none">
<circle cx="400" cy="300" r="82"/>
<path d="M400 218v-40M400 422v40M318 300h-40M522 300h40M342 242l-28-28M458 358l28 28M458 242l28-28M342 358l-28 28"/>
</g>
<circle cx="400" cy="300" r="26" fill="#ff7d11"/>
</svg>`

const empty = () => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
<defs><linearGradient id="eg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="#b5a5ff"/><stop offset="100%" stop-color="#ffc071"/></linearGradient></defs>
<ellipse cx="200" cy="248" rx="130" ry="18" fill="#131320" opacity=".07"/>
<rect x="96" y="86" width="208" height="140" rx="18" fill="url(#eg)" opacity=".28"/>
<rect x="96" y="86" width="208" height="140" rx="18" fill="none" stroke="#384a9a" stroke-opacity=".5" stroke-width="3" stroke-dasharray="10 8"/>
<path d="M140 160h120M140 186h80" stroke="#384a9a" stroke-opacity=".55" stroke-width="8" stroke-linecap="round"/>
<circle cx="160" cy="126" r="14" fill="#ff7d11" opacity=".8"/>
</svg>`

/* ------------------------------------------------------------------ build */

const created = []

// Brand
created.push(write('mark.svg', MARK(64)))
created.push(write('favicon.svg', MARK(64)))
created.push(write('og-image.svg', ogImage()))
created.push(write('maintenance.svg', maintenance()))
created.push(write('empty-state.svg', empty()))

// Hero collage
for (let i = 1; i <= 4; i++) created.push(write(`hero/hero-${i}.svg`, cover(`hero-${i}`, 800, 1000)))

// Animated hero backdrops — poster + fallback for the looping hero videos
for (let i = 1; i <= 3; i++) created.push(write(`hero/motion-${i}.svg`, motionBackdrop(`motion-${i}`)))

// Event covers
for (let i = 1; i <= 18; i++) created.push(write(`events/event-${i}.svg`, cover(`event-${i}`, 1200, 800)))

// Event gallery shots
for (let i = 1; i <= 6; i++) created.push(write(`gallery/gallery-${i}.svg`, cover(`gallery-${i}`, 900, 600)))

// Category tiles
const categories = [
  'music', 'technology', 'business', 'food-drink', 'sports', 'arts',
  'health', 'education', 'film', 'travel', 'gaming', 'nightlife',
]
categories.forEach((c) => created.push(write(`categories/${c}.svg`, cover(`cat-${c}`, 600, 600))))

// Blog covers
for (let i = 1; i <= 8; i++) created.push(write(`blog/blog-${i}.svg`, cover(`blog-${i}`, 1200, 700)))

// Avatars
for (let i = 1; i <= 12; i++) created.push(write(`avatars/avatar-${i}.svg`, avatar(`avatar-${i}`)))

// Organizer logos
for (let i = 1; i <= 8; i++) created.push(write(`organizers/organizer-${i}.svg`, avatar(`org-${i}`)))

console.log(`Generated ${created.length} assets into public/images`)
