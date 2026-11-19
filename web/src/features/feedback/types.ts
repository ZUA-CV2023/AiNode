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
export type FeedbackCategory = 'bug' | 'feature' | 'other'

export type FeedbackStatus = 'pending' | 'processing' | 'resolved' | 'ignored'

export interface Feedback {
  id: number
  user_id: number
  category: FeedbackCategory
  content: string
  contact: string
  page_url: string
  user_agent: string
  status: FeedbackStatus
  admin_note: string
  created_at: number
  updated_at: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
}

export interface FeedbackListParams {
  p?: number
  page_size?: number
  status?: string
  category?: string
  keyword?: string
}

export interface FeedbackListResponse {
  success: boolean
  message?: string
  data?: {
    items: Feedback[]
    total: number
    page: number
    page_size: number
  }
}

export interface FeedbackSubmitData {
  category: FeedbackCategory
  content: string
  contact?: string
  page_url: string
}

export interface FeedbackUpdateData {
  status: FeedbackStatus
  admin_note: string
}
