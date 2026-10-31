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
import { Activity, ShieldCheck, Receipt } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'

export function Advantage() {
  const { t } = useTranslation()

  const cards = [
    {
      id: 'availability',
      icon: Activity,
      title: t('High-Availability Access'),
      desc: t(
        'Multi-region deployment with intelligent load balancing keeps your API requests flowing smoothly even under peak traffic.'
      ),
      accent: 'from-[#4c7bf5] to-[#7c6cf6]',
    },
    {
      id: 'guarantee',
      icon: ShieldCheck,
      title: t('Service Guarantee'),
      desc: t(
        'Enterprise-grade SLA with automatic failover and real-time monitoring ensures stable and reliable service around the clock.'
      ),
      accent: 'from-[#7c6cf6] to-[#c04fe0]',
    },
    {
      id: 'billing',
      icon: Receipt,
      title: t('Transparent Billing'),
      desc: t(
        'Pay-as-you-go with no hidden fees. Real-time usage tracking and detailed cost reports keep every token accounted for.'
      ),
      accent: 'from-[#c04fe0] to-[#f472b6]',
    },
  ]

  return (
    <section className='relative z-10 px-6 py-24 md:py-28'>
      <div className='mx-auto max-w-6xl'>
        <AnimateInView className='mx-auto mb-14 max-w-2xl text-center md:mb-16'>
          <p className='mb-3 text-xs font-medium tracking-[0.18em] text-primary uppercase'>
            {t('Our Advantage')}
          </p>
          <h2 className='text-3xl leading-tight font-bold tracking-[-0.02em] md:text-4xl'>
            {t('Built for production,')}
            <br />
            {t('trusted at scale')}
          </h2>
        </AnimateInView>

        <div className='grid gap-6 md:grid-cols-3 md:gap-8'>
          {cards.map((card, i) => {
            const Icon = card.icon
            return (
              <AnimateInView
                key={card.id}
                delay={i * 120}
                animation='fade-up'
                className='group relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(15,23,42,0.18)]'
              >
                <div
                  className={`absolute -top-12 -right-12 size-32 rounded-full bg-gradient-to-br ${card.accent} opacity-[0.08] blur-2xl transition-opacity duration-300 group-hover:opacity-[0.16]`}
                />
                <div className='relative'>
                  <div
                    className={`mb-5 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.accent} text-white shadow-lg`}
                  >
                    <Icon className='size-6' strokeWidth={1.8} />
                  </div>
                  <h3 className='mb-2.5 text-lg font-semibold'>
                    {card.title}
                  </h3>
                  <p className='text-muted-foreground text-sm leading-relaxed'>
                    {card.desc}
                  </p>
                </div>
              </AnimateInView>
            )
          })}
        </div>
      </div>
    </section>
  )
}
