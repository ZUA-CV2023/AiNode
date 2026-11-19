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
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { handleServerError } from '@/lib/handle-server-error'

import { submitFeedback } from '../api'
import { FEEDBACK_CATEGORIES } from '../constants'

const feedbackFormId = 'feedback-form'

const feedbackFormSchema = z.object({
  category: z.enum(['bug', 'feature', 'other']),
  content: z
    .string()
    .trim()
    .min(10, 'Feedback content must be between 10 and 2000 characters')
    .max(2000, 'Feedback content must be between 10 and 2000 characters'),
  contact: z
    .string()
    .trim()
    .max(255, 'Contact information must be 255 characters or fewer')
    .optional(),
})

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>

const emptyFeedbackForm: FeedbackFormValues = {
  category: 'bug',
  content: '',
  contact: '',
}

interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FeedbackDialog(props: FeedbackDialogProps) {
  const { t } = useTranslation()
  const [submitting, setSubmitting] = useState(false)
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: emptyFeedbackForm,
  })
  const contentValue = form.watch('content')
  const contentLength = [...(contentValue ?? '')].length

  useEffect(() => {
    if (props.open) {
      form.reset(emptyFeedbackForm)
    }
  }, [props.open, form])

  const submit = async (values: FeedbackFormValues) => {
    setSubmitting(true)
    try {
      const result = await submitFeedback({
        category: values.category,
        content: values.content,
        contact: values.contact?.trim() || undefined,
        page_url: typeof window === 'undefined' ? '' : window.location.href,
      })
      if (!result.success) {
        handleServerError(result, t('Failed to submit feedback'))
        return
      }
      toast.success(t('Feedback submitted. Thank you!'))
      props.onOpenChange(false)
    } catch (error) {
      handleServerError(error, t('Failed to submit feedback'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={t('Submit Feedback')}
      description={t(
        'Tell us about a bug, a feature request, or anything else.'
      )}
      contentClassName='sm:max-w-lg'
      footer={
        <>
          <Button
            type='button'
            variant='outline'
            disabled={submitting}
            onClick={() => props.onOpenChange(false)}
          >
            {t('Cancel')}
          </Button>
          <Button type='submit' form={feedbackFormId} disabled={submitting}>
            {submitting && <Loader2 className='size-4 animate-spin' />}
            {t('Submit')}
          </Button>
        </>
      }
    >
      <Form {...form}>
        <form
          id={feedbackFormId}
          onSubmit={form.handleSubmit(submit)}
          className='space-y-4'
        >
          <FormField
            control={form.control}
            name='category'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Feedback Type')}</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    if (value) field.onChange(value)
                  }}
                  disabled={submitting}
                >
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FEEDBACK_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {t(category.labelKey)}
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
            name='content'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Feedback Content')}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={6}
                    maxLength={2000}
                    disabled={submitting}
                    placeholder={t(
                      'Please describe the issue or suggestion (10-2000 characters)'
                    )}
                  />
                </FormControl>
                <div className='text-muted-foreground flex items-start justify-between gap-3 text-xs'>
                  <FormDescription>
                    {t(
                      'Please describe the issue or suggestion (10-2000 characters)'
                    )}
                  </FormDescription>
                  <span className='shrink-0 tabular-nums'>
                    {contentLength}/2000
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='contact'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Contact (optional)')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    maxLength={255}
                    disabled={submitting}
                    placeholder={t('Email or WeChat (optional)')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <p className='text-muted-foreground text-xs leading-relaxed'>
            {t(
              'Your account and the current page will be recorded with this submission and used only to improve the product.'
            )}
          </p>
        </form>
      </Form>
    </Dialog>
  )
}
