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
import { useTranslation } from 'react-i18next'

import { getPasswordStrength, type PasswordStrength } from '@/lib/password-strength'
import { cn } from '@/lib/utils'

const STRENGTH_META: Record<
  Exclude<PasswordStrength, 0>,
  { labelKey: string; barClassName: string; textClassName: string }
> = {
  1: {
    labelKey: 'Weak',
    barClassName: 'bg-red-500',
    textClassName: 'text-red-500',
  },
  2: {
    labelKey: 'Medium',
    barClassName: 'bg-orange-500',
    textClassName: 'text-orange-500',
  },
  3: {
    labelKey: 'Strong',
    barClassName: 'bg-yellow-500',
    textClassName: 'text-yellow-600',
  },
  4: {
    labelKey: 'Very strong',
    barClassName: 'bg-green-500',
    textClassName: 'text-green-600',
  },
}

interface PasswordStrengthMeterProps {
  password: string
  className?: string
}

export function PasswordStrengthMeter({
  password,
  className,
}: PasswordStrengthMeterProps) {
  const { t } = useTranslation()
  const strength = getPasswordStrength(password)

  // Show an empty meter when no password or too short
  if (strength === 0) {
    return (
      <div
        className={cn('mt-2 flex flex-col gap-1.5', className)}
        role='status'
        aria-live='polite'
      >
        <div className='flex gap-1.5' aria-hidden='true'>
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className='h-1.5 flex-1 rounded-full bg-border transition-colors'
            />
          ))}
        </div>
      </div>
    )
  }

  const meta = STRENGTH_META[strength]

  return (
    <div
      className={cn('mt-2 flex flex-col gap-1.5', className)}
      role='status'
      aria-live='polite'
    >
      <div className='flex gap-1.5' aria-hidden='true'>
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              level <= strength ? meta.barClassName : 'bg-border'
            )}
          />
        ))}
      </div>
      <p className={cn('text-xs', meta.textClassName)}>{t(meta.labelKey)}</p>
    </div>
  )
}
