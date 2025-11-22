'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

const waitlistSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  whatsapp: z
    .string()
    .regex(/^\d{10}$/, 'Please enter a valid 10-digit WhatsApp number')
    .optional()
    .or(z.literal('')),
})

type WaitlistFormData = z.infer<typeof waitlistSchema>

interface WaitlistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WaitlistDialog({ open, onOpenChange }: WaitlistDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      email: '',
      whatsapp: '',
    },
  })

  const onSubmit = async (data: WaitlistFormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          whatsapp: data.whatsapp || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to join waitlist')
      }

      // Success
      toast.success('Welcome! You\'ve joined the waitlist 🎉', {
        description: 'We\'ll reach out to you soon with updates.',
      })

      // Reset form and close dialog
      reset()
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred'
      toast.error('Oops! Something went wrong', {
        description: message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Join the Waitlist</DialogTitle>
          <DialogDescription className="text-base">
            Be the first to know when we launch. We're teaming up with institutions to tackle
            this at scale.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              {...register('email')}
              disabled={isSubmitting}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* WhatsApp Field */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="text-sm font-medium">
              WhatsApp Number <span className="text-gray-400">(Optional)</span>
            </Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="9876543210"
              {...register('whatsapp')}
              disabled={isSubmitting}
              className={errors.whatsapp ? 'border-red-500' : ''}
              maxLength={10}
            />
            {errors.whatsapp && (
              <p className="text-sm text-red-500">{errors.whatsapp.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Enter your 10-digit mobile number
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              'Join now'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
