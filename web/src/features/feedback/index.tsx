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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SectionPageLayout } from '@/components/layout'

import { FeedbackDetailDialog } from './components/feedback-detail-dialog'
import { FeedbackTable } from './components/feedback-table'
import type { Feedback } from './types'

export function FeedbackManagement() {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<Feedback | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const openDetail = (feedback: Feedback) => {
    setSelected(feedback)
    setDetailOpen(true)
  }

  return (
    <>
      <SectionPageLayout fixedContent>
        <SectionPageLayout.Title>
          {t('Feedback Management')}
        </SectionPageLayout.Title>
        <SectionPageLayout.Content>
          <FeedbackTable onView={openDetail} />
        </SectionPageLayout.Content>
      </SectionPageLayout>

      {selected && (
        <FeedbackDetailDialog
          feedback={selected}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      )}
    </>
  )
}
