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
import { Settings, Wallet, ShieldCheck, Headphones } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'

export function Features() {
  const { t } = useTranslation()

  const features = [
    {
      id: 'operations',
      icon: Settings,
      title: t('Professional Operations'),
      desc: t(
        'Advanced scheduling, routing and caching architecture keeps your API stable and highly available under any load.'
      ),
      tags: [t('Load Balancing'), t('Rate Limiting'), t('Prompt Caching')],
    },
    {
      id: 'billing',
      icon: Wallet,
      title: t('Pay-as-you-go'),
      desc: t(
        'Flexible billing with no upfront commitment. Top up on demand and only pay for the tokens you actually consume.'
      ),
      tags: [t('Real-time Billing'), t('Usage Reports'), t('Cost Alerts')],
    },
    {
      id: 'stability',
      icon: ShieldCheck,
      title: t('High Stability'),
      desc: t(
        'Automatic failover across multiple upstream providers ensures uninterrupted service even when individual channels fail.'
      ),
      tags: [t('Auto Failover'), t('Health Checks'), t('Retry Logic')],
    },
    {
      id: 'support',
      icon: Headphones,
      title: t('Extensive Support'),
      desc: t(
        'Compatible with OpenAI, Claude, Gemini and dozens more protocols. Drop-in replacement for your existing integrations.'
      ),
      tags: [t('Multi-protocol'), t('SDK Ready'), t('Docs & Guides')],
    },
  ]

  return (
    <section className='relative z-10 bg-muted/30 px-6 py-24 md:py-28'>
      <div className='mx-auto max-w-6xl'>
        <AnimateInView className='mx-auto mb-14 max-w-2xl text-center md:mb-16'>
          <p className='mb-3 text-xs font-medium tracking-[0.18em] text-primary uppercase'>
            {t('Core Capabilities')}
          </p>
          <h2 className='text-3xl leading-tight font-bold tracking-[-0.02em] md:text-4xl'>
            {t('Everything you need to')}
            <br />
            {t('ship AI products')}
          </h2>
        </AnimateInView>

        <div className='grid gap-6 md:grid-cols-2 md:gap-8'>
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <AnimateInView
                key={f.id}
                delay={i * 100}
                animation='fade-up'
                className='group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_18px_40px_-24px_rgba(15,23,42,0.18)]'
              >
                <div className='flex items-start gap-4'>
                  <div className='flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground'>
                    <Icon className='size-6' strokeWidth={1.8} />
                  </div>
                  <div className='min-w-0'>
                    <h3 className='mb-2 text-lg font-semibold'>{f.title}</h3>
                    <p className='text-muted-foreground text-sm leading-relaxed'>
                      {f.desc}
                    </p>
                  </div>
                </div>

                <div className='mt-6 flex flex-wrap gap-2'>
                  {f.tags.map((tag) => (
                    <span
                      key={tag}
                      className='rounded-full border border-border bg-muted/60 px-3 py-1 text-xs text-muted-foreground transition-colors duration-300 group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary'
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </AnimateInView>
            )
          })}
        </div>
      </div>
    </section>
  )
}
