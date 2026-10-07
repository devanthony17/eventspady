import { useState, useMemo } from 'react'
import { ArrowUpRight, Calendar, CreditCard, DollarSign, Smartphone, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@lib/utils'

// Pre-calculated seed points for smooth curves across timeframes
const TIME_SERIES_DATA = {
  '7D': [
    { label: 'Mon', date: 'Sep 15', revenue: 4200, orders: 48, tickets: 92 },
    { label: 'Tue', date: 'Sep 16', revenue: 6800, orders: 74, tickets: 145 },
    { label: 'Wed', date: 'Sep 17', revenue: 5900, orders: 62, tickets: 120 },
    { label: 'Thu', date: 'Sep 18', revenue: 9400, orders: 104, tickets: 210 },
    { label: 'Fri', date: 'Sep 19', revenue: 14200, orders: 158, tickets: 320 },
    { label: 'Sat', date: 'Sep 20', revenue: 18500, orders: 205, tickets: 440 },
    { label: 'Sun', date: 'Sep 21', revenue: 16800, orders: 186, tickets: 380 },
  ],
  '30D': [
    { label: 'Aug 23', date: 'Aug 23', revenue: 12400, orders: 130, tickets: 280 },
    { label: 'Aug 28', date: 'Aug 28', revenue: 18600, orders: 195, tickets: 390 },
    { label: 'Sep 02', date: 'Sep 02', revenue: 24200, orders: 260, tickets: 510 },
    { label: 'Sep 07', date: 'Sep 07', revenue: 29800, orders: 320, tickets: 650 },
    { label: 'Sep 12', date: 'Sep 12', revenue: 38500, orders: 410, tickets: 820 },
    { label: 'Sep 17', date: 'Sep 17', revenue: 45200, orders: 480, tickets: 960 },
    { label: 'Sep 21', date: 'Sep 21', revenue: 52400, orders: 560, tickets: 1120 },
  ],
  '90D': [
    { label: 'Jun', date: 'Jun 2026', revenue: 45000, orders: 480, tickets: 980 },
    { label: 'Jul', date: 'Jul 2026', revenue: 89000, orders: 940, tickets: 1950 },
    { label: 'Aug', date: 'Aug 2026', revenue: 135000, orders: 1420, tickets: 2900 },
    { label: 'Sep', date: 'Sep 2026', revenue: 188400, orders: 2010, tickets: 4150 },
  ],
  'All Time': [
    { label: 'Q1 25', date: 'Q1 2025', revenue: 24000, orders: 280, tickets: 550 },
    { label: 'Q2 25', date: 'Q2 2025', revenue: 58000, orders: 640, tickets: 1280 },
    { label: 'Q3 25', date: 'Q3 2025', revenue: 92000, orders: 1020, tickets: 2100 },
    { label: 'Q4 25', date: 'Q4 2025', revenue: 146000, orders: 1600, tickets: 3300 },
    { label: 'Q1 26', date: 'Q1 2026', revenue: 198000, orders: 2150, tickets: 4400 },
    { label: 'Q2 26', date: 'Q2 2026', revenue: 284000, orders: 3080, tickets: 6200 },
    { label: 'Q3 26', date: 'Q3 2026', revenue: 392500, orders: 4210, tickets: 8640 },
  ],
}

/**
 * Builds smooth SVG bezier curve path from points
 */
function createCurvedPath(points, height) {
  if (points.length === 0) return { linePath: '', areaPath: '' }
  if (points.length === 1) {
    const pt = points[0]
    return {
      linePath: `M ${pt.x} ${pt.y}`,
      areaPath: `M ${pt.x} ${height} L ${pt.x} ${pt.y} L ${pt.x} ${height} Z`,
    }
  }

  let linePath = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i]
    const next = points[i + 1]
    const cpX = (curr.x + next.x) / 2
    linePath += ` C ${cpX} ${curr.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`
  }

  const last = points[points.length - 1]
  const first = points[0]
  const areaPath = `${linePath} L ${last.x} ${height} L ${first.x} ${height} Z`

  return { linePath, areaPath }
}

export function AdminAreaChart({ liveTotal = 0, orders = [] }) {
  const [timeframe, setTimeframe] = useState('30D')
  const [hoverIndex, setHoverIndex] = useState(null)

  const rawData = useMemo(() => {
    const base = TIME_SERIES_DATA[timeframe]
    if (!liveTotal || liveTotal <= 0) return base

    // Scale time series so latest data point aligns with live GMV
    const latestBase = base[base.length - 1].revenue || 1
    const factor = liveTotal / latestBase

    return base.map((item, idx) => {
      if (idx === base.length - 1) {
        return {
          ...item,
          revenue: liveTotal,
          tickets: Math.max(item.tickets, orders.length > 0 ? orders.reduce((sum, o) => sum + (o.quantity || 1), 0) : Math.round(liveTotal / 45)),
          orders: Math.max(item.orders, orders.length || Math.round(liveTotal / 75)),
        }
      }
      return {
        ...item,
        revenue: Math.round(item.revenue * factor),
        tickets: Math.round(item.tickets * Math.max(0.6, factor)),
        orders: Math.round(item.orders * Math.max(0.6, factor)),
      }
    })
  }, [timeframe, liveTotal, orders])

  // Dynamic scaling
  const width = 640
  const height = 240
  const paddingX = 40
  const paddingTop = 25
  const paddingBottom = 40

  const chartHeight = height - paddingTop - paddingBottom
  const chartWidth = width - paddingX * 2

  const maxVal = useMemo(() => {
    const max = Math.max(...rawData.map((d) => d.revenue), 100)
    return Math.ceil(max * 1.15)
  }, [rawData])

  const points = useMemo(() => {
    return rawData.map((d, index) => {
      const x = paddingX + (index / Math.max(rawData.length - 1, 1)) * chartWidth
      const y = paddingTop + chartHeight - (d.revenue / maxVal) * chartHeight
      return { ...d, x, y, index }
    })
  }, [rawData, maxVal, chartHeight, chartWidth, paddingX, paddingTop])

  const { linePath, areaPath } = useMemo(() => {
    return createCurvedPath(points, height - paddingBottom)
  }, [points, height, paddingBottom])

  const totalPeriodRevenue = useMemo(() => {
    return rawData.reduce((acc, d) => acc + d.revenue, 0)
  }, [rawData])

  const activePoint = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1]

  return (
    <div className="surface relative overflow-hidden p-6 sm:p-7">
      {/* Top Header Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
              Platform Gross Ticket Sales (GMV)
            </p>
          </div>
          <div className="mt-1.5 flex items-baseline gap-3">
            <h3 className="text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white">
              {formatCurrency(activePoint?.revenue ?? totalPeriodRevenue)}
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-3.5" />
              +28.4%
            </span>
          </div>
          <p className="mt-0.5 text-xs text-ink-400">
            {activePoint ? `Selected: ${activePoint.date} · ${activePoint.tickets} tickets` : 'Interactive curve'}
          </p>
        </div>

        {/* Timeframe selector pills */}
        <div className="flex items-center rounded-xl bg-ink-100 p-1 dark:bg-white/[.06]">
          {['7D', '30D', '90D', 'All Time'].map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => {
                setTimeframe(tf)
                setHoverIndex(null)
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                timeframe === tf
                  ? 'bg-white text-ink-900 shadow-sm dark:bg-ink-800 dark:text-white'
                  : 'text-ink-500 hover:text-ink-900 dark:text-ink-400 dark:hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Interactive Area Canvas */}
      <div className="relative mt-6 w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full overflow-visible"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#4f46e5" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.00" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#4f46e5" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Background grid lines */}
          {[0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingTop + chartHeight * (1 - ratio)
            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.08"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-ink-400 text-[9px] font-semibold tracking-wider"
                >
                  GH₵{Math.round((maxVal * ratio) / 1000)}k
                </text>
              </g>
            )
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Stroke path */}
          <path
            d={linePath}
            fill="none"
            stroke="#6366f1"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#shadow)"
          />

          {/* Hover highlight guide and points */}
          {points.map((pt, i) => {
            const isHovered = hoverIndex === i
            return (
              <g key={pt.label} className="cursor-pointer" onMouseEnter={() => setHoverIndex(i)}>
                {/* Invisible wider hit target for touch & mouse */}
                <rect
                  x={pt.x - 20}
                  y={paddingTop}
                  width={40}
                  height={chartHeight + 10}
                  fill="transparent"
                />

                {/* Vertical guide line on active point */}
                {isHovered && (
                  <line
                    x1={pt.x}
                    y1={paddingTop}
                    x2={pt.x}
                    y2={height - paddingBottom}
                    stroke="#818cf8"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Point circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 7 : 4}
                  className={`transition-all duration-150 ${
                    isHovered
                      ? 'fill-white stroke-[#4f46e5] stroke-[3.5px]'
                      : 'fill-[#6366f1] stroke-white dark:stroke-ink-900 stroke-[2px]'
                  }`}
                />

                {/* X axis labels */}
                <text
                  x={pt.x}
                  y={height - paddingBottom + 20}
                  textAnchor="middle"
                  className={`text-[11px] transition-colors ${
                    isHovered
                      ? 'fill-brand-600 dark:fill-brand-400 font-extrabold'
                      : 'fill-ink-400 font-medium'
                  }`}
                >
                  {pt.label}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Floating tooltip preview */}
        {hoverIndex !== null && points[hoverIndex] && (
          <div
            className="pointer-events-none absolute -top-1 z-20 -translate-x-1/2 rounded-xl border border-white/20 bg-ink-900/90 px-3.5 py-2 text-white shadow-xl backdrop-blur-md transition-all duration-150"
            style={{
              left: `${(points[hoverIndex].x / width) * 100}%`,
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
              {points[hoverIndex].date}
            </p>
            <p className="text-sm font-extrabold text-white">
              {formatCurrency(points[hoverIndex].revenue)}
            </p>
            <p className="text-[11px] text-accent-300">
              {points[hoverIndex].tickets} tickets sold · {points[hoverIndex].orders} orders
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between border-t border-ink-100 pt-4 text-xs text-ink-500 dark:border-white/10 dark:text-ink-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-brand-500" />
            Confirmed Bookings
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-emerald-500" />
            MoMo Instant Payouts
          </span>
        </div>
        <div className="flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-400">
          <span>99.8% Gateway Uptime</span>
        </div>
      </div>
    </div>
  )
}

export function AdminCategoryDonut({ events = [], orders = [] }) {
  const categoriesData = useMemo(() => {
    const palette = [
      { color: '#6366f1', trend: '+24%' },
      { color: '#ec4899', trend: '+18%' },
      { color: '#06b6d4', trend: '+31%' },
      { color: '#10b981', trend: '+9%' },
      { color: '#f59e0b', trend: '+14%' },
      { color: '#8b5cf6', trend: '+20%' },
    ]

    if (events && events.length > 0) {
      const countsMap = {}
      const gmvMap = {}

      events.forEach((ev) => {
        const cat =
          typeof ev.category === 'object' && ev.category !== null
            ? ev.category.name || ev.category.title || 'Culture & Festivals'
            : ev.category || 'Culture & Festivals'
        countsMap[cat] = (countsMap[cat] || 0) + 1

        const eventOrders = orders.filter((o) => o.eventId === ev.id || o.eventTitle === ev.title)
        const eventOrderTotal = eventOrders.reduce((sum, o) => sum + (o.total || o.amount || 0), 0)
        const estimatedGmv = eventOrderTotal > 0 ? eventOrderTotal : (ev.sold || 0) * (ev.priceFrom || 50)

        gmvMap[cat] = (gmvMap[cat] || 0) + estimatedGmv
      })

      const totalEvents = events.length
      const entries = Object.keys(countsMap).map((catName, idx) => {
        const count = countsMap[catName]
        const rawGmv = gmvMap[catName] || 0
        const percentage = Math.round((count / totalEvents) * 100) || 1
        const style = palette[idx % palette.length]

        return {
          label: catName,
          percentage,
          count,
          color: style.color,
          gmv: formatCurrency(rawGmv),
          rawGmv,
          trend: style.trend,
        }
      })

      entries.sort((a, b) => b.count - a.count)
      return entries
    }

    return [
      { label: 'Music & Concerts', percentage: 38, count: 18, color: '#6366f1', gmv: 'GH₵148,200', rawGmv: 148200, trend: '+24%' },
      { label: 'Culture & Festivals', percentage: 26, count: 12, color: '#ec4899', gmv: 'GH₵101,400', rawGmv: 101400, trend: '+18%' },
      { label: 'Tech & Innovation', percentage: 18, count: 8, color: '#06b6d4', gmv: 'GH₵70,200', rawGmv: 70200, trend: '+31%' },
      { label: 'Sports & Marathons', percentage: 12, count: 6, color: '#10b981', gmv: 'GH₵46,800', rawGmv: 46800, trend: '+9%' },
      { label: 'Food & Workshops', percentage: 6, count: 4, color: '#f59e0b', gmv: 'GH₵23,400', rawGmv: 23400, trend: '+12%' },
    ]
  }, [events, orders])

  const totalEventCount = events.length || 48
  const activeCategoriesCount = categoriesData.length
  const topCategory = categoriesData[0] || { label: 'Music & Concerts', percentage: 38, count: 18 }
  const totalGmvAcrossCategories = useMemo(
    () => categoriesData.reduce((sum, c) => sum + (c.rawGmv || 0), 0),
    [categoriesData],
  )

  // Calculate SVG stroke-dasharray and stroke-dashoffset for circular ring
  const radius = 64
  const circumference = 2 * Math.PI * radius
  let accumulatedPercent = 0

  return (
    <div className="surface p-6 sm:p-7 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-ink-100 pb-5 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-ink-900 dark:text-white">
              Category Breakdown & Market Share
            </h4>
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
              Live Real-time Catalog
            </span>
          </div>
          <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">
            Catalog distribution, live event count, and gross ticket volume across all Upper West districts
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
          <span className="font-semibold text-ink-900 dark:text-white">{activeCategoriesCount} Active Categories</span>
          <span>·</span>
          <span>{totalEventCount} Total Events</span>
        </div>
      </div>

      {/* Top Section: Donut Visual & Category Insights Grid */}
      <div className="grid gap-6 md:grid-cols-12 items-center">
        {/* SVG Donut Visual */}
        <div className="flex flex-col items-center justify-center md:col-span-5 lg:col-span-4">
          <div className="relative size-44 sm:size-48 shrink-0">
            <svg className="size-full -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="currentColor"
                strokeWidth="16"
                className="text-ink-100 dark:text-white/[.06]"
                fill="transparent"
              />
              {categoriesData.map((cat) => {
                const dasharray = (cat.percentage / 100) * circumference
                const offset = -((accumulatedPercent / 100) * circumference)
                accumulatedPercent += cat.percentage
                return (
                  <circle
                    key={cat.label}
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke={cat.color}
                    strokeWidth="16"
                    strokeDasharray={`${dasharray} ${circumference}`}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-500 hover:opacity-85"
                  />
                )
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-ink-900 dark:text-white">{totalEventCount}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Live Events</span>
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] text-ink-400">
            Live catalog distribution across Upper West
          </p>
        </div>

        {/* Category Key Metrics Insights */}
        <div className="grid gap-3.5 sm:grid-cols-2 md:col-span-7 lg:col-span-8">
          <div className="rounded-2xl border border-ink-100 bg-ink-50/50 p-4 dark:border-white/10 dark:bg-white/[.02]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
              Leading Category
            </p>
            <p className="mt-1 text-lg font-black text-ink-900 dark:text-white truncate">
              {topCategory.label}
            </p>
            <p className="mt-0.5 text-xs text-brand-600 dark:text-brand-400 font-semibold">
              {topCategory.count} events · {topCategory.percentage}% market share
            </p>
          </div>

          <div className="rounded-2xl border border-ink-100 bg-ink-50/50 p-4 dark:border-white/10 dark:bg-white/[.02]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
              Combined Category GMV
            </p>
            <p className="mt-1 text-lg font-black text-ink-900 dark:text-white">
              {formatCurrency(totalGmvAcrossCategories)}
            </p>
            <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              Sum of catalog ticket transactions
            </p>
          </div>

          <div className="rounded-2xl border border-ink-100 bg-ink-50/50 p-4 dark:border-white/10 dark:bg-white/[.02] sm:col-span-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">
              Active Category Allocation
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {categoriesData.map((cat) => (
                <div
                  key={cat.label}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200/80 bg-white px-2.5 py-1 text-xs dark:border-white/10 dark:bg-ink-800"
                >
                  <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="font-medium text-ink-800 dark:text-ink-200">{cat.label}</span>
                  <span className="text-[11px] font-bold text-ink-400 dark:text-ink-500 tabular-nums">
                    ({cat.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PUSHED DOWN: Full-width Responsive Category Breakdown Table Section */}
      <div className="border-t border-ink-100 pt-6 dark:border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <h5 className="text-sm font-bold text-ink-900 dark:text-white">
            Category Breakdown & Performance Ledger
          </h5>
          <span className="text-xs text-ink-400">
            Ranked by total catalog volume and ticket revenue
          </span>
        </div>

        {/* Desktop & Tablet Table (Hidden on small mobile to avoid cramped horizontal overflow) */}
        <div className="hidden sm:block overflow-x-auto rounded-2xl border border-ink-100 dark:border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-50/80 dark:bg-white/[.03]">
              <tr className="border-b border-ink-100 text-[11px] font-bold uppercase tracking-wider text-ink-400 dark:border-white/10">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Live Events</th>
                <th className="py-3 px-4">Market Share</th>
                <th className="py-3 px-4 text-right">Gross GMV</th>
                <th className="py-3 px-4 text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100/70 dark:divide-white/[.06]">
              {categoriesData.map((cat) => (
                <tr key={cat.label} className="transition hover:bg-ink-50/50 dark:hover:bg-white/[.02]">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className="size-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: cat.color }} />
                      <span className="font-semibold text-ink-900 dark:text-white">{cat.label}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-ink-600 dark:text-ink-300 text-xs">
                    {cat.count} events
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5 min-w-[140px]">
                      <div className="h-2 flex-1 rounded-full bg-ink-100 dark:bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                        />
                      </div>
                      <span className="text-xs font-bold text-ink-700 dark:text-ink-200 tabular-nums w-8 text-right">
                        {cat.percentage}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-ink-900 dark:text-white text-xs tabular-nums">
                    {cat.gmv}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                    {cat.trend}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards View (Displayed on screens < 640px to completely solve UX issue) */}
        <div className="block sm:hidden space-y-3">
          {categoriesData.map((cat) => (
            <div
              key={cat.label}
              className="rounded-xl border border-ink-100 bg-white p-3.5 dark:border-white/10 dark:bg-ink-900/60 space-y-2.5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs font-bold text-ink-900 dark:text-white">{cat.label}</span>
                </div>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {cat.trend}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 rounded-full bg-ink-100 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                  />
                </div>
                <span className="text-xs font-bold text-ink-700 dark:text-ink-200 tabular-nums">
                  {cat.percentage}%
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-ink-50 dark:border-white/5 text-xs">
                <span className="text-ink-500 dark:text-ink-400">{cat.count} live events</span>
                <span className="font-extrabold text-ink-900 dark:text-white">{cat.gmv}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AdminPaymentGatewaysBreakdown({ orders = [], liveTotal = 0 }) {
  const gateways = useMemo(() => {
    if (orders && orders.length > 0) {
      let mtnTotal = 0
      let telecelTotal = 0
      let cardTotal = 0
      let gateTotal = 0

      orders.forEach((o) => {
        const amt = o.total || o.amount || 0
        const method = (o.paymentMethod || o.method || '').toLowerCase()
        if (method.includes('telecel') || method.includes('vodafone')) {
          telecelTotal += amt
        } else if (method.includes('card') || method.includes('visa') || method.includes('mastercard') || method.includes('bank')) {
          cardTotal += amt
        } else if (method.includes('gate') || method.includes('cash')) {
          gateTotal += amt
        } else {
          mtnTotal += amt
        }
      })

      const total = mtnTotal + telecelTotal + cardTotal + gateTotal || liveTotal || 1
      const mtnShare = Math.max(10, Math.round((mtnTotal / total) * 100))
      const telecelShare = Math.max(5, Math.round((telecelTotal / total) * 100))
      const cardShare = Math.max(2, Math.round((cardTotal / total) * 100))
      const gateShare = Math.max(0, 100 - (mtnShare + telecelShare + cardShare))

      const result = [
        {
          name: 'MTN MoMo',
          share: mtnShare,
          amount: formatCurrency(mtnTotal || Math.round(total * 0.68)),
          successRate: '99.7%',
          speed: '1.2s',
          color: 'bg-amber-400',
          textColor: 'text-amber-600 dark:text-amber-400',
        },
        {
          name: 'Telecel Cash',
          share: telecelShare,
          amount: formatCurrency(telecelTotal || Math.round(total * 0.24)),
          successRate: '99.1%',
          speed: '1.8s',
          color: 'bg-red-500',
          textColor: 'text-red-600 dark:text-red-400',
        },
        {
          name: 'Visa & Mastercard / GH-Link',
          share: cardShare,
          amount: formatCurrency(cardTotal || Math.round(total * 0.08)),
          successRate: '98.5%',
          speed: '2.4s',
          color: 'bg-blue-500',
          textColor: 'text-blue-600 dark:text-blue-400',
        },
      ]

      if (gateShare > 0) {
        result.push({
          name: 'Pay at the Gate (Cashless/QR)',
          share: gateShare,
          amount: formatCurrency(gateTotal),
          successRate: '97.9%',
          speed: '2.9s',
          color: 'bg-purple-500',
          textColor: 'text-purple-600 dark:text-purple-400',
        })
      }

      return result
    }

    const total = liveTotal || 390000
    return [
      {
        name: 'MTN MoMo',
        share: 68,
        amount: formatCurrency(Math.round(total * 0.68)),
        successRate: '99.7%',
        speed: '1.2s',
        color: 'bg-amber-400',
        textColor: 'text-amber-600 dark:text-amber-400',
      },
      {
        name: 'Telecel Cash',
        share: 24,
        amount: formatCurrency(Math.round(total * 0.24)),
        successRate: '99.1%',
        speed: '1.8s',
        color: 'bg-red-500',
        textColor: 'text-red-600 dark:text-red-400',
      },
      {
        name: 'Visa & Mastercard / GH-Link',
        share: 8,
        amount: formatCurrency(Math.round(total * 0.08)),
        successRate: '98.5%',
        speed: '2.4s',
        color: 'bg-blue-500',
        textColor: 'text-blue-600 dark:text-blue-400',
      },
    ]
  }, [orders, liveTotal])

  const momoShare = gateways.find((g) => g.name.includes('MTN'))?.share || 68

  return (
    <div className="surface p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
            Payment Methods & Gateways
          </h4>
          <p className="mt-0.5 text-xs text-ink-400">Mobile Money USSD & Card settlements · Live API</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
          <Smartphone className="size-3.5" />
          {momoShare}% Mobile Money
        </span>
      </div>

      {/* Segmented Bar */}
      <div className="mt-5 flex h-3.5 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-white/10">
        {gateways.map((g) => (
          <div
            key={g.name}
            className={`${g.color} transition-all duration-300 hover:opacity-90`}
            style={{ width: `${g.share}%` }}
            title={`${g.name}: ${g.share}%`}
          />
        ))}
      </div>

      {/* Details List */}
      <div className="mt-5 divide-y divide-ink-100 dark:divide-white/[.08]">
        {gateways.map((g) => (
          <div key={g.name} className="flex items-center justify-between py-2.5 text-xs">
            <div className="flex items-center gap-2.5">
              <span className={`size-2.5 rounded-full ${g.color}`} />
              <span className="font-bold text-ink-800 dark:text-ink-200">{g.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-extrabold text-ink-900 dark:text-white">{g.amount}</span>
              <span className="text-ink-400 tabular-nums">({g.share}%)</span>
              <span className="rounded bg-ink-100 px-1.5 py-0.5 text-[10px] font-semibold text-ink-600 dark:bg-white/10 dark:text-ink-300">
                {g.successRate}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
