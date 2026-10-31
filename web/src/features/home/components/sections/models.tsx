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
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'
import { getLobeIcon } from '@/lib/lobe-icon'

const MODEL_ROWS: string[][] = [
  [
    'OpenAI.Color',
    'Claude.Color',
    'Gemini.Color',
    'Qwen.Color',
    'DeepSeek.Color',
    'Doubao.Color',
    'Llama.Color',
    'Mistral.Color',
  ],
  [
    'Grok.Color',
    'Kimi.Color',
    'GLM.Color',
    'Baichuan.Color',
    'Yi.Color',
    'StepFun.Color',
    'MiniMax.Color',
    'Zhipu.Color',
  ],
]

function useCountUp(end: number, duration = 1600, decimals = 0) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) {
      setValue(end)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true
          const start = performance.now()
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setValue(eased * end)
            if (progress < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
          observer.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [end, duration])

  const formatted =
    decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString()

  return { ref, formatted }
}

function Stat({
  end,
  suffix,
  label,
}: {
  end: number
  suffix: string
  label: string
}) {
  const { ref, formatted } = useCountUp(end)
  return (
    <div className='flex flex-col items-center text-center'>
      <span
        ref={ref}
        className='bg-gradient-to-r from-[#4c7bf5] to-[#c04fe0] bg-clip-text text-4xl font-bold tracking-[-0.02em] text-transparent tabular-nums md:text-5xl'
      >
        {formatted}
        {suffix}
      </span>
      <span className='text-muted-foreground mt-2.5 text-sm'>{label}</span>
    </div>
  )
}

function LogoChip({ iconName }: { iconName: string }) {
  return (
    <div className='glass-morphism group/card border-border/50 dark:border-border/20 flex shrink-0 items-center gap-2.5 rounded-2xl border px-5 py-3 transition-all duration-300 hover:scale-[1.04] hover:border-primary/30'>
      <div className='flex size-7 items-center justify-center'>
        {getLobeIcon(iconName, 26)}
      </div>
      <span className='text-sm font-medium text-foreground/70 transition-colors group-hover/card:text-foreground'>
        {iconName.split('.')[0]}
      </span>
    </div>
  )
}

function MarqueeRow({
  icons,
  reverse = false,
}: {
  icons: string[]
  reverse?: boolean
}) {
  return (
    <div className='marquee-container overflow-hidden'>
      <div
        className={`flex w-max gap-4 ${
          reverse ? 'animate-marquee-reverse' : 'animate-marquee'
        }`}
      >
        {icons.map((icon) => (
          <LogoChip key={`${icon}-a`} iconName={icon} />
        ))}
        {icons.map((icon) => (
          <LogoChip key={`${icon}-b`} iconName={icon} />
        ))}
      </div>
    </div>
  )
}

export function Models() {
  const { t } = useTranslation()

  const stats = [
    { end: 500, suffix: '+', label: t('Large Models Integrated') },
    { end: 50, suffix: '+', label: t('Upstream Services') },
    { end: 50, suffix: '+', label: t('Compatible API Routes') },
    { end: 99.9, suffix: '%', label: t('Service Uptime'), decimals: 1 },
  ]

  return (
    <section className='relative z-10 overflow-hidden border-y border-border bg-background'>
      <div className='mx-auto max-w-6xl px-6 py-20 md:py-24'>
        <AnimateInView className='mx-auto mb-12 max-w-2xl text-center md:mb-14'>
          <p className='mb-3 text-xs font-medium tracking-[0.18em] text-primary uppercase'>
            {t('Model Support')}
          </p>
          <h2 className='text-3xl leading-tight font-bold tracking-[-0.02em] md:text-4xl'>
            {t('500+ Large Models Integrated')}
          </h2>
          <p className='text-muted-foreground mx-auto mt-4 max-w-xl text-sm leading-relaxed md:text-base'>
            {t(
              'One-stop access to mainstream large language models, multimodal models and open-source models through a single unified API.'
            )}
          </p>
        </AnimateInView>

        {/* Marquee rows */}
        <div className='space-y-4'>
          <MarqueeRow icons={MODEL_ROWS[0]} />
          <MarqueeRow icons={MODEL_ROWS[1]} reverse />
        </div>

        {/* Stats */}
        <div className='mt-16 grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12'>
          {stats.map((s) => (
            <Stat
              key={s.label}
              end={s.end}
              suffix={s.suffix}
              label={s.label}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
