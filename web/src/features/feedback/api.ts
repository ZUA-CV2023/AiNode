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
import { api } from '@/lib/api'

import type {
  ApiResponse,
  Feedback,
  FeedbackListParams,
  FeedbackListResponse,
  FeedbackSubmitData,
  FeedbackUpdateData,
} from './types'

export async function submitFeedback(
  data: FeedbackSubmitData
): Promise<ApiResponse<{ id: number }>> {
  const res = await api.post('/api/feedback', data)
  return res.data
}

export async function getMyFeedback(
  params: Pick<FeedbackListParams, 'p' | 'page_size'> = {}
): Promise<FeedbackListResponse> {
  const query = new URLSearchParams()
  query.set('p', String(params.p ?? 1))
  query.set('page_size', String(params.page_size ?? 20))
  const res = await api.get(`/api/feedback?${query.toString()}`)
  return res.data
}

export async function getFeedbackList(
  params: FeedbackListParams = {}
): Promise<FeedbackListResponse> {
  const query = new URLSearchParams()
  query.set('p', String(params.p ?? 1))
  query.set('page_size', String(params.page_size ?? 20))
  if (params.status) query.set('status', params.status)
  if (params.category) query.set('category', params.category)
  if (params.keyword) query.set('keyword', params.keyword)
  const res = await api.get(`/api/feedback/list?${query.toString()}`)
  return res.data
}

export async function updateFeedback(
  id: number,
  data: FeedbackUpdateData
): Promise<ApiResponse<Feedback>> {
  const res = await api.put(`/api/feedback/${id}`, data)
  return res.data
}
