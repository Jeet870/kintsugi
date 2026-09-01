import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { UserIcon, Link01Icon, CheckmarkCircle02Icon, SparklesIcon } from '@hugeicons/core-free-icons'

import { useProfile } from '@/features/profile/hooks/useProfile'
import { useUpdateProfile } from '@/features/settings/hooks/useUpdateProfile'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

const profileEditSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(50, { message: 'Name cannot exceed 50 characters' }),
  avatar_url: z
    .string()
    .trim()
    .url({ message: 'Please enter a valid image URL' })
    .or(z.literal(''))
    .optional(),
})

export type ProfileEditFormValues = z.infer<typeof profileEditSchema>

export interface ProfileEditFormProps {
  className?: string
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = React.memo(({ className = '' }) => {
  const { data: profileData, isLoading } = useProfile()
  const { mutate: updateProfile, isPending } = useUpdateProfile()

  const user = profileData?.user

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfileEditFormValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      name: '',
      avatar_url: '',
    },
  })

  /* Synchronize form defaultValues when profile loads */
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        avatar_url: user.avatar_url || '',
      })
    }
  }, [user, reset])

  const avatarUrlWatch = watch('avatar_url')
  const nameWatch = watch('name')

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.trim().split(' ')
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      return name.substring(0, 2).toUpperCase()
    }
    if (email) return email.substring(0, 2).toUpperCase()
    return 'U'
  }

  const onSubmit = (values: ProfileEditFormValues) => {
    updateProfile({
      name: values.name.trim(),
      avatar_url: values.avatar_url?.trim() || null,
    })
  }

  return (
    <Card className={`overflow-hidden rounded-2xl border-border bg-card shadow-xl text-left h-full flex flex-col justify-between transition-colors duration-250 hover:border-amber-500/40 ${className}`}>
      <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border bg-muted/30 flex flex-row items-center justify-between space-y-0 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 shadow-md">
            <HugeiconsIcon icon={UserIcon} className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg font-bold text-foreground font-serif">
              Personal Profile Details
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="w-16 h-16 rounded-full bg-muted" />
            <Skeleton className="w-full h-10 bg-muted rounded-lg" />
            <Skeleton className="w-full h-10 bg-muted rounded-lg" />
          </div>
        )}

        {!isLoading && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 flex-1 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Live Avatar Preview Header */}
              <div className="flex items-center gap-4 p-3.5 rounded-xl border border-border bg-muted/20">
                <Avatar className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-violet-500/30 ring-2 ring-violet-500/10 shrink-0">
                  <AvatarImage src={avatarUrlWatch || user?.avatar_url || undefined} alt="Avatar preview" />
                  <AvatarFallback className="bg-violet-700 text-white font-bold font-serif text-lg">
                    {getInitials(nameWatch || user?.name || undefined, user?.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-foreground flex items-center gap-1.5 font-serif">
                    <HugeiconsIcon icon={SparklesIcon} className="w-3.5 h-3.5 text-violet-500" />
                    <span>Live Avatar Preview</span>
                  </p>
                  <p className="text-muted-foreground text-[11px] leading-relaxed font-sans">
                    Updating your avatar URL will refresh your profile picture globally across Kintsugi.
                  </p>
                </div>
              </div>

              {/* Name Field */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-foreground">
                  Display Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your preferred name"
                  className="h-10 bg-background border-border text-foreground placeholder:text-muted-foreground rounded-lg text-xs"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-[11px] text-rose-400 font-sans mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Avatar URL Field */}
              <div className="space-y-1.5">
                <Label htmlFor="avatar_url" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <HugeiconsIcon icon={Link01Icon} className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Avatar Image URL (Optional)</span>
                </Label>
                <Input
                  id="avatar_url"
                  placeholder="https://example.com/avatar.jpg"
                  className="h-10 bg-background border-border text-foreground placeholder:text-muted-foreground rounded-lg text-xs font-mono"
                  {...register('avatar_url')}
                />
                {errors.avatar_url && (
                  <p className="text-[11px] text-rose-400 font-sans mt-1">{errors.avatar_url.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full sm:w-auto h-10 px-6 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs rounded-lg shadow-lg shadow-violet-600/20 gap-2 cursor-pointer min-h-[44px]"
                >
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4" />
                  <span>{isPending ? 'Saving Settings...' : 'Save Profile Changes'}</span>
                </Button>
              </motion.div>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
})

ProfileEditForm.displayName = 'ProfileEditForm'

export default ProfileEditForm
