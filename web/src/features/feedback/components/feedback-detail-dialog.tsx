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
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import { Dialog } from '@/components/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { handleServerError } from '@/lib/handle-server-error'
import { createServerError } from '@/lib/server-error-message'
import { formatTimestampToDate } from '@/lib/format'

import { updateFeedback } from '../api'
import {
  FEEDBACK_STATUS_VALUES,
  FEEDBACK_STATUSES,
  getFeedbackCategoryLabelKey,
} from '../constants'
import type { Feedback, FeedbackStatus } from '../types'

const feedbackDetailFormId = 'feedback-detail-form'

const feedbackDetailSchema = z.object({
  status: z.enum(['pending', 'processing', 'resolved', 'ignored']),
  admin_note: z
    .string()
    .trim()
    .max(2000, 'Admin note must be 2000 characters or fewer'),
})

type FeedbackDetailValues = z.infer<typeof feedbackDetailSchema>

interface FeedbackDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feedback: Feedback
}

export function FeedbackDetailDialog(props: FeedbackDetailDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const form = useForm<FeedbackDetailValues>({
    resolver: zodResolver(feedbackDetailSchema),
    defaultValues: {
      status: props.feedback.status,
      admin_note: props.feedback.admin_note,
    },
  })

  useEffect(() => {
    form.reset({
      status: props.feedback.status,
      admin_note: props.feedback.admin_note,
    })
  }, [props.feedback, form])

  const mutation = useMutation({
    mutationFn: async (values: FeedbackDetailValues) => {
      const result = await updateFeedback(props.feedback.id, {
        status: values.status,
        admin_note: values.admin_note,
      })
      if (!result.success) {
        throw createServerError(result, t('Failed to update feedback'))
      }
      return result
    },
    onSuccess: () => {
      toast.success(t('Feedback updated'))
      queryClient.invalidateQueries({ queryKey: ['feedback'] })
      props.onOpenChange(false)
    },
    onError: (error) => {
      handleServerError(error, t('Failed to update feedback'))
    },
  })

  const pageUrl = props.feedback.page_url
  const pageUrlIsLink =
    pageUrl.startsWith('http://') || pageUrl.startsWith('https://')

  let pageUrlContent: ReactNode = '-'
  if (pageUrl) {
    pageUrlContent = pageUrlIsLink ? (
      <a
        href={pageUrl}
        target='_blank'
        rel='noreferrer'
        className='text-primary hover:underline'
      >
        {pageUrl}
      </a>
    ) : (
      pageUrl
    )
  }

  return (
    <Dialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={t('Feedback Details')}
      description={`#${props.feedback.id}`}
      contentClassName='sm:max-w-2xl'
      footer={
        <>
          <Button
            type='button'
            variant='outline'
            disabled={mutation.isPending}
            onClick={() => props.onOpenChange(false)}
          >
            {t('Cancel')}
          </Button>
          <Button
            type='submit'
            form={feedbackDetailFormId}
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Loader2 className='size-4 animate-spin' />}
            {t('Save Changes')}
          </Button>
        </>
      }
    >
      <div className='space-y-4'>
        <dl className='grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm'>
          <dt className='text-muted-foreground'>{t('User ID')}</dt>
          <dd>{props.feedback.user_id}</dd>
          <dt className='text-muted-foreground'>{t('Type')}</dt>
          <dd>
            {t(getFeedbackCategoryLabelKey(props.feedback.category))}
          </dd>
          <dt className='text-muted-foreground'>{t('Status')}</dt>
          <dd>
            {t(
              FEEDBACK_STATUSES[props.feedback.status]?.labelKey ??
                props.feedback.status
            )}
          </dd>
          <dt className='text-muted-foreground'>{t('Submitted at')}</dt>
          <dd className='font-mono'>
            {formatTimestampToDate(props.feedback.created_at)}
          </dd>
          <dt className='text-muted-foreground'>{t('Contact')}</dt>
          <dd className='break-all'>{props.feedback.contact || '-'}</dd>
          <dt className='text-muted-foreground'>{t('Page')}</dt>
          <dd className='break-all'>{pageUrlContent}</dd>
          <dt className='text-muted-foreground'>{t('User Agent')}</dt>
          <dd className='break-all'>{props.feedback.user_agent || '-'}</dd>
        </dl>

        <div>
          <p className='text-muted-foreground mb-2 text-sm'>{t('Content')}</p>
          <p className='bg-muted/40 rounded-lg p-3 text-sm whitespace-pre-wrap break-words'>
            {props.feedback.content}
          </p>
        </div>

        <Form {...form}>
          <form
            id={feedbackDetailFormId}
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className='space-y-4 border-t pt-4'
          >
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Status')}</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      if (value) field.onChange(value as FeedbackStatus)
                    }}
                    disabled={mutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full sm:w-56'>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FEEDBACK_STATUS_VALUES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {t(FEEDBACK_STATUSES[status].labelKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='admin_note'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Admin Note')}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      maxLength={2000}
                      disabled={mutation.isPending}
                      placeholder={t(
                        'Add an internal note about how this feedback was handled.'
                      )}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('Only administrators can see this note.')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </Dialog>
  )
}
