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
import type { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import { TruncatedCell } from '@/components/data-table'
import { StatusBadge } from '@/components/status-badge'
import { TableId } from '@/components/table-id'
import { formatTimestampToDate } from '@/lib/format'

import {
  getFeedbackCategoryLabelKey,
  getFeedbackStatusConfig,
} from '../constants'
import type { Feedback } from '../types'
import { FeedbackRowActions } from './feedback-row-actions'

export function useFeedbackColumns(
  onView: (feedback: Feedback) => void
): ColumnDef<Feedback>[] {
  const { t } = useTranslation()

  return [
    {
      accessorKey: 'id',
      header: t('ID'),
      meta: { mobileHidden: true },
      cell: ({ row }) => (
        <TableId value={row.getValue('id') as number} className='w-[60px]' />
      ),
      size: 80,
    },
    {
      id: 'user',
      header: t('User'),
      meta: { mobileBadge: true },
      cell: ({ row }) => {
        const feedback = row.original
        const label = feedback.user_deleted
          ? t('Deleted user')
          : feedback.username ||
            feedback.email ||
            t('User {{id}}', { id: feedback.user_id })
        return (
          <StatusBadge
            label={label}
            variant='neutral'
            copyable={false}
            className='-ml-1.5'
          />
        )
      },
      size: 160,
    },
    {
      accessorKey: 'category',
      header: t('Type'),
      meta: { mobileBadge: true },
      cell: ({ row }) => (
        <StatusBadge
          label={t(getFeedbackCategoryLabelKey(row.original.category))}
          variant='neutral'
          copyable={false}
          className='-ml-1.5'
        />
      ),
      size: 130,
    },
    {
      accessorKey: 'content',
      header: t('Content'),
      meta: { mobileTitle: true },
      cell: ({ row }) => (
        <TruncatedCell className='max-w-[360px]'>
          {row.original.content}
        </TruncatedCell>
      ),
      enableSorting: false,
      size: 380,
    },
    {
      accessorKey: 'status',
      header: t('Status'),
      meta: { mobileBadge: true },
      cell: ({ row }) => {
        const config = getFeedbackStatusConfig(row.original.status)
        return (
          <StatusBadge
            label={config ? t(config.labelKey) : row.original.status}
            variant={config?.variant ?? 'neutral'}
            copyable={false}
            className='-ml-1.5'
          />
        )
      },
      size: 120,
    },
    {
      accessorKey: 'created_at',
      header: t('Created'),
      meta: { mobileHidden: true },
      cell: ({ row }) => (
        <div className='min-w-[160px] font-mono text-sm'>
          {formatTimestampToDate(row.getValue('created_at') as number)}
        </div>
      ),
      size: 180,
    },
    {
      id: 'actions',
      header: () => t('Actions'),
      cell: ({ row }) => (
        <FeedbackRowActions feedback={row.original} onView={onView} />
      ),
      meta: { pinned: 'right' as const },
    },
  ]
}
