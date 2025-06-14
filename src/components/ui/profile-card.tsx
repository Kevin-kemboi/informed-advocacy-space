
import React from 'react'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, MapPin } from 'lucide-react'
import { getRoleBadgeColor } from '@/lib/supabase'

interface ProfileCardProps {
  user: {
    full_name: string
    role: string
    profile_pic_url?: string
    verified?: boolean
    location?: string
    bio?: string
  }
  size?: 'sm' | 'md' | 'lg'
  showBio?: boolean
}

export function ProfileCard({ user, size = 'md', showBio = false }: ProfileCardProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  }
  
  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex items-start gap-3"
    >
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={user.profile_pic_url} />
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          {user.full_name?.charAt(0) || 'U'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-semibold text-gray-900 ${textSizes[size]}`}>
            {user.full_name}
          </span>
          {user.verified && (
            <CheckCircle className="w-4 h-4 text-blue-500 fill-current" />
          )}
          {user.role !== 'citizen' && (
            <Badge variant="outline" className={`text-xs ${getRoleBadgeColor(user.role)}`}>
              {user.role.replace('_', ' ')}
            </Badge>
          )}
        </div>
        
        {user.location && (
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <MapPin className="w-3 h-3" />
            <span>{user.location}</span>
          </div>
        )}
        
        {showBio && user.bio && (
          <p className="text-sm text-gray-600 mt-1">{user.bio}</p>
        )}
      </div>
    </motion.div>
  )
}
