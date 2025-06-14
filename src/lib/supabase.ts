import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://mgjvxhvlvscckzeucwcn.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nanZ4aHZsdnNjY2t6ZXVjd2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MDA0NDgsImV4cCI6MjA2NTA3NjQ0OH0.b3hmwUJTRT48JIo5Pg2hRgvR9V4jOTKto3iiYrfdoUg"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Enhanced Database types
export interface User {
  id: string
  email: string
  full_name: string
  role: 'citizen' | 'government_official' | 'admin'
  status: 'active' | 'pending' | 'suspended' | 'banned'
  profile_pic_url?: string
  bio?: string
  location?: string
  verified: boolean
  created_at: string
}

export interface Post {
  id: string
  user_id: string
  content: string
  media_urls: string[]
  status: 'active' | 'flagged' | 'resolved' | 'archived'
  category: 'crime' | 'health' | 'education' | 'corruption' | 'environment' | 'emergency' | 'general'
  post_type: 'opinion' | 'incident' | 'feedback' | 'emergency'
  parent_id?: string
  likes_count: number
  reply_count: number
  repost_count: number
  flags_count: number
  moderation_status: 'active' | 'flagged' | 'hidden' | 'deleted'
  location?: string
  hashtags?: string[]
  created_at: string
  updated_at: string
  profiles?: {
    full_name: string
    email: string
    role: string
    profile_pic_url?: string
    verified: boolean
  }
  replies?: Post[]
}

export interface Poll {
  id: string
  user_id: string
  question: string
  options: { id: string; text: string; votes: number }[]
  total_votes: number
  status: 'active' | 'closed' | 'archived'
  expires_at: string | null
  created_at: string
  updated_at: string
  profiles?: {
    full_name: string
    email: string
    role: string
    profile_pic_url?: string
    verified: boolean
  }
}

export interface Vote {
  id: string
  poll_id: string
  user_id: string
  option_id: string
  created_at: string
}

export interface Like {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface Repost {
  id: string
  user_id: string
  post_id: string
  comment?: string
  created_at: string
}

export interface Report {
  id: string
  reporter_id: string
  post_id?: string
  poll_id?: string
  reason: string
  status: 'pending' | 'reviewed' | 'dismissed'
  reviewed_by?: string
  reviewed_at?: string
  created_at: string
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message?: string
  read: boolean
  related_post_id?: string
  related_user_id?: string
  created_at: string
}

// Utility functions
export const getRoleFromEmail = (email: string): 'citizen' | 'government_official' | 'admin' => {
  if (email.endsWith('@admin.gmail.com')) return 'admin'
  if (email.endsWith('@govt.gmail.com')) return 'government_official'
  return 'citizen'
}

export const validateEmailDomain = (email: string, role: string): boolean => {
  const detectedRole = getRoleFromEmail(email)
  return detectedRole === role
}

export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInMinutes < 1) return 'just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m`
  if (diffInHours < 24) return `${diffInHours}h`
  if (diffInDays < 7) return `${diffInDays}d`
  
  return date.toLocaleDateString()
}

export const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'crime': return 'bg-red-100 text-red-800'
    case 'health': return 'bg-green-100 text-green-800'
    case 'education': return 'bg-blue-100 text-blue-800'
    case 'corruption': return 'bg-purple-100 text-purple-800'
    case 'environment': return 'bg-emerald-100 text-emerald-800'
    case 'emergency': return 'bg-orange-100 text-orange-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export const getRoleBadgeColor = (role: string): string => {
  switch (role) {
    case 'admin': return 'bg-red-100 text-red-800 border-red-200'
    case 'government_official': return 'bg-blue-100 text-blue-800 border-blue-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}
