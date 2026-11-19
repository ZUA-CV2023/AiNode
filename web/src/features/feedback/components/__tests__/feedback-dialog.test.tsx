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
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  submitFeedback: vi.fn(),
}))

vi.mock('../../api', () => ({
  submitFeedback: mocks.submitFeedback,
}))

const { FeedbackDialog } = await import('../feedback-dialog')

const privacyNotice =
  'Your account and the current page will be recorded with this submission and used only to improve the product.'
const contentPlaceholder =
  'Please describe the issue or suggestion (10-2000 characters)'
const validationMessage =
  'Feedback content must be between 10 and 2000 characters'

describe('FeedbackDialog', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('shows the privacy notice above the submit action', () => {
    render(<FeedbackDialog open onOpenChange={vi.fn()} />)

    expect(screen.getByText(privacyNotice)).toBeInTheDocument()
  })

  test('rejects content shorter than 10 characters without calling the API', async () => {
    const onOpenChange = vi.fn()
    render(<FeedbackDialog open onOpenChange={onOpenChange} />)

    fireEvent.change(screen.getByPlaceholderText(contentPlaceholder), {
      target: { value: 'short' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    expect(await screen.findByText(validationMessage)).toBeInTheDocument()
    expect(mocks.submitFeedback).not.toHaveBeenCalled()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  test('submits trimmed content with the current page URL', async () => {
    mocks.submitFeedback.mockResolvedValue({ success: true, data: { id: 12 } })
    const onOpenChange = vi.fn()
    render(<FeedbackDialog open onOpenChange={onOpenChange} />)

    fireEvent.change(screen.getByPlaceholderText(contentPlaceholder), {
      target: { value: '  Please remember my last category.  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(mocks.submitFeedback).toHaveBeenCalledTimes(1))
    expect(mocks.submitFeedback).toHaveBeenCalledWith({
      category: 'bug',
      content: 'Please remember my last category.',
      contact: undefined,
      page_url: window.location.href,
    })
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })
})
