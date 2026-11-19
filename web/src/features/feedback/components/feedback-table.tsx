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
import { useQuery } from '@tanstack/react-query'
import type { ColumnFiltersState, PaginationState } from '@tanstack/react-table'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DataTablePage, useDataTable } from '@/components/data-table'
import { createServerError } from '@/lib/server-error-message'

import { getFeedbackList } from '../api'
import {
  getFeedbackCategoryOptions,
  getFeedbackStatusOptions,
} from '../constants'
import type { Feedback } from '../types'
import { useFeedbackColumns } from './feedback-columns'

interface FeedbackTableProps {
  onView: (feedback: Feedback) => void
}

export function FeedbackTable(props: FeedbackTableProps) {
  const { t } = useTranslation()
  const columns = useFeedbackColumns(props.onView)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const statusFilter =
    (columnFilters.find((filter) => filter.id === 'status')?.value as
      | string[]
      | undefined) ?? []
  const categoryFilter =
    (columnFilters.find((filter) => filter.id === 'category')?.value as
      | string[]
      | undefined) ?? []
  const statusFilterValue = statusFilter[0] ?? ''
  const categoryFilterValue = categoryFilter[0] ?? ''

  useEffect(() => {
    setPagination((previous) =>
      previous.pageIndex === 0 ? previous : { ...previous, pageIndex: 0 }
    )
  }, [globalFilter, statusFilterValue, categoryFilterValue])

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      'feedback',
      'list',
      pagination.pageIndex + 1,
      pagination.pageSize,
      globalFilter,
      statusFilterValue,
      categoryFilterValue,
    ],
    queryFn: async () => {
      const result = await getFeedbackList({
        p: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        status: statusFilterValue,
        category: categoryFilterValue,
        keyword: globalFilter.trim(),
      })
      if (!result.success) {
        throw createServerError(result, t('Failed to load feedback'))
      }
      return {
        items: result.data?.items ?? [],
        total: result.data?.total ?? 0,
      }
    },
    placeholderData: (previousData) => previousData,
  })

  const feedback = data?.items ?? []

  const ensurePageInRange = useCallback((pageCount: number) => {
    setPagination((previous) => {
      if (pageCount <= 0 || previous.pageIndex < pageCount) return previous
      return { ...previous, pageIndex: Math.max(0, pageCount - 1) }
    })
  }, [])

  const { table } = useDataTable({
    data: feedback,
    columns,
    columnFilters,
    globalFilter,
    pagination,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    manualPagination: true,
    manualFiltering: true,
    totalCount: data?.total ?? 0,
    ensurePageInRange,
  })

  const statusOptions = useMemo(() => getFeedbackStatusOptions(t), [t])
  const categoryOptions = useMemo(() => getFeedbackCategoryOptions(t), [t])
  const hasFilters = Boolean(
    globalFilter.trim() || statusFilterValue || categoryFilterValue
  )

  return (
    <DataTablePage
      table={table}
      columns={columns}
      isLoading={isLoading}
      isFetching={isFetching}
      emptyTitle={t(hasFilters ? 'No feedback matches the current filters.' : 'No feedback yet')}
      emptyDescription={t(
        hasFilters
          ? 'Try changing the keyword, status, or type filter.'
          : 'User submissions will appear here.'
      )}
      skeletonKeyPrefix='feedback-skeleton'
      applyHeaderSize
      toolbarProps={{
        searchPlaceholder: t(
          'Search feedback by content, contact, page, or user ID...'
        ),
        searchDebounceMs: 500,
        filters: [
          {
            columnId: 'status',
            title: t('Status'),
            options: statusOptions,
            singleSelect: true,
          },
          {
            columnId: 'category',
            title: t('Type'),
            options: categoryOptions,
            singleSelect: true,
          },
        ],
      }}
    />
  )
}
