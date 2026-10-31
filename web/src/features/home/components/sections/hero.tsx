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
import { CherryStudio } from '@lobehub/icons'
import { Link } from '@tanstack/react-router'
import { ArrowRight, BookOpen, DollarSign, ShieldCheck, UsersRound, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { useStatus } from '@/hooks/use-status'
import { useSystemConfig } from '@/hooks/use-system-config'

import { HeroTerminalDemo } from '../hero-terminal-demo'

interface HeroProps {
  className?: string
  isAuthenticated?: boolean
}

// Stylized three-dots indicator representing "More"
const MoreIcon = () => (
  <svg
    className='text-muted-foreground/60 group-hover:text-foreground size-6 shrink-0 transition-colors'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <circle cx='6' cy='12' r='2' fill='currentColor' />
    <circle cx='12' cy='12' r='2' fill='currentColor' />
    <circle cx='18' cy='12' r='2' fill='currentColor' />
  </svg>
)

const chipCls =
  'flex items-center gap-1.5 rounded-full border border-white/70 bg-white/90 py-1.5 pl-1.5 pr-3 text-[11px] font-medium text-slate-600 shadow-[0_12px_28px_-20px_rgba(79,110,246,0.9)] backdrop-blur-sm'

// Decorative hero illustration: a glowing core surrounded by capability chips
const HeroVisual = () => {
  const { t } = useTranslation()

  return (
  <div className='relative mx-auto block aspect-[520/440] w-full max-w-[520px]'>
    {/* Orbit rings */}
    <svg
      viewBox='0 0 520 440'
      className='absolute inset-0 h-full w-full'
      aria-hidden='true'
    >
      <circle
        cx='292'
        cy='208'
        r='196'
        fill='none'
        stroke='#c7d2fe'
        strokeWidth='1'
        strokeDasharray='6 8'
        opacity='0.35'
      />
      <circle
        cx='292'
        cy='208'
        r='146'
        fill='none'
        stroke='#c7d2fe'
        strokeWidth='1'
        strokeDasharray='5 7'
        opacity='0.5'
      />
      <circle
        cx='292'
        cy='208'
        r='98'
        fill='none'
        stroke='#dbe4ff'
        strokeWidth='1'
        opacity='0.6'
      />
    </svg>

    {/* Orbiting particles */}
    <div className='pointer-events-none absolute top-[47%] left-[56%] size-[392px] -translate-x-1/2 -translate-y-1/2'>
      <div
        className='landing-orbit relative size-full'
        style={{ animationDuration: '34s' }}
      >
        <span className='absolute top-0 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-[#8b9dff] shadow-[0_0_8px_2px_rgba(139,157,255,0.45)]' />
        <span className='absolute bottom-0 left-1/2 size-1 -translate-x-1/2 rounded-full bg-[#c7d2fe]' />
      </div>
    </div>

    <div className='pointer-events-none absolute top-[47%] left-[56%] size-[292px] -translate-x-1/2 -translate-y-1/2'>
      <div
        className='landing-orbit-reverse relative size-full'
        style={{ animationDuration: '24s' }}
      >
        <span className='absolute top-0 left-1/2 size-2 -translate-x-1/2 rounded-full bg-[#a394fa] shadow-[0_0_10px_3px_rgba(163,148,250,0.4)]' />
      </div>
    </div>

    <div className='pointer-events-none absolute top-[47%] left-[56%] size-[196px] -translate-x-1/2 -translate-y-1/2'>
      <div
        className='landing-orbit relative size-full'
        style={{ animationDuration: '16s' }}
      >
        <span className='absolute bottom-0 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-[#e9a0f5] shadow-[0_0_8px_2px_rgba(233,160,245,0.4)]' />
      </div>
    </div>

    {/* Soft glow behind the core */}
    <div
      aria-hidden='true'
      className='absolute top-[47%] left-[56%] size-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(196,181,253,0.45),transparent_65%)] blur-[2px]'
    />

    {/* Stacked glossy core */}
    <div className='absolute top-[47%] left-[56%] h-[118px] w-[118px] -translate-x-1/2 -translate-y-1/2'>
      <div className='absolute inset-0 translate-y-5 rounded-[26px] bg-[#c7ccff]/35' />
      <div className='absolute inset-0 translate-y-2.5 rounded-[26px] bg-[#b6bcff]/55' />
      <div className='absolute inset-0 rounded-[26px] bg-gradient-to-br from-[#b4bfff] via-[#a394fa] to-[#7b5cf0] shadow-[0_26px_50px_-18px_rgba(124,92,240,0.65)]'>
        <div className='absolute inset-x-3 top-2.5 h-9 rounded-full bg-white/30 blur-[3px]' />
      </div>
    </div>

    {/* Frosted capability card */}
    <div className='absolute top-[22%] left-0 w-[186px] rounded-2xl border border-white/80 bg-white/85 p-2.5 shadow-[0_20px_44px_-26px_rgba(79,110,246,0.7)] backdrop-blur-md'>
      <div className='mb-2 flex gap-1'>
        <span className='size-1.5 rounded-full bg-[#fda4af]' />
        <span className='size-1.5 rounded-full bg-[#fcd34d]' />
        <span className='size-1.5 rounded-full bg-[#86efac]' />
      </div>
      <div className='rounded-md bg-[#f4f6fb] px-2 py-1.5 text-[9px] leading-snug text-slate-400'>
        {t('Multimodal understanding in progress...')}
      </div>
      <div className='mt-1.5 flex items-center justify-between rounded-md bg-white px-2 py-1.5 shadow-[0_2px_6px_-4px_rgba(15,23,42,0.25)]'>
        <span className='flex items-center gap-1 text-[9px] text-slate-600'>
          <span className='size-1.5 rounded-full bg-[#4f6ef6]' />
          {t('Multimodal understanding')}
        </span>
        <span className='relative h-2.5 w-[18px] rounded-full bg-[#4f6ef6]'>
          <span className='absolute top-0.5 right-0.5 size-1.5 rounded-full bg-white' />
        </span>
      </div>
      <div className='mt-2 border-t border-slate-100 pt-2'>
        <p className='text-[11px] leading-tight font-semibold text-[#4f6ef6]'>
          {t('Professional')}
          <br />
          {t('Operations')}
        </p>
        <p className='mt-1 text-[8.5px] leading-snug text-slate-400'>
          {t(
            'Advanced architecture ensures API stability and high availability.'
          )}
        </p>
      </div>
    </div>

    {/* Floating chips */}
    <div className={`absolute top-[6%] left-[27%] ${chipCls}`}>
      <span className='flex size-5 items-center justify-center rounded-full bg-[#eef1ff] text-[#4f6ef6]'>
        <DollarSign className='size-3' />
      </span>
      {t('Transparent Billing')}
    </div>

    <div className={`absolute top-[21%] right-[-3%] ${chipCls}`}>
      <span className='flex size-5 items-center justify-center rounded-full bg-[#fef7d6] text-[#eab308]'>
        <Zap className='size-3' />
      </span>
      {t('Ultra-high concurrency')}
    </div>

    <div className='absolute top-[40%] right-[-9%] flex size-7 items-center justify-center rounded-full border border-white/70 bg-white/90 shadow-[0_10px_22px_-16px_rgba(79,110,246,0.9)] backdrop-blur-sm'>
      <span className='flex size-5 items-center justify-center rounded-full bg-[#eef1ff] text-[#4f6ef6]'>
        <UsersRound className='size-3' />
      </span>
    </div>

    <div className={`absolute right-[2%] bottom-[22%] ${chipCls}`}>
      <span className='flex size-5 items-center justify-center rounded-full bg-[#e7f8ee] text-[#22c55e]'>
        <ShieldCheck className='size-3' />
      </span>
      {t('High stability')}
    </div>

    <div className={`absolute bottom-[2%] left-[42%] ${chipCls}`}>
      <span className='flex size-5 items-center justify-center rounded-full bg-[#e6f7f6] text-[#14b8a6]'>
        <UsersRound className='size-3' />
      </span>
      {t('Extensive support')}
    </div>

    <div className={`absolute bottom-[26%] left-[32%] ${chipCls}`}>
      <span className='flex size-5 items-center justify-center rounded-full bg-[#f3e8ff] text-[#a855f7]'>
        ¥
      </span>
      {t('Pay-as-you-go')}
    </div>
  </div>
  )
}

export function Hero(props: HeroProps) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const { systemName } = useSystemConfig()
  const docsUrl =
    (status?.docs_link as string | undefined) || 'https://docs.newapi.pro'

  const renderDocsButton = () => {
    const isExternal = docsUrl.startsWith('http')
    if (isExternal) {
      return (
        <Button
          variant='outline'
          className='group inline-flex h-12 items-center gap-1.5 rounded-full border-transparent bg-white px-7 text-sm font-semibold text-foreground shadow-[0_10px_24px_-16px_rgba(15,23,42,0.4)] hover:bg-white/90'
          render={
            <a href={docsUrl} target='_blank' rel='noopener noreferrer' />
          }
        >
          <BookOpen className='text-muted-foreground size-4 transition-colors duration-200 group-hover:text-foreground' />
          <span>{t('Docs')}</span>
        </Button>
      )
    }
    return (
      <Button
        variant='outline'
        className='group inline-flex h-12 items-center gap-1.5 rounded-full border-transparent bg-white px-7 text-sm font-semibold text-foreground shadow-[0_10px_24px_-16px_rgba(15,23,42,0.4)] hover:bg-white/90'
        render={<Link to={docsUrl} />}
      >
        <BookOpen className='text-muted-foreground size-4 transition-colors duration-200 group-hover:text-foreground' />
        <span>{t('Docs')}</span>
      </Button>
    )
  }

  return (
    <>
    <section className='relative flex h-svh flex-col justify-center overflow-hidden px-4 pt-16 md:px-10'>
      {/* Soft brand wash, matching the reference hero backdrop */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_0%,rgba(196,181,253,0.30),transparent_46%),radial-gradient(circle_at_4%_92%,rgba(147,197,253,0.28),transparent_42%)]'
      />

      <div className='relative mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-[1.05fr_1fr] md:gap-8 lg:gap-14'>
        {/* Left: brand word, headline, copy, actions */}
        <div className='flex flex-col items-start text-left'>
          <span
            className='landing-animate-fade-up bg-gradient-to-r from-[#3b6ef6] to-[#e05ce8] bg-clip-text text-[44px] leading-none font-bold tracking-[-0.02em] text-transparent md:text-[52px]'
            style={{ animationDelay: '0ms' }}
          >
            {systemName}
          </span>

          <h1
            className='landing-animate-fade-up mt-6 text-[28px] leading-[1.3] font-medium tracking-[-0.01em] text-foreground md:text-[34px] md:leading-[1.28]'
            style={{ animationDelay: '60ms' }}
          >
            {t('Unified API Gateway for')}
            <br />
            {t('Vast Range of AI Models')}
          </h1>

          <p
            className='landing-animate-fade-up mt-6 max-w-[520px] text-[16px] leading-[1.9] text-muted-foreground opacity-0'
            style={{ animationDelay: '120ms' }}
          >
            {t(
              'Access a vast selection of models via a standard, unified API protocol. Power AI applications, manage digital assets, and connect the Future.'
            )}
          </p>

          <div
            className='landing-animate-fade-up mt-10 flex flex-wrap items-center gap-3 opacity-0'
            style={{ animationDelay: '180ms' }}
          >
            {props.isAuthenticated ? (
              <>
                <Button
                  className='group h-12 rounded-full bg-gradient-to-r from-[#4c7bf5] via-[#7c6cf6] to-[#c04fe0] px-8 text-sm font-medium text-white shadow-[0_12px_28px_-12px_rgba(124,108,246,0.75)] hover:opacity-95'
                  render={<Link to='/dashboard' />}
                >
                  {t('Go to Dashboard')}
                  <ArrowRight className='ml-1.5 size-4 transition-transform duration-200 group-hover:translate-x-0.5' />
                </Button>
                {renderDocsButton()}
              </>
            ) : (
              <>
                <Button
                  className='group h-12 rounded-full bg-gradient-to-r from-[#4c7bf5] via-[#7c6cf6] to-[#c04fe0] px-8 text-sm font-medium text-white shadow-[0_12px_28px_-12px_rgba(124,108,246,0.75)] hover:opacity-95'
                  render={<Link to='/sign-in' />}
                >
                  {t('Get Started')}
                  <ArrowRight className='ml-1.5 size-4 transition-transform duration-200 group-hover:translate-x-0.5' />
                </Button>
                <Button
                  variant='outline'
                  className='h-12 rounded-full border-transparent bg-white px-7 text-sm font-semibold text-foreground shadow-[0_10px_24px_-16px_rgba(15,23,42,0.4)] hover:bg-white/90'
                  render={<Link to='/pricing' />}
                >
                  {t('View Pricing')}
                </Button>
                {renderDocsButton()}
              </>
            )}
          </div>
        </div>

        {/* Right: decorative capability illustration */}
        <div
          className='landing-animate-fade-up w-full opacity-0'
          style={{ animationDelay: '320ms' }}
        >
          <HeroVisual />
        </div>
      </div>

    </section>

    {/* Next screen: live API demo + supported apps */}
    <section className='relative px-4 pb-24 md:px-10'>
      <div className='mx-auto w-full max-w-4xl'>
        <HeroTerminalDemo className='w-full' />
      </div>

      {/* Supported Apps */}
      <div
        className='landing-animate-fade-up relative mx-auto mt-16 w-full max-w-6xl opacity-0'
        style={{ animationDelay: '400ms' }}
      >
        <div className='mb-4 flex flex-col gap-1.5'>
          <span className='text-muted-foreground/50 text-[10px] font-bold tracking-[0.15em] uppercase'>
            {t('Supported Applications')}
          </span>
          <p className='text-muted-foreground/60 max-w-xl text-xs leading-relaxed'>
            {t(
              'Supports one-click configuration and perfectly adapts to NewAPI multi-protocol configuration.'
            )}
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-3'>
          {/* Cherry Studio */}
          <a
            href='https://cherry-ai.com'
            target='_blank'
            rel='noopener noreferrer'
            className='group flex items-center gap-3 rounded-full border border-transparent bg-white px-5 py-2.5 text-sm font-medium text-foreground/80 shadow-[0_6px_16px_-12px_rgba(15,23,42,0.45)] transition-all duration-300 hover:scale-[1.02] hover:text-foreground'
          >
            <CherryStudio.Color size={24} className='shrink-0' />
            <span>Cherry Studio</span>
          </a>

          {/* CC Switch */}
          <a
            href='https://ccswitch.io'
            target='_blank'
            rel='noopener noreferrer'
            className='group flex items-center gap-3 rounded-full border border-transparent bg-white px-5 py-2.5 text-sm font-medium text-foreground/80 shadow-[0_6px_16px_-12px_rgba(15,23,42,0.45)] transition-all duration-300 hover:scale-[1.02] hover:text-foreground'
          >
            <img
              src='https://ccswitch.io/favicon.png'
              alt='CC Switch'
              className='size-6 shrink-0 rounded-md object-contain'
              onError={(e) => {
                // Fallback to a styled text avatar if the remote favicon fails to load in sandbox or local environments
                e.currentTarget.style.display = 'none'
                const fallback = e.currentTarget.nextSibling as HTMLElement
                if (fallback) fallback.style.display = 'flex'
              }}
            />
            <span
              style={{ display: 'none' }}
              className='bg-primary/10 text-primary size-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold'
            >
              CC
            </span>
            <span>CC Switch</span>
          </a>

          {/* "更多" */}
          <div className='group flex cursor-default items-center gap-2.5 rounded-full border border-transparent bg-white px-5 py-2.5 text-sm font-medium text-foreground/55 shadow-[0_6px_16px_-12px_rgba(15,23,42,0.45)] transition-all duration-300 hover:scale-[1.02] hover:text-foreground'>
            <MoreIcon />
            <span>{t('More Apps')}</span>
          </div>
        </div>
      </div>
    </section>
    </>
  )
}
