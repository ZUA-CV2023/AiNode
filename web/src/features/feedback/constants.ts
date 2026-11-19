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
import type { TFunction } from 'i18next'

import type { StatusBadgeProps } from '@/components/status-badge'

import type { FeedbackCategory, FeedbackStatus } from './types'

// labelKey values are i18n keys; use t(config.labelKey) in components.
export const FEEDBACK_CATEGORIES: {
  value: FeedbackCategory
  labelKey: string
}[] = [
  { value: 'bug', labelKey: 'Bug' },
  { value: 'feature', labelKey: 'Feature Request' },
  { value: 'other', labelKey: 'Other' },
]

export const FEEDBACK_STATUSES: Record<
  FeedbackStatus,
  Pick<StatusBadgeProps, 'variant'> & { labelKey: string; value: FeedbackStatus }
> = {
  pending: {
    labelKey: 'Pending',
    variant: 'warning',
    value: 'pending',
  },
  processing: {
    labelKey: 'Processing',
    variant: 'info',
    value: 'processing',
  },
  resolved: {
    labelKey: 'Resolved',
    variant: 'success',
    value: 'resolved',
  },
  ignored: {
    labelKey: 'Ignored',
    variant: 'neutral',
    value: 'ignored',
  },
}

export const FEEDBACK_STATUS_VALUES = Object.keys(
  FEEDBACK_STATUSES
) as FeedbackStatus[]

export function getFeedbackCategoryLabelKey(category: string): string {
  return (
    FEEDBACK_CATEGORIES.find((item) => item.value === category)?.labelKey ??
    category
  )
}

export function getFeedbackStatusConfig(status: string) {
  return FEEDBACK_STATUSES[status as FeedbackStatus]
}

export function getFeedbackCategoryOptions(t: TFunction) {
  return FEEDBACK_CATEGORIES.map((category) => ({
    label: t(category.labelKey),
    value: category.value,
  }))
}

export function getFeedbackStatusOptions(t: TFunction) {
  return FEEDBACK_STATUS_VALUES.map((status) => ({
    label: t(FEEDBACK_STATUSES[status].labelKey),
    value: status,
  }))
}
