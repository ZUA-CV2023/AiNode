/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { BadgePercent, Rocket, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Skeleton } from '@/components/ui/skeleton'
import { useSystemConfig } from '@/hooks/use-system-config'

type AuthLayoutProps = {
  children: React.ReactNode
}

type AuthShowcaseProps = {
  systemName: string
  loading: boolean
}

// Coarse continent outlines in [longitude, latitude] pairs
const CONTINENTS: [number, number][][] = [
  // North America
  [
    [-168, 65], [-160, 71], [-140, 70], [-125, 72], [-110, 73], [-95, 73],
    [-82, 70], [-70, 63], [-58, 55], [-55, 48], [-65, 45], [-70, 42],
    [-75, 35], [-81, 25], [-90, 22], [-97, 18], [-105, 20], [-112, 29],
    [-118, 34], [-124, 42], [-130, 50], [-140, 58], [-150, 62], [-165, 60],
  ],
  // South America
  [
    [-81, 10], [-70, 11], [-60, 10], [-50, 4], [-35, -6], [-38, -16],
    [-45, -23], [-55, -30], [-63, -38], [-70, -48], [-74, -53], [-73, -45],
    [-72, -33], [-77, -22], [-80, -10], [-81, 0],
  ],
  // Africa
  [
    [-17, 15], [-16, 20], [-8, 30], [0, 34], [10, 37], [20, 32], [32, 31],
    [39, 20], [44, 10], [51, 11], [43, 0], [40, -12], [35, -22], [25, -34],
    [18, -34], [12, -18], [8, -2], [0, 5], [-8, 5], [-14, 10],
  ],
  // Europe + Asia
  [
    [-10, 36], [0, 43], [8, 44], [15, 40], [24, 40], [30, 41], [38, 41],
    [45, 42], [52, 45], [60, 45], [68, 48], [75, 55], [85, 58], [95, 60],
    [105, 60], [115, 60], [125, 57], [135, 55], [142, 48], [140, 40],
    [132, 35], [125, 32], [120, 25], [110, 20], [105, 10], [100, 6],
    [97, 16], [90, 22], [80, 22], [72, 25], [62, 26], [55, 32], [48, 38],
    [42, 38], [35, 37], [28, 36], [20, 39], [12, 38], [5, 40], [-2, 40],
  ],
  // Australia
  [
    [114, -22], [122, -18], [130, -12], [137, -12], [145, -15], [151, -24],
    [150, -33], [145, -39], [138, -35], [128, -33], [118, -34], [113, -26],
  ],
]

// Pre-generate stipple dots inside each continent (lon/lat space)
function generateStippleDots(): { lon: number; lat: number }[] {
  const dots: { lon: number; lat: number }[] = []
  const pointInPolygon = (
    lon: number,
    lat: number,
    poly: [number, number][]
  ) => {
    let inside = false
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0]
      const yi = poly[i][1]
      const xj = poly[j][0]
      const yj = poly[j][1]
      const intersect =
        yi > lat !== yj > lat &&
        lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
      if (intersect) inside = !inside
    }
    return inside
  }

  for (const poly of CONTINENTS) {
    let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity
    for (const [lon, lat] of poly) {
      minLon = Math.min(minLon, lon)
      maxLon = Math.max(maxLon, lon)
      minLat = Math.min(minLat, lat)
      maxLat = Math.max(maxLat, lat)
    }
    const step = 1.5
    for (let lat = minLat; lat <= maxLat; lat += step) {
      for (let lon = minLon; lon <= maxLon; lon += step) {
        // Jitter for organic look
        const jlon = lon + (Math.sin(lon * 12.9 + lat * 7.3) * 0.8)
        const jlat = lat + (Math.cos(lon * 5.1 + lat * 11.7) * 0.8)
        if (pointInPolygon(jlon, jlat, poly)) {
          dots.push({ lon: jlon, lat: jlat })
        }
      }
    }
  }
  return dots
}

const STIPPLE_DOTS = generateStippleDots()

// Intercontinental network arcs in [longitude, latitude] pairs
// (same 5 routes as the reference site)
const NETWORK_ARCS: { from: [number, number]; to: [number, number] }[] = [
  { from: [237.56, 37.78], to: [139.65, 35.68] }, // San Francisco → Tokyo
  { from: [-74.01, 40.71], to: [-0.13, 51.51] }, // New York → London
  { from: [103.82, 1.35], to: [55.27, 25.2] }, // Singapore → Dubai
  { from: [116.4, 39.9], to: [151.21, -33.87] }, // Beijing → Sydney
  { from: [2.35, 48.86], to: [-46.63, -23.55] }, // Paris → São Paulo
]

// Canvas-rendered globe: white sphere with stippled continents
function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const size = canvas.width
    const cx = size / 2
    const cy = size / 2
    const r = size * 0.46
    const toRad = Math.PI / 180
    let angle = 0.6
    let raf = 0
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    const project = (latRad: number, lonRad: number) => {
      const lambda = lonRad + angle
      const x = Math.cos(latRad) * Math.sin(lambda)
      const z = Math.cos(latRad) * Math.cos(lambda)
      const y = -Math.sin(latRad)
      return { x, y, z }
    }

    const draw = () => {
      ctx.clearRect(0, 0, size, size)

      // --- Soft outer atmosphere (very subtle) ---
      const aura = ctx.createRadialGradient(cx, cy, r * 0.82, cx, cy, r * 1.28)
      aura.addColorStop(0, 'rgba(147,197,253,0.12)')
      aura.addColorStop(1, 'rgba(147,197,253,0)')
      ctx.beginPath()
      ctx.arc(cx, cy, r * 1.28, 0, Math.PI * 2)
      ctx.fillStyle = aura
      ctx.fill()

      // --- Sphere body: white → light gray gradient ---
      const body = ctx.createRadialGradient(
        cx - r * 0.3,
        cy - r * 0.35,
        r * 0.05,
        cx,
        cy,
        r
      )
      body.addColorStop(0, '#ffffff')
      body.addColorStop(0.6, '#f0f4fa')
      body.addColorStop(1, '#c7d2e0')
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fillStyle = body
      ctx.fill()

      // --- Stippled continents ---
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.clip()

      ctx.fillStyle = 'rgba(71,85,105,0.7)'
      const dotR = size * 0.0022
      for (const dot of STIPPLE_DOTS) {
        const p = project(dot.lat * toRad, dot.lon * toRad)
        if (p.z <= 0.08) continue
        const px = cx + r * p.x
        const py = cy + r * p.y
        ctx.beginPath()
        ctx.arc(px, py, dotR, 0, Math.PI * 2)
        ctx.fill()
      }

      // --- Subtle grid (very faint) ---
      ctx.strokeStyle = 'rgba(148,163,184,0.1)'
      ctx.lineWidth = size * 0.0005
      for (const lat of [-60, -30, 0, 30, 60]) {
        let started = false
        ctx.beginPath()
        for (let lon = 0; lon <= 360; lon += 3) {
          const p = project(lat * toRad, lon * toRad)
          if (p.z <= 0) {
            started = false
            continue
          }
          if (!started) {
            ctx.moveTo(cx + r * p.x, cy + r * p.y)
            started = true
          } else {
            ctx.lineTo(cx + r * p.x, cy + r * p.y)
          }
        }
        ctx.stroke()
      }

      ctx.restore()

      // --- Network arcs (drawn above the surface, not clipped) ---
      const drawArc = (from: [number, number], to: [number, number]) => {
        const steps = 60
        type Pt = { x: number; y: number; f: number; zFade: number }
        const segments: Pt[][] = []
        let current: Pt[] = []
        for (let i = 0; i <= steps; i++) {
          const f = i / steps
          const lat = from[1] + (to[1] - from[1]) * f
          const lon = from[0] + (to[0] - from[0]) * f
          const p = project(lat * toRad, lon * toRad)
          if (p.z <= 0) {
            if (current.length > 1) segments.push(current)
            current = []
            continue
          }
          const lift = 1 + Math.sin(f * Math.PI) * 0.25
          current.push({
            x: cx + r * p.x * lift,
            y: cy + r * p.y * lift,
            f,
            zFade: Math.min(1, p.z / 0.25),
          })
        }
        if (current.length > 1) segments.push(current)

        for (const seg of segments) {
          // Glow pass
          ctx.save()
          ctx.shadowColor = 'rgba(167,139,250,0.6)'
          ctx.shadowBlur = 16
          ctx.strokeStyle = 'rgba(167,139,250,0.25)'
          ctx.lineWidth = size * 0.0016
          ctx.beginPath()
          ctx.moveTo(seg[0].x, seg[0].y)
          for (let i = 1; i < seg.length; i++) ctx.lineTo(seg[i].x, seg[i].y)
          ctx.stroke()
          ctx.restore()

          // Main line, fading toward the middle and the horizon
          ctx.lineWidth = size * 0.0042
          ctx.lineCap = 'round'
          for (let i = 1; i < seg.length; i++) {
            const a = seg[i - 1]
            const b = seg[i]
            const alpha = Math.pow(Math.sin(b.f * Math.PI), 1.1) * b.zFade
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(128,77,230,${alpha})`
            ctx.stroke()
          }
        }
      }

      for (const arc of NETWORK_ARCS) drawArc(arc.from, arc.to)

      // --- Endpoint markers (blue dots) ---
      ctx.save()
      ctx.shadowColor = 'rgb(51,128,255)'
      ctx.shadowBlur = 5
      ctx.fillStyle = 'rgb(51,128,255)'
      const endpointR = size * 0.0075
      for (const arc of NETWORK_ARCS) {
        for (const [lon, lat] of [arc.from, arc.to]) {
          const p = project(lat * toRad, lon * toRad)
          if (p.z <= 0.1) continue
          ctx.beginPath()
          ctx.arc(cx + r * p.x, cy + r * p.y, endpointR, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.restore()

      // --- Specular highlight (top-left) ---
      const gloss = ctx.createRadialGradient(
        cx - r * 0.38,
        cy - r * 0.45,
        r * 0.02,
        cx - r * 0.25,
        cy - r * 0.3,
        r * 0.65
      )
      gloss.addColorStop(0, 'rgba(255,255,255,0.6)')
      gloss.addColorStop(0.5, 'rgba(255,255,255,0.15)')
      gloss.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fillStyle = gloss
      ctx.fill()

      // --- Rim shadow (bottom-right) ---
      const rim = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, r)
      rim.addColorStop(0, 'rgba(100,116,139,0)')
      rim.addColorStop(1, 'rgba(100,116,139,0.18)')
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fillStyle = rim
      ctx.fill()

      if (!reducedMotion) {
        angle += 0.003
        raf = requestAnimationFrame(draw)
      }
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={960}
      height={960}
      className='absolute inset-0 h-full w-full rounded-full'
    />
  )
}

// Left-hand showcase: brand name, three value props and a glossy sphere
function AuthShowcase({ systemName, loading }: AuthShowcaseProps) {
  const { t } = useTranslation()

  const highlights = [
    {
      label: t('Stronger model'),
      icon: Sparkles,
      gradient: 'from-[#4f7bf7] to-[#7c6cf6]',
    },
    {
      label: t('Lower price'),
      icon: BadgePercent,
      gradient: 'from-[#7c6cf6] to-[#c04fe0]',
    },
    {
      label: t('Easier to implement'),
      icon: Rocket,
      gradient: 'from-[#c04fe0] to-[#f472b6]',
    },
  ]

  return (
    <div className='relative hidden w-full max-w-[560px] flex-1 flex-col lg:flex lg:h-[540px]'>
      <div className='relative z-10 shrink-0'>
        {/* Brand name with soft colour glow */}
        <div className='relative'>
          <div
            aria-hidden='true'
            className='pointer-events-none absolute -top-10 -left-8 h-32 w-72 bg-[radial-gradient(circle,rgba(99,102,241,0.22)_0%,transparent_70%)] blur-2xl'
          />
          {loading ? (
            <Skeleton className='relative h-12 w-56' />
          ) : (
            <h1 className='relative bg-gradient-to-r from-[#1d63f2] via-[#7b5cf0] to-[#f472b6] bg-clip-text text-[42px] leading-none font-extrabold tracking-[-0.035em] text-transparent xl:text-[54px]'>
              {systemName}
            </h1>
          )}
        </div>

        {/* Accent rule under the brand name */}
        <div className='mt-6 h-[3px] w-16 rounded-full bg-gradient-to-r from-[#4c7bf5] via-[#7c6cf6] to-[#c04fe0] shadow-[0_2px_10px_rgba(124,108,246,0.45)]' />

        {/* Value props as frosted glass chips */}
        <div className='mt-6 flex max-w-[560px] flex-wrap items-center gap-2.5'>
          {highlights.map(({ label, icon: Icon, gradient }) => (
            <div
              key={label}
              className='group flex items-center gap-2 rounded-2xl border border-white/80 bg-white/65 py-2 pr-3.5 pl-2 text-[14px] font-semibold whitespace-nowrap text-[#0f172a] shadow-[0_10px_26px_-22px_rgba(15,23,42,0.55)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_16px_34px_-22px_rgba(79,110,246,0.55)] xl:text-[15px]'
            >
              <span
                className={`flex size-7 items-center justify-center rounded-[10px] bg-gradient-to-br ${gradient} text-white shadow-[0_6px_14px_-8px_rgba(79,110,246,0.9)] transition-transform duration-300 group-hover:scale-105`}
              >
                <Icon className='size-[15px]' strokeWidth={2.2} />
              </span>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Sphere with soft glow */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute -bottom-[35px] left-1/2 size-[400px] -translate-x-1/2 xl:size-[420px]'
      >
        {/* Outer soft glow */}
        <div className='absolute inset-[-18%] rounded-full bg-[radial-gradient(circle,rgba(147,197,253,0.18)_0%,rgba(147,197,253,0.06)_45%,transparent_72%)] blur-xl' />

        {/* The sphere */}
        <div className='absolute inset-0 rounded-full shadow-[0_30px_80px_-28px_rgba(100,116,139,0.5)]'>
          <Globe />
        </div>
      </div>
    </div>
  )
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()
  const { systemName, logo, loading } = useSystemConfig()

  return (
    <div className='relative flex min-h-svh flex-col overflow-hidden bg-[#f3f6fd]'>
      {/* Soft pastel wash, matching the reference auth backdrop */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_16%,#e9f1ff_0%,transparent_52%),radial-gradient(circle_at_96%_8%,#f2ecff_0%,transparent_44%),radial-gradient(circle_at_88%_94%,#ffeef6_0%,transparent_46%),radial-gradient(circle_at_14%_86%,#e6f4ff_0%,transparent_44%)]'
      />

      <Link
        to='/'
        className='absolute top-4 left-4 z-20 flex items-center gap-2 transition-opacity hover:opacity-80 sm:top-8 sm:left-8'
      >
        <div className='relative h-8 w-8'>
          {loading ? (
            <Skeleton className='absolute inset-0 rounded-full' />
          ) : (
            <img
              src={logo}
              alt={t('Logo')}
              className='h-8 w-8 rounded-full object-cover'
            />
          )}
        </div>
        {loading ? (
          <Skeleton className='h-6 w-24' />
        ) : (
          <span className='text-foreground text-lg font-semibold'>
            {systemName}
          </span>
        )}
      </Link>

      <div className='relative z-10 mx-auto flex min-h-svh w-full max-w-[1400px] items-center justify-center gap-12 px-6 py-20 lg:justify-between lg:px-14'>
        <AuthShowcase systemName={systemName} loading={loading} />

        <div className='border-border/60 flex w-full max-w-[420px] shrink-0 flex-col justify-center rounded-2xl border bg-white/90 p-7 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.3)] backdrop-blur-xl sm:p-8 lg:min-h-[540px] lg:max-w-[380px]'>
          {children}
        </div>
      </div>
    </div>
  )
}
