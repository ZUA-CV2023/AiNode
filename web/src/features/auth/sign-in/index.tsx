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
import { Link, useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { useStatus } from '@/hooks/use-status'
import { useSystemConfig } from '@/hooks/use-system-config'

import { AuthLayout } from '../auth-layout'
import { TermsFooter } from '../components/terms-footer'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { t } = useTranslation()
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })
  const { status } = useStatus()
  const { logo } = useSystemConfig()

  const hasTerms = Boolean(
    status?.user_agreement_enabled || status?.privacy_policy_enabled
  )

  return (
    <AuthLayout>
      <div className='flex w-full flex-1 flex-col justify-center'>
        <div className='flex flex-col items-center'>
          <div
            aria-hidden='true'
            className='flex size-14 items-center justify-center overflow-hidden rounded-2xl ring-1 ring-black/5'
          >
            <img src={logo} alt={t('Logo')} className='size-full object-cover' />
          </div>

          <h2 className='text-foreground mt-4 text-center text-2xl font-semibold tracking-tight'>
            {t('Sign in')}
          </h2>

          <div className='mt-9 w-full'>
            <UserAuthForm redirectTo={redirect} />
          </div>
        </div>

        <div className='border-border/60 mt-10 flex flex-col gap-3 border-t pt-6'>
          <p className='text-muted-foreground text-center text-sm'>
            {t("Don't have an account?")}{' '}
            <Link
              to='/sign-up'
              className='text-primary font-medium hover:opacity-80'
            >
              {t('Sign up')}
            </Link>
          </p>

          {hasTerms && (
            <TermsFooter
              variant='sign-in'
              status={status}
              className='text-center'
            />
          )}
        </div>
      </div>
    </AuthLayout>
  )
}
